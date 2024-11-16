import { EvaluatedResult } from './evaluated-result';
import { SyncToAsyncIpcConfig } from './sync-to-async-ipc-config';

export type ParallelRun = {
    readonly timestamp: Date;
    readonly runId: string;
    readonly synchronousResults: EvaluatedResult[];
    readonly asynchronousResults: EvaluatedResult[];
    readonly path: string;
    readonly method: string;
    readonly runConfig?: SyncToAsyncIpcConfig;
    readonly ignoredCause?: string;
};
