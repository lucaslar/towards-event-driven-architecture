import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { ServiceConfig } from '../model/service-config';
import { PathMethod } from '../model/path-method';
import { CompletionData } from '../model/statistics/emitted-events/completion-data';
import { LatenciesData } from '../model/statistics/emitted-events/latencies-data';
import { ErrAbsenceData } from '../model/statistics/emitted-events/err-absence-data';
import { PerformanceChartsGroup } from '../model/internal/performance-charts-group';
import {
    defaultBarChart,
    defaultDoughnutChart,
    defaultLineChart,
    defaultPercentageBarChart,
    defaultPercentageLineChart,
    defaultTrueFalseLineChart,
} from '../etc/chart-consts';
import { CountData } from '../model/statistics/emitted-events/count-data';
import { PathMethodDataGroup } from '../model/internal/path-method-data-group';
import { IgnoreCountData } from '../model/statistics/emitted-events/ignore-count-data';
import { TranslateService } from '@ngx-translate/core';
import { RejectedData } from '../model/statistics/emitted-events/rejected-data';
import { ParallelRun } from '../model/parallel-run/parallel-run';

@Injectable({
    providedIn: 'root',
})
export class StatisticsService {
    private socket!: Socket;

    configData?: ServiceConfig[];
    private _history?: { [key: string]: ParallelRun };

    statistics: {
        [path: string]: { [method: string]: PathMethodDataGroup };
    } = {};

    constructor(private readonly translate: TranslateService) {}

    setupSocketConnection(): void {
        this.socket = io(environment.parallelRunUrl);

        this.socket.on('config-info', (data: ServiceConfig[]) => {
            this.configData = data;
        });

        this.socket.on('path-method-count', (data: CountData) => {
            this.getPathMethodObject(data).count = data.count;
            this.statistics = { ...this.statistics };
        });

        this.socket.on('ignore-count', (data: IgnoreCountData) => {
            this.setIgnoredCount(data);
            this.statistics = { ...this.statistics };
        });

        this.socket.on('latencies-stats', (data: LatenciesData) => {
            data.latencies.sort((a, b) => {
                return StatisticsService.compareStats_id(a, b);
            });
            this.setAvgLatencies(data);
            this.setLatenciesTime(data);
            this.statistics = { ...this.statistics };
        });

        this.socket.on('rejected-stats', (data: RejectedData) => {
            data.rejected.sort((a, b) => {
                return StatisticsService.compareStats_id(a, b);
            });
            this.setAvgRejected(data);
            this.setRejectedTime(data);
            this.statistics = { ...this.statistics };
        });

        this.socket.on('completion-stats', (data: CompletionData) => {
            data.completion.sort((a, b) => {
                return StatisticsService.compareStats_id(a, b);
            });
            this.setAvgCompleteness(data);
            this.setCompletenessTime(data);
            this.statistics = { ...this.statistics };
        });

        this.socket.on('err-absence-stats', (data: ErrAbsenceData) => {
            data.errAbsence.sort((a, b) => {
                return StatisticsService.compareStats(a, b);
            });

            const schemas = [
                ...new Set(
                    data.errAbsence.flatMap((x) =>
                        x.data.map((y) => y.errSchema)
                    )
                ),
            ].sort((a, b) => (a > b ? 1 : -1));

            this.setAvgErrAbsence(data, schemas);
            this.setErrAbsenceTime(data, schemas);
            this.statistics = { ...this.statistics };
        });

        this.socket.on(
            'parallel-run-history',
            (data: ParallelRun[]) =>
                (this._history = data.reduce(
                    (
                        prev: { [k: string]: ParallelRun },
                        curr: ParallelRun
                    ) => ({
                        ...prev,
                        [curr.runId]: curr,
                    }),
                    {}
                ))
        );

        this.socket.on(
            'parallel-run-result',
            (data: any) => (this._history![data.runId] = data)
        );
    }

    get isConnected(): boolean {
        return this.socket?.connected;
    }

    get history(): ParallelRun[] | undefined {
        if (!this._history) return undefined;
        else
            return Object.values(this._history).sort((a, b) =>
                a.timestamp < b.timestamp ? 1 : -1
            );
    }

    private static compareStats_id<
        T extends { _id: { sync: boolean; service: string } }
    >(statA: T, statB: T) {
        return this.compareStats(statA._id, statB._id);
    }

