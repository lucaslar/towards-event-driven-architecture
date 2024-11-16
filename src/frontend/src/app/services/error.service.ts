import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../components/dialog/error-dialog/error-dialog.component';

@Injectable({
    providedIn: 'root',
})
export class ErrorService implements ErrorHandler {
    constructor(
        private readonly dialog: MatDialog,
        private readonly ngZone: NgZone
    ) {}

    handleError(error: any): void {
        console.error(error);
        this.ngZone.run(() => {
            this.dialog.open(ErrorDialogComponent, {
                data: error.stack ?? error,
            });
        });
    }
}
