import { Component, Input } from '@angular/core';
import { QueryResult } from '../../../model/query-result';
import { MatDialog } from '@angular/material/dialog';
import { DeleteOneResultComponent } from '../../dialog/delete-one-result/delete-one-result.component';

@Component({
    selector: 'app-result-group',
    templateUrl: './result-group.component.html',
    styleUrls: ['./result-group.component.scss'],
})
export class ResultGroupComponent {
    @Input() resultGroup!: QueryResult;

    displaySearchData = false;

    constructor(private readonly dialog: MatDialog) {}

    removeQueryResult(uuid: string) {
        this.dialog.open(DeleteOneResultComponent, { data: { uuid } });
    }
}
