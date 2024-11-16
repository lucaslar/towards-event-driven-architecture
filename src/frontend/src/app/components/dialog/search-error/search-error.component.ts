import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-search-error',
    templateUrl: './search-error.component.html',
    styleUrls: ['./search-error.component.scss'],
})
export class SearchErrorComponent {
    readonly error: string;
    readonly icon: IconDefinition;
    readonly service: string;

    constructor(
        @Inject(MAT_DIALOG_DATA)
        data: {
            error: string;
            icon: IconDefinition;
            service: string;
        }
    ) {
        this.error = data.error;
        this.icon = data.icon;
        this.service = data.service;
    }
}
