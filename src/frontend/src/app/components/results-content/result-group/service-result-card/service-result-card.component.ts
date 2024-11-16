import { Component, Input, OnInit } from '@angular/core';
import { ServiceResult } from '../../../../model/service-result';
import { laureateServiceMap } from '../../../../consts/laureate-service-mapping';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { SearchErrorComponent } from '../../../dialog/search-error/search-error.component';
import { SearchSuccessComponent } from '../../../dialog/search-success/search-success.component';

@Component({
    selector: 'app-service-result-card',
    templateUrl: './service-result-card.component.html',
    styleUrls: ['./service-result-card.component.scss'],
})
export class ServiceResultCardComponent implements OnInit {
    elevate: boolean = false;
    icon!: IconDefinition;
    hasData = false;

    @Input() serviceResult!: ServiceResult;

    constructor(private readonly dialog: MatDialog) {}

    ngOnInit(): void {
        this.icon = laureateServiceMap[this.serviceResult.service]?.icon;
        this.hasData =
            !!this.serviceResult.error || !!this.serviceResult.results?.length;
    }

    openDetails(): void {
        const shared = { icon: this.icon, service: this.serviceResult.service };
        if (this.serviceResult.error) {
            const data = { ...shared, error: this.serviceResult.error };
            this.dialog.open(SearchErrorComponent, { data });
        } else if (this.serviceResult.results?.length) {
            const data = { ...shared, laureates: this.serviceResult.results };
            const width = '100%';
            const maxWidth = 'min(1800px, 80vw)';
            this.dialog.open(SearchSuccessComponent, { data, width, maxWidth });
        }
    }
}
