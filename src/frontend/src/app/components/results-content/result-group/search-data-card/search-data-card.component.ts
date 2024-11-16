import { Component, Input } from '@angular/core';
import {
    animate,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';

const closed = style({ height: 0, opacity: 0.3, padding: 0 });
const open = style({ height: '*', opacity: 1 });

@Component({
    selector: 'app-search-data-card',
    templateUrl: './search-data-card.component.html',
    styleUrls: ['./search-data-card.component.scss'],
    animations: [
        trigger('openClose', [
            state('open', open),
            state('closed', closed),
            transition('open => closed', [animate('0.3s')]),
            transition('closed => open', [animate('0.3s')]),
        ]),
    ],
})
export class SearchDataCardComponent {
    @Input() data: any;
    @Input() uuid!: string;
    @Input() display!: boolean;
}
