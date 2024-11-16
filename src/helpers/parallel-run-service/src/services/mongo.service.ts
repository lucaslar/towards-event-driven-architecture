import { MongoClient } from 'mongodb';
import { QualityStatistic } from '../model/types/quality-statistic';
import { ParallelRun } from '../model/parallel-run';

/**
 * Name of the (Mongo) DB to connect to.
 */
const dbName = 'teda_statistics';

/**
 * Mongo DB host - defaults to localhost.
 */
const host = process.env.MONGO_HOST ?? 'localhost';

/**
 * Mongo DB port - defaults to 27017.
 */
const port = process.env.MONGO_PORT ?? '27017';

/**
 * Mongo DB Client connector.
 */
const client = new MongoClient(`mongodb://${host}:${port}`);

/**
 * @param name Name of the Mongo collection to be returned.
 * @return Mongo collection matching the given name (db = {{ dbName }}).
 */
const getCollection = (name: string) => client.db(dbName).collection(name);

/**
 * @return Path/method dictionary collection.
 */
const dictCollection = () => getCollection('path-dict');

/**
 * @return Quality statistics collection.
 */
const statsCollection = () => getCollection('quality-statistics');

/**
 * @return Ignored runs collection.
 */
const ignoredCollection = () => getCollection('ignored-runs');

/**
 * @return Run history collection.
 */
const runHistoryCollection = () => getCollection('parallel-run-history');

/**
 * @return Source of truth results collection.
 */
const sotResultsCollection = () => getCollection('source-of-truth-results');

/**
 * Time results are to be stored in the Mongo DB.
 */
const resultHistoryStorageDuration = 30 * 60 * 24 * 30; // 30 days (in seconds)

/**
 * @param path Path the results are to be returned for.
 * @param method Method the results are to be returned for.
 * @param field Field the data is to be collected for.
 * @param $avg name of the field containing the value the average of is to be calculated (defaults to field param).
 * @return Calculated average + values matching the given parameters.
 */
const getAvgAndValuesForPathAndMethod = (
    path: string,
    method: string,
    field: string,
    $avg: any = field
) => {
    return statsCollection()
        .aggregate([
            { $match: { method, path } },
            {
                $group: {
                    _id: { service: '$service', sync: '$sync' },
                    values: {
                        $push: { value: field, timestamp: '$timestamp' },
                    },
                    avg: { $avg },
                },
            },
        ])
        .toArray();
};

/**
 * Connects to the MongoDB. In case of no established connection within 3 seconds, an error is trown.
 */
export const connectToMongoDb = async () => {
    const timeout = 3000;
    const timeoutMsg = `Connection attempt to MongoDB timed out (exceeded ${timeout} ms).`;

    const timeoutPromise = new Promise((res, rej) => {
        setTimeout(() => rej(new Error(timeoutMsg)), timeout);
    });
    await Promise.race([client.connect(), timeoutPromise]);
};

/**
 * @param data Method, path and ID to be upserted.
 * @return Update result.
 */
export const upsertMethodPathId = (data: {
    path: string;
    method: string;
    runId: string;
}) => dictCollection().updateOne(data, { $set: data }, { upsert: true });

/**
 * @return List of all unique combinations of path and method.
 */
export const getMethodsAndPaths = () => {
    return dictCollection()
        .aggregate([{ $group: { _id: { path: '$path', method: '$method' } } }])
        .toArray();
};

/**
 * @param path Path.
 * @param method Method.
 * @return Number of runs matching the given path and method.
 */
export const getCountForPathAndMethod = async (
    path: string,
    method: string
) => {
    return dictCollection().countDocuments({ path, method });
};

/**
 * @param statistics Statistics to be upserted.
 * @return Update result.
 */
export const upsertQualityStats = (statistics: QualityStatistic[]) => {
    return Promise.all(
        statistics.map((qs) => {
            return statsCollection().updateOne(
                { runId: qs.runId, service: qs.service, sync: qs.sync },
                { $set: qs },
                { upsert: true }
            );
        })
    );
};

/**
 * @param pr Parallel Run to be upserted (automatically deleted after 30 days).
 * @return Update result.
 */
export const upsertParallelRunWithExpiration = async (pr: ParallelRun) => {
    await runHistoryCollection().createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: resultHistoryStorageDuration }
    );

    return runHistoryCollection().updateOne(
        { runId: pr.runId },
        { $set: { ...pr, createdAt: new Date() } },
        { upsert: true }
    );
};

/**
 * @return List containing complete parallel run history.
 */
export const getParallelRunHistory = () => {
    return runHistoryCollection().find().toArray();
};

/**
 * @return Number of stored parallel runs.
 */
