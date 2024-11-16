export type SyncToAsyncIpcConfig = {
    comparedPropertyIfExists: string;
    removeNullValuesInComparison: boolean;
    asyncChannel?: string | null;
    checkErrors: string[];
    completeIf: string[];
    expectedSize: number;
};
