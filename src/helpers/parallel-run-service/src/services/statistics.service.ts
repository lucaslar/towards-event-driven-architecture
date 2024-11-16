import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import {
    asyncTestedConfigs,
    sourceOfTruth,
    syncTestedConfigs,
} from './config.service';
import { ParallelRun } from '../model/parallel-run';
import {
    getAvgCompletionAndValuesForPathAndMethod,
    getAvgErrAbsenceAndValuesForPathAndMethod,
    getAvgLatenciesAndValuesForPathAndMethod,
    getAvgRejectedAndValuesForPathAndMethod,
    getCountForPathAndMethod,
    getIgnoreCountForPathAndMethod,
    getMethodsAndPaths,
    getParallelRunHistory,
    upsertIgnoredStat,
    upsertMethodPathId,
    upsertParallelRunWithExpiration,
    upsertQualityStats,
} from './mongo.service';
import { QualityStatistic } from '../model/types/quality-statistic';

/**
 * Socket IO server.
 */
let io: Server;

/**
 * Initializes the socket and emits the current config info on connecting.
 *
 * @param http HTTP server the socket is to run on.
 */
export const initializeSocket = (http: HttpServer) => {
    io = require('socket.io')(http);

    io.on('connection', async (socket) => {
        console.log('A monitor frontend connected to this service.');

        socket.emit('config-info', [
            sourceOfTruth,
            ...syncTestedConfigs,
            ...asyncTestedConfigs,
        ]);

        socket.emit('parallel-run-history', await getParallelRunHistory());

        (await getMethodsAndPaths()).forEach((mp) => {
            emitCalculatedStatistics(mp._id.path, mp._id.method, socket);
        });

        socket.on('disconnect', () => {
            console.log('A monitor frontend disconnected.');
        });
    });
};

/**
 * Emits calculated statistics for a given path/method to one or all receivers.
 *
 * @param path Path statistics are to be emitted for.
 * @param method Method statistics are to be emitted for.
 * @param receiver Client(s) to receive the emitted statistics (default = io, i.e. all).
 */
const emitCalculatedStatistics = async (
    path: string,
    method: string,
    receiver: Socket | Server = io
) => {
    const [count, ignoreCount, latencies, rejected, completion, errAbsence] =
        await Promise.all([
            getCountForPathAndMethod(path, method),
            getIgnoreCountForPathAndMethod(path, method),
            getAvgLatenciesAndValuesForPathAndMethod(path, method),
            getAvgRejectedAndValuesForPathAndMethod(path, method),
            getAvgCompletionAndValuesForPathAndMethod(path, method),
            getAvgErrAbsenceAndValuesForPathAndMethod(path, method),
        ]);

    receiver.emit('path-method-count', { path, method, count });
    receiver.emit('ignore-count', { path, method, ...ignoreCount });

    if (latencies?.length) {
        receiver.emit('latencies-stats', { path, method, latencies });
    }

    if (rejected?.length) {
        receiver.emit('rejected-stats', { path, method, rejected });
    }

    if (completion.length) {
        receiver.emit('completion-stats', { path, method, completion });
    }

    if (errAbsence.length) {
        receiver.emit('err-absence-stats', { path, method, errAbsence });
    }
};

/**
 * Processes a parallel run result, i.e. transforms, persists and broadcasts it.
 *
 * @param pr Result to be broadcast and persisted.
 */
export const createStats = async (pr: ParallelRun) => {
    const { method, path, runId, timestamp } = pr;
    const qualityStats: QualityStatistic[] = [
        ...pr.synchronousResults,
        ...pr.asynchronousResults,
    ].map((r) => ({
        service: r.config.name,
        sync: r.config.sync,
        quality: r.quality,
        runId,
        method,
        path,
        timestamp,
    }));

    await Promise.all([
        upsertMethodPathId({ method, path, runId }),
        upsertQualityStats(qualityStats),
        upsertIgnoredStat(pr),
        upsertParallelRunWithExpiration(pr),
    ]);

    io.emit('parallel-run-result', pr);
    await emitCalculatedStatistics(pr.path, pr.method);
};
