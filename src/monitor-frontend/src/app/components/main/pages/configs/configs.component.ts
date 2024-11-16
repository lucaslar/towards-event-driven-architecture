import { Component } from '@angular/core';
import { StatisticsService } from '../../../../services/statistics.service';

@Component({
    selector: 'app-configs',
    templateUrl: './configs.component.html',
    styleUrls: ['./configs.component.scss'],
})
export class ConfigsComponent {
    constructor(readonly statistics: StatisticsService) {}
}