    private static compareStats<T extends { sync: boolean; service: string }>(
        statA: T,
        statB: T
    ) {
        if (statA.sync && !statB.sync) return -1;
        else if (statB.sync && !statA.sync) return 1;
        else return statA.service < statB.service ? -1 : 1;
    }

    private getPathMethodObject(data: PathMethod): PathMethodDataGroup {
        if (!this.statistics[data.path]) {
            this.statistics[data.path] = {};
        }

        if (!this.statistics[data.path][data.method]) {
            this.statistics[data.path][data.method] = { selectedTags: {} };
        }

        return this.statistics[data.path][data.method];
    }

    private getStatObject(data: PathMethod): PerformanceChartsGroup {
        const obj = this.getPathMethodObject(data);
        if (!obj.charts) obj.charts = {};
        return obj.charts;
    }

    private setIgnoredCount(data: IgnoreCountData): void {
        const obj = this.getStatObject(data);
        obj.ignoreCount = defaultDoughnutChart({
            large: !!obj.ignoreCount?.large,
            titleKey: 'main.statistics.chart.title.ignored',
            data: [
                {
                    data: [data.ignored, data.notIgnored],
                    backgroundColor: [
                        'rgba(109,0,0,0.5)',
                        'rgba(138,186,24,0.5)',
                    ],
                    hoverBackgroundColor: [
                        'rgba(109,0,0,0.7)',
                        'rgba(138,186,24,0.7)',
                    ],
                    hoverBorderColor: ['white', 'white'],
                },
            ],
            labels: ['ignored', 'notIgnored'].map((s) =>
                this.translate.instant(`main.statistics.chart.ignoredStat.${s}`)
            ),
            tags: ['doughnut', 'ignored'],
        });
    }

    private setAvgLatencies(data: LatenciesData): void {
        const obj = this.getStatObject(data);
        obj.avgLatencies = defaultBarChart({
            large: !!obj.avgLatencies?.large,
            titleKey: 'main.statistics.chart.title.avgLatencies',
            labels: data.latencies.map(
                (l) => `${l._id.service} (${l._id.sync ? 'sync.' : 'async.'})`
            ),
            data: [
                {
                    data: data.latencies.map((l) => Math.round(l.avg)),
                    backgroundColor: 'rgba(142,124,195,0.5)',
                    hoverBackgroundColor: 'rgba(142,124,195,0.7)',
                    borderColor: 'rgb(142,124,195)',
                },
            ],
            tags: ['bar', 'avg', 'latency'],
        });
    }

    private setLatenciesTime(data: LatenciesData): void {
        const obj = this.getStatObject(data);

        const labels = [
            ...new Set(
                data.latencies.flatMap((l) => {
                    return l.values.flatMap((v) => v.timestamp);
                })
            ),
        ].sort((a, b) => (a > b ? 1 : -1));

        obj.latenciesTime = defaultLineChart({
            large: !!obj.latenciesTime?.large,
            titleKey: 'main.statistics.chart.title.timeLatencies',
            labels,
            data: data.latencies.map((l) => ({
                label: `${l._id.service} (${l._id.sync ? 'sync.' : 'async.'})`,
                data: labels.map(
                    (la) =>
                        l.values.find((v) => v.timestamp === la)?.value ?? null
                ),
            })),
            tags: ['line', 'time', 'latency'],
        });
    }

    private setAvgRejected(data: RejectedData): void {
        const obj = this.getStatObject(data);
        obj.avgRejected = defaultPercentageBarChart({
            large: !!obj.avgRejected?.large,
            titleKey: 'main.statistics.chart.title.avgNotRejected',
            labels: data.rejected.map(
                (l) => `${l._id.service} (${l._id.sync ? 'sync.' : 'async.'})`
            ),
            data: [
                {
                    data: data.rejected.map((l) => 1 - l.avg),
                    backgroundColor: 'rgba(152,45,143,0.5)',
                    hoverBackgroundColor: 'rgba(152,45,143,0.7)',
                    borderColor: '#982d8f',
                },
            ],
            tags: ['bar', 'avg', 'rejected'],
        });
    }

