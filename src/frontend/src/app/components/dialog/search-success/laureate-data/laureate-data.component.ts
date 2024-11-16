import { Component, Input, OnInit } from '@angular/core';
import { Laureate } from '../../../../model/laureate';
import { gender, genderIcons } from '../../../../consts/gender-properties';
import { faWikipediaW } from '@fortawesome/free-brands-svg-icons';
import {
    faAsterisk,
    faAward,
    faCross,
} from '@fortawesome/free-solid-svg-icons';
import { laureateServiceMap } from '../../../../consts/laureate-service-mapping';

@Component({
    selector: 'app-laureate-data',
    templateUrl: './laureate-data.component.html',
    styleUrls: ['./laureate-data.component.scss'],
})
export class LaureateDataComponent implements OnInit {
    @Input() laureate!: Laureate;
    genderIcon!: string;

    readonly wikiIcon = faWikipediaW;
    readonly nobelPrizeIcon = faAward;
    readonly deathIcon = faCross;
    readonly birthIcon = faAsterisk;
    readonly laureateServiceMap = laureateServiceMap;

    ngOnInit(): void {
        this.genderIcon = genderIcons[this.laureate.gender as gender];
    }

    get name(): string {
        return (
            (this.laureate.givenName ? this.laureate.givenName + ' ' : '') +
            this.laureate.name
        );
    }
}
