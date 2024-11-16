import { PathMethod } from '../../path-method';

export type RejectedData = PathMethod & {
    rejected: {
        avg: number;
        values: { timestamp: string; value: boolean }[];
        _id: { service: string; sync: boolean };
    }[];
};
