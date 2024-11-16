import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
    faEquals,
    faGreaterThan,
    faLessThan,
} from '@fortawesome/free-solid-svg-icons';
import { DateField } from '../../../../model/internal/date-field';

@Component({
    selector: 'app-date-fields',
    templateUrl: './date-fields.component.html',
    styleUrls: ['./date-fields.component.scss'],
})
export class DateFieldsComponent {
    readonly equalsIcon = faEquals;
    readonly ltIcon = faLessThan;
    readonly gtIcon = faGreaterThan;

    @Input() dateFields!: DateField;
    @Output() dateFieldsChange = new EventEmitter<DateField>();
}
