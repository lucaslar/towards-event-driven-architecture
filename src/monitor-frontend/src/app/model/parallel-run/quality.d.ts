export type Quality = {
    latency: number;
    rejected: boolean;
    completionStatus?: number;
    errAbsence?: { [k: string]: number };
    differences?: boolean;
};
