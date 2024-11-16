import { Component, HostListener } from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { SearchService } from '../../services/search.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
    isScrolled: boolean = false;

    constructor(
        readonly navigation: NavigationService,
        readonly search: SearchService
    ) {}

    @HostListener('window:scroll') onScroll(): void {
        this.isScrolled = window.scrollY > 0;
    }
}
