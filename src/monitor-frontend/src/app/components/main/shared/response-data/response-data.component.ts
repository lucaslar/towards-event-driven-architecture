import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-response-data',
    templateUrl: './response-data.component.html',
    styleUrls: ['./response-data.component.scss'],
})
export class ResponseDataComponent {
    constructor(@Inject(MAT_DIALOG_DATA) readonly data: any) {}
}
