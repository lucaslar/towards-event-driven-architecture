import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { StorageService } from '../../../services/storage.service';

@Component({
    selector: 'app-delete-all-results',
    templateUrl: './delete-all-results.component.html',
    styleUrls: ['./delete-all-results.component.scss'],
})
export class DeleteAllResultsComponent implements OnInit {
    constructor(
        private readonly ref: MatDialogRef<DeleteAllResultsComponent>,
        private readonly storage: StorageService
    ) {}

    ngOnInit(): void {
        this.ref.afterClosed().subscribe((data) => {
            if (data) this.storage.deleteAllResults();
        });
    }
}
