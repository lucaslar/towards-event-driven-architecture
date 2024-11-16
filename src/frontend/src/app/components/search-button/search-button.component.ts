import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SearchFormComponent } from '../dialog/search-form/search-form.component';
import { SearchService } from '../../services/search.service';

@Component({
    selector: 'app-search-button',
    templateUrl: './search-button.component.html',
    styleUrls: ['./search-button.component.scss'],
})
export class SearchButtonComponent {
    constructor(
        readonly search: SearchService,
        private readonly dialog: MatDialog
    ) {}

    openSearchDialog(): void {
        this.dialog.open(SearchFormComponent);
    }
}
