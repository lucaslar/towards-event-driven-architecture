import { Component, Input } from '@angular/core';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent {
    @Input() icon?: string;
    @Input() faIcon?: IconDefinition;
    @Input() titleKey!: string;
    @Input() color: 'primary' | 'accent' | 'warn' = 'primary';

    displayShadow = false;

    onScroll(target: EventTarget): void {
        this.displayShadow = !!(target as HTMLElement).scrollTop;
    }
}
