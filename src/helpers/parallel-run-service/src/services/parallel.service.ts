import {
    asyncTestedConfigs,
    loggingConfig,
    sourceOfTruth,
    syncTestedConfigs,
    syncToAsyncIpc,
} from './config.service';
import { Request, Response } from 'express';
import { IncomingMessage } from 'http';
import { SyncClientImpl } from '../model/sync-client-impl';
import { AsyncClientImpl } from '../model/async-client-impl';
import { ParallelRun } from '../model/parallel-run';
import { performance } from 'perf_hooks';
import { SyncResponse } from '../model/types/sync-response';
import { ServiceConfig } from '../model/types/service-config';
import { isEqualContent } from '../model/functions/json-functions';
import { SyncToAsyncIpcConfig } from '../model/types/sync-to-async-ipc-config';
import { Quality } from '../model/types/quality';
import { createStats } from './statistics.service';
import {
    getCountForParallelRunHistory,
    getSourceOfTruthResult,
    insertSourceOfTruthResult,
} from './mongo.service';

/**
 * Message if a run is ignored due to no definition for a parallel run.
 */
const ignNotDefined =
    'Path/method of initial request not defined for parallel run.';

/**
 * Message if a run is ignored due to one or more closed socket connections.
 */
const ignSocketsClosed = 'At least one socket connection was closed on requesting.';

/**
 * Client implementation representing the source of truth.
 */
let sotImpl: SyncClientImpl; // would have to support both types if "async => sync" was implemented, too

/**
 * List of all synchronous client implementations.
 */
let syncServices: SyncClientImpl[] = [];

/**
 * List of all asynchronous client implementations.
 */
let asyncServices: AsyncClientImpl[] = [];

/**
 * Logs the outcome of a parallel run based on the logging configuration
 * and emits it.
 *
 * @param pr Parallel run to be logged.
 */
const manageOutcome = async (pr: ParallelRun) => {
    if (loggingConfig.logServiceResults) console.dir(pr, { depth: null });
    else {
        const tempPr: ParallelRun = JSON.parse(JSON.stringify(pr));
        [...tempPr.synchronousResults, ...tempPr.asynchronousResults]?.forEach(
            (r) => delete r.response
        );
        console.dir(tempPr, { depth: null });
    }

    await createStats(pr);

    console.log(
        `Total number of parallel runs (unique Run IDs in the last 30 days): ${await getCountForParallelRunHistory()}`
    );
};

/**
 * Starts a parallel run for both synchronous and asynchronous configurations.
 *
 * @param pr Parallel run object initiating the run.
 * @param queryData Query data of the original request.
 */
const startParallelRun = async (pr: ParallelRun, queryData: any) => {
    const syncRequests = syncServices.map((s) => {
        return s.handleHttpRequest(pr.path, pr.method, queryData);
    });

    asyncServices.forEach((s) => {
        const callback = (latency: number, data: any) =>
            validateAsync(pr, s.config, latency, data);
        s.send(queryData, pr.runId, callback, pr.runConfig?.asyncChannel);
    });

    (await Promise.allSettled(syncRequests)).forEach((r, i) => {
        const service = syncTestedConfigs[i];
        r.status === 'fulfilled'
            ? validateSync(pr, service, r.value.latency, r.value.result)
            : validateFailedSync(pr, service, r.reason);
    });
};

/**
 * Determines the absence of errors based on the configured patterns for a given result.
 *
 * @param result Result object to be checked.
 * @param config Configuration containing patterns the error absence is to be determined for.
 * @return Object with patterns as keys and percentage of absence as values or undefined if the compared property does not exist.
 */
const determineErrAbsenceForResult = (
    result: any,
    config: SyncToAsyncIpcConfig
): { [k: string]: number } | undefined => {
    const value = result[config.comparedPropertyIfExists];
    if (!value) return undefined;
    else {
        return config.checkErrors
            .map((pattern) => {
                const splitPattern = pattern.split('[*].').filter((x) => !!x);
                const err: number[] = splitPattern
                    .reduce(
                        (p, c, i) => {
                            if (i === 0) return p;
                            else {
                                return p
                                    .filter((x: any) => !!x)
                                    .flatMap((x: any) => x[c]);
                            }
                        },
                        value
                            .filter((x: any) => !!x)
                            .flatMap((v: any) => v[splitPattern[0]])
                    )
                    .map((x: any) => (!x ? 1 : 0));
                const errAbsence = err?.length
                    ? err.reduce((a, b) => a + b) / err.length
                    : 1;
                return { [pattern]: errAbsence };
            })
            .reduce((p, c) => ({ ...p, ...c }), {});
    }
};

/**
 * Determines the completeness of a result based on the configured indicating patterns and expected size.
 *
 * @param result Result object to be checked.
 * @param config Configuration containing patterns indicating a result's completeness and the expected size.
 * @return Percentage of completeness.
 */
const determineCompletenessForResult = (
    result: any,
    config: SyncToAsyncIpcConfig
): number => {
    const value = result[config.comparedPropertyIfExists];
    if (!value) return 0;
    else {
        const completionStatus: boolean[] = value.map((serviceRes: any) => {
            return config.completeIf.some((pattern) => {
                const splitPattern = pattern.split('[*].').filter((x) => !!x);
                if (!serviceRes[splitPattern[0]]) return false;
                else {
                    const foundData: number[] = splitPattern.reduce(
                        (p, c, i) => {
                            if (i === 0) return p;
                            else if (p === undefined) return undefined;
                            else if (p.length === 0) return undefined;
                            else return p.flatMap((x: any) => x[c]);
                        },
                        serviceRes[splitPattern[0]]
                    );
                    return (
                        foundData === undefined ||
                        foundData.filter((x) => x !== undefined).length ===
                            foundData.length
                    );
                }
            });
        });

        return (
            completionStatus.map((x) => +x).reduce((a, b) => a + b) /
            config.expectedSize
        );
    }
};

