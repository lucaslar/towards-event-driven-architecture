import { Component } from '@angular/core';
import { StatisticsService } from '../../../services/statistics.service';

@Component({
    selector: 'app-socket-status',
    templateUrl: './socket-status.component.html',
    styleUrls: ['./socket-status.component.scss'],
})
export class SocketStatusComponent {
    constructor(readonly statistics: StatisticsService) {}
}
