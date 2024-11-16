import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-path-method-badge',
    templateUrl: './path-method-badge.component.html',
    styleUrls: ['./path-method-badge.component.scss'],
})
export class PathMethodBadgeComponent {
    @Input() path = '[no path]';
    @Input() method = '[no method]';
    @Input() additionalInformation?: number | string;
}
