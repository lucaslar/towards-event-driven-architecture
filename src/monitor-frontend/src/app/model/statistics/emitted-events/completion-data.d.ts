import { PathMethod } from '../../path-method';

export type CompletionData = PathMethod & {
    completion: {
        avg: number;
        values: { timestamp: string; value: number }[];
        _id: { service: string; sync: boolean };
    }[];
};
