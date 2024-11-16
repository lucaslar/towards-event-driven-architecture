import { Component } from '@angular/core';
import { StatisticsService } from '../../../../services/statistics.service';

@Component({
    selector: 'app-performance-stats',
    templateUrl: './performance-stats.component.html',
    styleUrls: ['./performance-stats.component.scss'],
})
export class PerformanceStatsComponent {
    constructor(readonly statistics: StatisticsService) {}

    onChipSelected(
        pathMethodGroup: {
            selectedTags: { [p: string]: boolean };
            subscribableSelectedTags: { [p: string]: boolean };
        },
        tag: string
    ): void {
        pathMethodGroup.selectedTags[tag] = !pathMethodGroup.selectedTags[tag];
        pathMethodGroup.subscribableSelectedTags = {
            ...pathMethodGroup.selectedTags,
        };
    }
}
