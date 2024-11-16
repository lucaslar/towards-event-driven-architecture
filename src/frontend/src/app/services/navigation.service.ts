import { Injectable } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { NavItem } from '../model/internal/nav-item';
import { LanguageComponent } from '../components/dialog/language/language.component';
import { InfoComponent } from '../components/dialog/info/info.component';
import { DeleteAllResultsComponent } from '../components/dialog/delete-all-results/delete-all-results.component';
import { SearchService } from './search.service';

@Injectable({
    providedIn: 'root',
})
export class NavigationService {
    isLoadingIndicated = false;
    isSidebarOpened = false;

    readonly navItems: NavItem[] = [
        {
            icon: 'language',
            translationKey: 'action.language',
            onClick: () => this.dialog.open(LanguageComponent),
        },
        {
            icon: 'info_outline',
            translationKey: 'action.info',
            onClick: () => this.dialog.open(InfoComponent),
        },
        {
            icon: 'delete_forever',
            translationKey: 'action.deleteAll',
            onClick: () => this.dialog.open(DeleteAllResultsComponent),
            color: 'warn',
            disabled: () => !this.search.results.length,
        },
    ];

    private readonly mobileQuery: MediaQueryList;

    constructor(
        media: MediaMatcher,
        private readonly dialog: MatDialog,
        private readonly search: SearchService
    ) {
        this.mobileQuery = media.matchMedia('(max-width: 576px)');
    }

    checkMediaQuery(): void {
        if (!this.mobileQuery.matches) {
            this.isSidebarOpened = false;
        }
    }
}
