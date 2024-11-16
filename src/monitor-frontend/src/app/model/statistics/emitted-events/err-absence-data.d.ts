import { PathMethod } from '../../path-method';

export type ErrAbsenceData = PathMethod & {
    errAbsence: {
        data: {
            errSchema: string;
            avg: number;
            values: { timestamp: string; value: number }[];
        }[];
        service: string;
        sync: boolean;
    }[];
};
