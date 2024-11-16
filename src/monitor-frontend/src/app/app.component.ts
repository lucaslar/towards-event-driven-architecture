import { Component, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StatisticsService } from './services/statistics.service';
import { slideAnimation } from './etc/route-animations';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [slideAnimation],
})
export class AppComponent implements OnInit {
    constructor(
        private readonly translate: TranslateService,
        private readonly statistics: StatisticsService,
        private readonly router: Router
    ) {}

    ngOnInit(): void {
        this.translate.setDefaultLang('en');
        this.statistics.setupSocketConnection();
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.ctrlKey && event.metaKey) {
            if (event.key === 'ArrowUp' && this.router.url === '/recent-runs') {
                this.router.navigate(['/']);
            } else if (
                event.key === 'ArrowLeft' &&
                this.router.url === '/performance-stats'
            ) {
                this.router.navigate(['/']);
            } else if (
                event.key === 'ArrowRight' &&
                this.router.url === '/services'
            ) {
                this.router.navigate(['/']);
            } else if (this.router.url === '/') {
                if (event.key === 'ArrowRight') {
                    this.router.navigate(['/performance-stats']);
                } else if (event.key === 'ArrowDown') {
                    this.router.navigate(['/recent-runs']);
                } else if (event.key === 'ArrowLeft') {
                    this.router.navigate(['/services']);
                }
            }
        }
    }
}
