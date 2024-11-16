import { randomUUID } from 'crypto';
import { SyncToAsyncIpcConfig } from './types/sync-to-async-ipc-config';
import { EvaluatedResult } from './types/evaluated-result';

/**
 * Representation of a parallel run.
 */
export class ParallelRun {
    /**
     * Timestamp the run is started.
     */
    readonly timestamp = new Date();

    /**
     * Unique ID for the parallel run.
     */
    readonly runId = randomUUID();

    /**
     * Received synchronous results.
     */
    readonly synchronousResults: EvaluatedResult[] = [];

    /**
     * Received asynchronous results.
     */
    readonly asynchronousResults: EvaluatedResult[] = [];

    /**
     * @param path Synchronous HTTP path.
     * @param method Synchronous HTTP method.
     * @param runConfig Optional run configuration (only if run is not ignored).
     * @param ignoredCause Optional cause for ignoring the run (only if run is ignored).
     */
    constructor(
        readonly path: string,
        readonly method: string,
        readonly runConfig?: SyncToAsyncIpcConfig,
        readonly ignoredCause?: string
    ) {}
}
