import { ChartDataset, ChartOptions, ChartType } from 'chart.js';

export type Chart = {
    large: boolean;
    tags: string[];
    titleKey: string;
    titleParams?: { [k: string]: string };
    options: ChartOptions;
    labels: string[];
    type: ChartType;
    showLegend: boolean;
    data: ChartDataset[];
};
