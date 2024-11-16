import { ChangeDetectorRef, Component } from '@angular/core';
import {
    faAsterisk,
    faCross,
    faMapLocation,
    faMapLocationDot,
    faUserCircle,
} from '@fortawesome/free-solid-svg-icons';
import { DateField } from '../../../model/internal/date-field';
import { MatDialogRef } from '@angular/material/dialog';
import { SearchService } from '../../../services/search.service';
import { genderIcons, gender } from '../../../consts/gender-properties';

@Component({
    selector: 'app-search-form',
    templateUrl: './search-form.component.html',
    styleUrls: ['./search-form.component.scss'],
})
export class SearchFormComponent {
    readonly personalIcon = faUserCircle;
    readonly deathIcon = faCross;
    readonly birthIcon = faAsterisk;
    readonly birthLocationIcon = faMapLocationDot;
    readonly deathLocationIcon = faMapLocation;

    readonly genderValues: gender[] = ['female', 'male', 'divers', 'org'];
    readonly genderIcons = genderIcons;

    step = 0;

    firstName?: string;
    lastName?: string;
    gender?: gender;
    birthLocation: string[] = [];
    deathLocation: string[] = [];
    birthDate: DateField = { yearOnly: false, operator: 'eq' };
    deathDate: DateField = { yearOnly: false, operator: 'eq' };

    constructor(
        private readonly ref: MatDialogRef<SearchFormComponent>,
        private readonly search: SearchService,
        readonly changeDetector: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.ref.afterClosed().subscribe((data) => {
            if (data) this.search.search(data);
        });
    }

    get isEmptyForm(): boolean {
        return (
            !this.firstName?.trim().length &&
            !this.lastName?.trim().length &&
            !this.gender &&
            !this.birthLocation.length &&
            !this.deathLocation.length &&
            !this.birthDate.date &&
            this.birthDate.year === undefined &&
            !this.deathDate.date &&
            this.deathDate.year === undefined
        );
    }

    get formData() {
        const birthDate = this.valueOfDateField(this.birthDate);
        const deathDate = this.valueOfDateField(this.deathDate);
        const result: any = {};

        if (this.firstName) result.firstName = this.firstName?.trim();
        if (this.lastName) result.lastName = this.lastName?.trim();
        if (this.gender) result.gender = this.gender;
        if (birthDate) result.birthDate = birthDate;
        if (deathDate) result.deathDate = deathDate;

        if (this.birthLocation.length) {
            result.birthLocation = this.birthLocation;
        }

        if (this.deathLocation.length) {
            result.deathLocation = this.deathLocation;
        }

        return result;
    }

    private valueOfDateField(dateField: DateField) {
        const { year, date, operator } = dateField;
        if (!year && !date) return undefined;
        else if (year) return { operator, year };
        else return { operator, date: date?.toISOString().split('T')[0] };
    }
}
