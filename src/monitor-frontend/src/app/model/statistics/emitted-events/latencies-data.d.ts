import { PathMethod } from '../../path-method';

export type LatenciesData = PathMethod & {
    latencies: {
        avg: number;
        values: { timestamp: string; value: number }[];
        _id: { service: string; sync: boolean };
    }[];
};
