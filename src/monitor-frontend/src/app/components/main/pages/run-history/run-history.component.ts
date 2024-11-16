import { Component } from '@angular/core';
import { StatisticsService } from '../../../../services/statistics.service';

@Component({
    selector: 'app-run-history',
    templateUrl: './run-history.component.html',
    styleUrls: ['./run-history.component.scss'],
})
export class RunHistoryComponent {
    constructor(readonly statistics: StatisticsService) {}
}
