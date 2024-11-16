import { ChartOptions } from 'chart.js';
import { Chart } from '../model/internal/chart';

const defaultChartOptions: ChartOptions = {
    aspectRatio: 2,
    color: 'white',
    responsive: true,
    animation: { duration: 0 },
};

const defaultScaleChartOptions: ChartOptions = {
    ...defaultChartOptions,
    scales: {
        xAxes: {
            ticks: { color: 'white' },
            grid: { color: '#aaaaaa32' },
        },
        yAxes: {
            ticks: { color: 'white' },
            grid: { color: '#aaaaaa32' },
        },
    },
};

const defaultPercentageChartOptions: ChartOptions = {
    ...defaultScaleChartOptions,
    scales: {
        ...defaultScaleChartOptions.scales,
        yAxes: {
            ...defaultScaleChartOptions.scales!['yAxes'],
            ticks: {
                ...defaultScaleChartOptions.scales!['yAxes']!.ticks,
                callback: (value) => `${+value * 100}%`,
            },
            max: 1,
            min: 0,
        },
    },
};

export const defaultBarChart = (chart: any): Chart => ({
    options: defaultScaleChartOptions,
    type: 'bar',
    showLegend: false,
    ...chart,
});

export const defaultPercentageBarChart = (chart: any): Chart => ({
    type: 'bar',
    showLegend: false,
    options: {
        ...defaultPercentageChartOptions,
        plugins: {
            tooltip: {
                callbacks: {
                    label: (item) => `${(item.raw as number) * 100}%`,
                },
            },
        },
    },
    ...chart,
});

export const defaultLineChart = (chart: any): Chart => ({
    options: defaultScaleChartOptions,
    type: 'line',
    showLegend: true,
    ...chart,
});

export const defaultPercentageLineChart = (chart: any): Chart => ({
    options: {
        ...defaultPercentageChartOptions,
        plugins: {
            tooltip: {
                callbacks: {
                    label: (item) =>
                        `${item.dataset.label}: ${(item.raw as number) * 100}%`,
                },
            },
        },
    },
    type: 'line',
    showLegend: true,
    ...chart,
});

export const defaultTrueFalseLineChart = (chart: any): Chart => ({
    options: {
        ...defaultScaleChartOptions,
        plugins: {
            tooltip: {
                callbacks: {
                    label: (item) =>
                        `${item.dataset.label}: ${!!(item.raw as number)}`,
                },
            },
        },
        scales: {
            ...defaultScaleChartOptions.scales,
            yAxes: {
                ...defaultScaleChartOptions.scales!['yAxes'],
                ticks: {
                    ...defaultScaleChartOptions.scales!['yAxes']!.ticks,
                    callback: (value) =>
                        value === 1 || value === 0 ? !!value : null,
                },
            },
        },
    },
    type: 'line',
    showLegend: true,
    ...chart,
});

export const defaultDoughnutChart = (chart: any): Chart => ({
    options: defaultChartOptions,
    type: 'doughnut',
    showLegend: true,
    ...chart,
});
