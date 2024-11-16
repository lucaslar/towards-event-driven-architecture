import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Laureate } from '../../../model/laureate';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
    divIcon,
    latLng,
    Map,
    MapOptions,
    Marker,
    PointExpression,
} from 'leaflet';
import { mapLayer } from '../../../consts/map-layers';
import { decode } from 'ngeohash';
import { TranslateService } from '@ngx-translate/core';

type groupedLaureates = { birth: Laureate[]; death: Laureate[] };

@Component({
    selector: 'app-search-success',
    templateUrl: './search-success.component.html',
    styleUrls: ['./search-success.component.scss'],
})
export class SearchSuccessComponent implements OnInit {
    readonly laureates: Laureate[];
    readonly icon: IconDefinition;
    readonly service: string;

    map?: Map;
    markers?: { marker: Marker; data: groupedLaureates }[];

    readonly mapOptions: MapOptions = {
        center: latLng(35, 0),
        zoom: 1,
        doubleClickZoom: false,
        minZoom: 1,
        layers: [mapLayer()],
    };

    constructor(
        @Inject(MAT_DIALOG_DATA)
        data: {
            laureates: Laureate[];
            icon: IconDefinition;
            service: string;
        },
        private readonly translate: TranslateService
    ) {
        this.laureates = data.laureates.sort((a, b) =>
            a.name + a.givenName > b.name + b.givenName ? 1 : -1
        );
        this.icon = data.icon;
        this.service = data.service;
    }

    ngOnInit(): void {
        const groupedLocations: { [k: string]: groupedLaureates } = {};

        const createAtLocation = (location: string) => {
            if (!groupedLocations[location]) {
                groupedLocations[location] = { birth: [], death: [] };
            }
        };

        this.laureates.forEach((l) => {
            if (l.birthLocation) {
                createAtLocation(l.birthLocation);
                groupedLocations[l.birthLocation].birth.push(l);
            }
            if (l.deathLocation) {
                createAtLocation(l.deathLocation);
                groupedLocations[l.deathLocation].death.push(l);
            }
        });

        this.initMarkers(groupedLocations);
    }

    mapReady($event: Map): void {
        this.markers?.forEach((m) =>
            m.marker
                .addTo($event)
                .bindTooltip(() => this.laureateTooltip(m.data))
        );
        this.map = $event;
    }

    private initMarkers(groupedLocations: { [k: string]: groupedLaureates }) {
        const iconSize: PointExpression = [48, 48];
        const iconAnchor: PointExpression = [24, 48];
        const html =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="48px" height="48px"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';

        this.markers = Object.keys(groupedLocations).map((h) => {
            const { latitude, longitude } = decode(h);
            const data = groupedLocations[h];

            let className;
            if (data.birth.length) {
                if (data.death.length) className = 'fill-color-primary';
                else className = 'fill-color-accent';
            }
            const icon = divIcon({ iconSize, html, className, iconAnchor });
            const marker = new Marker([latitude, longitude]).setIcon(icon);
            return { data, marker };
        });
    }

    private laureateTooltip(data: groupedLaureates): string {
        const tooltipB = [];
        const tooltipD = [];

        const mapName = (l: Laureate) => {
            return l.name + (l.givenName ? `, ${l.givenName}` : '');
        };

        const strongTitle = (key: string) => {
            return `<strong>${this.translate.instant(key)}:</strong>`;
        };

        if (data.birth.length) {
            tooltipB.push(strongTitle('dialog.searchResult.born'));
            tooltipB.push(...data.birth.map(mapName));
        }

        if (data.death.length) {
            tooltipD.push(strongTitle('dialog.searchResult.passed'));
            tooltipD.push(...data.death.map(mapName));
        }

        return (
            tooltipB.join('<br>') +
            (tooltipB.length && tooltipD.length ? '<hr>' : '') +
            tooltipD.join('<br>')
        );
    }
}
