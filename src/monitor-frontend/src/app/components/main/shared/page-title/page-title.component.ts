import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-page-title',
    templateUrl: './page-title.component.html',
    styleUrls: ['./page-title.component.scss'],
})
export class PageTitleComponent {
    @Input() title: string = '[no headline given!]';
    @Input() icon: string = '';
}
