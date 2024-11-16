import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StorageService } from '../../../services/storage.service';

@Component({
    selector: 'app-delete-one-result',
    templateUrl: './delete-one-result.component.html',
    styleUrls: ['./delete-one-result.component.scss'],
})
export class DeleteOneResultComponent implements OnInit {
    constructor(
        private readonly ref: MatDialogRef<DeleteOneResultComponent>,
        private readonly storage: StorageService,
        @Inject(MAT_DIALOG_DATA)
        readonly data: { uuid: string }
    ) {}

    ngOnInit(): void {
        this.ref.afterClosed().subscribe((data) => {
            if (data) this.storage.removeQueryResult(this.data.uuid);
        });
    }
}
