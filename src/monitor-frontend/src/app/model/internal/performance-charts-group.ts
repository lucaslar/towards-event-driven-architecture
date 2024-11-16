import { Chart } from './chart';

export class PerformanceChartsGroup {
    ignoreCount?: Chart;
    avgLatencies?: Chart;
    latenciesTime?: Chart;
    avgRejected?: Chart;
    rejectedTime?: Chart;
    avgCompletion?: Chart;
    completionTime?: Chart;
    avgErrAbsence?: Chart;
    errAbsenceTime?: { [pattern: string]: Chart };
}
