import { Pipe, PipeTransform } from '@angular/core';
import { PathMethodDataGroup } from '../model/internal/path-method-data-group';
import { Chart } from '../model/internal/chart';

@Pipe({
    name: 'statisticsMapping',
})
export class StatisticsMappingPipe implements PipeTransform {
    transform(value: {
        [path: string]: {
            [method: string]: PathMethodDataGroup;
        };
    }): {
        path: string;
        method: string;
        charts: Chart[];
        count?: number;
        tags: string[];
        selectedTags: { [k: string]: boolean };
        subscribableSelectedTags: { [k: string]: boolean };
    }[] {
        return Object.keys(value)
            .flatMap((path) => {
                return Object.keys(value[path]).map((method) => {
                    return { path, method, data: value[path][method] };
                });
            })
            .sort((a, b) => {
                if (a.path > b.path) return 1;
                else if (a.path < b.path) return -1;
                else return a.method > b.method ? 1 : -1;
            })
            .map((x) => {
                const { path, method } = x;
                const charts: Chart[] = [];
                const tags: string[] = [];
                const selectedTags = x.data.selectedTags!;

                if (x.data.charts) {
                    const { errAbsenceTime, ...stats } = x.data.charts;
                    charts.push(...Object.values(stats));

                    const flatTags: string[] = [];

                    if (errAbsenceTime && Object.keys(errAbsenceTime).length) {
                        charts.push(...Object.values(errAbsenceTime));
                        flatTags.push(
                            ...Object.values(errAbsenceTime).flatMap((x) => {
                                return x.tags;
                            })
                        );
                    }

                    flatTags.push(
                        ...Object.keys(stats).flatMap((key) => {
                            // @ts-ignore
                            return x.data.charts[key].tags;
                        })
                    );

                    tags.push(...[...new Set(flatTags)]);
                    tags.sort((a, b) => (a > b ? 1 : -1));

                    flatTags.forEach((t) => {
                        if (selectedTags[t] === undefined) {
                            selectedTags[t] = true;
                        }
                    });
                }

                return {
                    path,
                    method,
                    count: x.data.count,
                    charts,
                    selectedTags,
                    subscribableSelectedTags: { ...selectedTags },
                    tags,
                };
            });
    }
}