export const getCountForParallelRunHistory = async () => {
    return runHistoryCollection().countDocuments();
};

/**
 * @param result Result from a source of truth to be upserted (automatically deleted after 30 days).
 * @return Insert result.
 */
export const insertSourceOfTruthResult = async (result: {
    id: string;
    status?: number;
    resultData: any;
}) => {
    await sotResultsCollection().createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: resultHistoryStorageDuration }
    );

    return sotResultsCollection().insertOne({
        ...result,
        createdAt: new Date(),
    });
};

/**
 * @param id ID the source of truth result is to be calculated for.
 * @return Source of truth result matching the given ID.
 */
export const getSourceOfTruthResult = async (id: string) => {
    return sotResultsCollection().findOne({ id });
};

/**
 * @param pr Ignored parallel run data to be upserted.
 * @return Update result.
 */
export const upsertIgnoredStat = (pr: ParallelRun) => {
    return ignoredCollection().updateOne(
        { runId: pr.runId },
        { $set: pr },
        { upsert: true }
    );
};

/**
 * @param path Path the ignored runs are to be counted for.
 * @param method Method the ignored runs are to be counted for.
 * @return Number of ignored/unignored runs matching the given path/method.
 */
export const getIgnoreCountForPathAndMethod = async (
    path: string,
    method: string
) => {
    const count = await ignoredCollection()
        .aggregate([
            { $match: { path, method } },
            {
                $project: {
                    ignored: {
                        $cond: [{ $ne: ['$ignoredCause', null] }, 1, 0],
                    },
                    notIgnored: {
                        $cond: [{ $ne: ['$ignoredCause', null] }, 0, 1],
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    ignored: { $sum: '$ignored' },
                    notIgnored: { $sum: '$notIgnored' },
                },
            },
        ])
        .toArray();

    const { _id, ...data } = count[0];
    return data;
};

/**
 * @param path Path the latency data is to be calculated for.
 * @param method Method the latency data is to be calculated for.
 * @return Latency data matching the given path/method.
 */
export const getAvgLatenciesAndValuesForPathAndMethod = async (
    path: string,
    method: string
) => getAvgAndValuesForPathAndMethod(path, method, '$quality.latency');

/**
 * @param path Path the completion data is to be calculated for.
 * @param method Method the completion data is to be calculated for.
 * @return Completion data matching the given path/method.
 */
export const getAvgCompletionAndValuesForPathAndMethod = async (
    path: string,
    method: string
) => getAvgAndValuesForPathAndMethod(path, method, '$quality.completionStatus');

/**
 * @param path Path the rejected/accepted data is to be calculated for.
 * @param method Method the rejected/accepted data is to be calculated for.
 * @return Rejected/accepted data matching the given path/method.
 */
export const getAvgRejectedAndValuesForPathAndMethod = async (
    path: string,
    method: string
) => {
    return getAvgAndValuesForPathAndMethod(path, method, '$quality.rejected', {
        $cond: ['$quality.rejected', 1, 0],
    });
};

/**
 * @param path Path the error absence data is to be calculated for.
 * @param method Method the error absence data is to be calculated for.
 * @return Error absence data matching the given path/method.
 */
export const getAvgErrAbsenceAndValuesForPathAndMethod = async (
    path: string,
    method: string
) => {
    const stats = await statsCollection()
        .aggregate([
            { $match: { method, path } },
            {
                $addFields: {
                    values: { $objectToArray: '$quality.errAbsence' },
                },
            },
            { $unwind: '$values' },
            {
                $project: {
                    service: 1,
                    sync: 1,
                    timestamp: 1,
                    errKey: '$values.k',
                    errValue: '$values.v',
                },
            },
            {
                $group: {
                    _id: {
                        service: '$service',
                        sync: '$sync',
                        errSchema: '$errKey',
                    },
                    avg: { $avg: '$errValue' },
                    values: {
                        $push: { value: '$errValue', timestamp: '$timestamp' },
                    },
                },
            },
        ])
        .toArray();

    const summarized = stats.reduce((prev, curr) => {
        return {
            ...prev,
            [curr._id.service]: {
                ...prev[curr._id.service],
                [curr._id.sync]: [
                    ...(prev[curr._id.service]
                        ? prev[curr._id.service][curr._id.sync] ?? []
                        : []),
                    {
                        errSchema: curr._id.errSchema,
                        avg: curr.avg,
                        values: curr.values,
                    },
                ],
            },
        };
    }, {});

    return Object.keys(summarized).reduce((prev, curr) => {
        return [
            ...prev,
            ...Object.keys(summarized[curr]).flatMap((sync) => ({
                service: curr,
                sync: sync === 'true',
                data: summarized[curr][sync],
            })),
        ];
    }, [] as any[]);
};
