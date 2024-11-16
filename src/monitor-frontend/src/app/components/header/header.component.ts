import { Component, HostListener } from '@angular/core';
import { StatisticsService } from '../../services/statistics.service';
import { MatDialog } from '@angular/material/dialog';
import { SocketStatusComponent } from '../dialogs/socket-status/socket-status.component';
import { InfoComponent } from '../dialogs/info/info.component';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
    isScrolled: boolean = false;

    constructor(
        readonly statistics: StatisticsService,
        private readonly dialog: MatDialog
    ) {}

    @HostListener('window:scroll') onScroll(): void {
        this.isScrolled = window.scrollY > 0;
    }

    openInfoDialog(): void {
        this.dialog.open(InfoComponent);
    }

    openSocketDialog(): void {
        this.dialog.open(SocketStatusComponent);
    }
}
