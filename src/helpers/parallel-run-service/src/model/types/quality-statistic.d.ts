import { Quality } from './quality';

export type QualityStatistic = {
    service: string;
    sync: boolean;
    quality: Quality;
    runId: string;
    method: string;
    path: string;
    timestamp: Date;
};