/**
 * Measures quality for a given result.
 *
 * @param pr Parallel run the result belongs to.
 * @param latency Measured latency for request => response.
 * @param resultData Received result data, as {{ SyncResponse }} for synchronous results.
 * @param rejected True if the request was rejected, false if not.
 * @return Quality object.
 */
const measureQuality = (
    pr: ParallelRun,
    latency: number,
    resultData: SyncResponse,
    rejected: boolean
): Quality => {
    return {
        latency,
        rejected,
        completionStatus: determineCompletenessForResult(
            resultData,
            pr.runConfig!
        ),
        errAbsence: determineErrAbsenceForResult(resultData, pr.runConfig!),
    };
};

/**
 * Validates an asynchronous result.
 *
 * @param pr Parallel run the result belongs to.
 * @param config Configuration of the service that received the result.
 * @param latency Measured latency for request => response.
 * @param resultData Received result data.
 */
const validateAsync = async (
    pr: ParallelRun,
    config: ServiceConfig,
    latency: number,
    resultData: any
) => {
    const quality = measureQuality(pr, latency, resultData, false);
    const sotResult = await getSourceOfTruthResult(pr.runId);
    if (!config.sourceOfTruth && sotResult) {
        quality.differences = !isEqualContent(
            sotResult.resultData,
            resultData,
            pr.runConfig!
        );
    }
    const found = pr.asynchronousResults.find((r) => r.config === config);
    if (found && latency > found.quality.latency) {
        found.quality = quality;
        found.response = resultData;
        await manageOutcome(pr);
    } else if (!found) {
        pr.asynchronousResults.push({ config, quality, response: resultData });
        await manageOutcome(pr);
    }
};

/**
 * Validates a synchronous result.
 *
 * @param pr Parallel run the result belongs to.
 * @param config Configuration of the service that received the result.
 * @param latency Measured latency for request => response.
 * @param response Response object.
 */
const validateSync = async (
    pr: ParallelRun,
    config: ServiceConfig,
    latency: number,
    response: SyncResponse
) => {
    const quality = measureQuality(pr, latency, response.resultData, false);
    const sotResult = await getSourceOfTruthResult(pr.runId);
    if (!config.sourceOfTruth && sotResult) {
        quality.differences =
            response.status !== sotResult.status ||
            !isEqualContent(
                sotResult.resultData,
                response.resultData,
                pr.runConfig!
            );
    }

    pr.synchronousResults.push({ config, quality, response });
    await manageOutcome(pr);
};

/**
 * Handles a failed synchronous request
 *
 * @param pr Parallel run the result belongs to.
 * @param config Configuration of the service that received the result.
 * @param r Response object including a reason for the failure and the latency.
 */
const validateFailedSync = (
    pr: ParallelRun,
    config: ServiceConfig,
    r: { reason: any; latency: number }
) => {
    const quality = { latency: r.latency, rejected: true, completionStatus: 0 };
    pr.synchronousResults.push({ config, quality, response: r.reason });
};

/**
 * Starts a parallel request/run based on a prior, proxied request.
 *
 * @param req Original request.
 * @param res Original response.
 * @param resultValidationCallback Callback function to be executed for validating results.
 */
const parallelRequest = async (
    req: Request,
    res: Response,
    resultValidationCallback: (pr: ParallelRun, latency: number) => void
) => {
    const latency = performance.now() - res.locals.performance; // defined at the beginning in order to not distort value
    const { path, method } = req;
    let ignored = undefined;
    let runConfig = undefined;
    if (asyncServices.some((a) => !a.isRunning)) ignored = ignSocketsClosed;
    else if (!syncToAsyncIpc[path] || !syncToAsyncIpc[path][method]) {
        ignored = ignNotDefined;
    } else runConfig = syncToAsyncIpc[path][method];

    const pr = new ParallelRun(path, method, runConfig, ignored);

    if (ignored) {
        console.warn('Parallel run ignored: ' + ignored);
        await manageOutcome(pr);
    } else {
        await resultValidationCallback(pr, latency);
        await startParallelRun(pr, req.body);
    }
};

/**
 * Starts a parallel run for a successful request.
 *
 * @param proxyRes Proxy response.
 * @param req Original request.
 * @param res Original response.
 */
export const parallelRequestSuccess = async (
    proxyRes: IncomingMessage,
    req: Request,
    res: Response
) => {
    await parallelRequest(
        req,
        res,
        async (pr: ParallelRun, latency: number) => {
            const result = await sotImpl.handleRes(proxyRes);
            await insertSourceOfTruthResult({ ...result, id: pr.runId });
            await validateSync(pr, sotImpl.config, latency, result);
        }
    );
};

/**
 * Starts a parallel run for a failed request.
 *
 * @param err Received error.
 * @param req Original request.
 * @param res Original response.
 */
export const parallelRequestErr = async (
    err: any,
    req: Request,
    res: Response
) => {
    await parallelRequest(req, res, (pr: ParallelRun, latency: number) =>
        validateFailedSync(pr, sotImpl.config, { latency, reason: err })
    );
};

/**
 * Initializes all client implementations based on the validated service configurations (config service).
 */
export const initializeImplementations = (): void => {
    sotImpl = new SyncClientImpl(sourceOfTruth);
    asyncServices = asyncTestedConfigs.map((ac) => new AsyncClientImpl(ac));
    syncServices = syncTestedConfigs.map((sc) => new SyncClientImpl(sc));
    console.log('Service implementations initialized.');
};