    private setRejectedTime(data: RejectedData): void {
        const obj = this.getStatObject(data);

        const labels = [
            ...new Set(
                data.rejected.flatMap((l) => {
                    return l.values.flatMap((v) => v.timestamp);
                })
            ),
        ].sort((a, b) => (a > b ? 1 : -1));

        obj.rejectedTime = defaultTrueFalseLineChart({
            large: !!obj.rejectedTime?.large,
            titleKey: 'main.statistics.chart.title.timeRejected',
            labels,
            data: data.rejected.map((c) => ({
                label: `${c._id.service} (${c._id.sync ? 'sync.' : 'async.'})`,
                data: labels.map((l) => {
                    const found = c.values.find((v) => v.timestamp === l);
                    return found !== undefined ? !found.value : null;
                }),
            })),
            tags: ['line', 'time', 'rejected'],
        });
    }

    private setAvgCompleteness(data: CompletionData): void {
        const obj = this.getStatObject(data);
        obj.avgCompletion = defaultPercentageBarChart({
            large: !!obj.avgCompletion?.large,
            titleKey: 'main.statistics.chart.title.avgCompleteness',
            labels: data.completion.map(
                (l) => `${l._id.service} (${l._id.sync ? 'sync.' : 'async.'})`
            ),
            data: [
                {
                    data: data.completion.map((l) => l.avg),
                    backgroundColor: 'rgba(47,152,45,0.5)',
                    hoverBackgroundColor: 'rgba(47,152,45,0.7)',
                    borderColor: '#2f982d',
                },
            ],
            tags: ['bar', 'avg', 'completeness'],
        });
    }

    private setCompletenessTime(data: CompletionData): void {
        const obj = this.getStatObject(data);

        const labels = [
            ...new Set(
                data.completion.flatMap((l) => {
                    return l.values.flatMap((v) => v.timestamp);
                })
            ),
        ].sort((a, b) => (a > b ? 1 : -1));

        obj.completionTime = defaultPercentageLineChart({
            large: !!obj.completionTime?.large,
            titleKey: 'main.statistics.chart.title.timeCompleteness',
            labels,
            data: data.completion.map((c) => ({
                label: `${c._id.service} (${c._id.sync ? 'sync.' : 'async.'})`,
                data: labels.map(
                    (l) =>
                        c.values.find((v) => v.timestamp === l)?.value ?? null
                ),
            })),
            tags: ['line', 'time', 'completeness'],
        });
    }

    private setAvgErrAbsence(data: ErrAbsenceData, schemas: string[]): void {
        const obj = this.getStatObject(data);

        obj.avgErrAbsence = defaultPercentageBarChart({
            large: !!obj.avgErrAbsence?.large,
            showLegend: data.errAbsence.length > 1,
            titleKey: 'main.statistics.chart.title.avgErrAbsence',
            labels: data.errAbsence.map(
                (l) => `${l.service} (${l.sync ? 'sync.' : 'async.'})`
            ),
            data: schemas.map((schema) => ({
                data: data.errAbsence.flatMap(
                    (abs) =>
                        abs.data.find((x) => x.errSchema === schema)?.avg ??
                        null
                ),
                label: schema,
            })),
            tags: ['bar', 'avg', 'errors'],
        });
    }

    private setErrAbsenceTime(data: ErrAbsenceData, schemas: string[]): void {
        const obj = this.getStatObject(data);
        const titleKey = 'main.statistics.chart.title.timeErrAbsence';

        obj.errAbsenceTime = schemas.reduce((prev, curr) => {
            const labels = [
                ...new Set(
                    data.errAbsence.flatMap((e) => {
                        return e.data.flatMap((d) => {
                            return d.values.flatMap((v) => v.timestamp);
                        });
                    })
                ),
            ].sort((a, b) => (a > b ? 1 : -1));

            const value = defaultPercentageLineChart({
                large: !!(obj.errAbsenceTime
                    ? obj.errAbsenceTime[curr]?.large
                    : false),
                titleKey,
                titleParams: { pattern: curr },
                labels,
                data: data.errAbsence.map((e) => {
                    const schemaData = e.data.find((d) => d.errSchema === curr);
                    return {
                        data: labels?.map((l) => {
                            return (
                                schemaData?.values.find(
                                    (v) => v.timestamp === l
                                )?.value ?? null
                            );
                        }),
                        label: `${e.service} (${e.sync ? 'sync.' : 'async.'})`,
                    };
                }),
                tags: ['line', 'time', 'errors'],
            });

            return { ...prev, [curr]: value };
        }, {});
    }
}
