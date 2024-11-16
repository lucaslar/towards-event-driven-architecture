import { Component, Input } from '@angular/core';
import { ServiceConfig } from '../../../../model/service-config';
import { EvaluatedResult } from '../../../../model/parallel-run/evaluated-result';
import { MatDialog } from '@angular/material/dialog';
import { ResponseDataComponent } from '../response-data/response-data.component';

@Component({
    selector: 'app-config-card',
    templateUrl: './config-card.component.html',
    styleUrls: ['./config-card.component.scss'],
})
export class ConfigCardComponent {
    @Input() config!: ServiceConfig;
    @Input() responseData?: EvaluatedResult;

    constructor(private readonly dialog: MatDialog) {}

    openResponseData(): void {
        this.dialog.open(ResponseDataComponent, { data: this.responseData });
    }
}
