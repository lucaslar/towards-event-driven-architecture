import { PerformanceChartsGroup } from './performance-charts-group';

export class PathMethodDataGroup {
    charts?: PerformanceChartsGroup;
    count?: number;
    selectedTags?: { [k: string]: boolean };
}
