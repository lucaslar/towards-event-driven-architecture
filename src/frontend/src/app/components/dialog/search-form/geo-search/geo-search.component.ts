import { Component, EventEmitter, Input, NgZone, Output } from '@angular/core';
import {
    divIcon,
    geoJSON,
    latLng,
    LeafletEvent,
    Map,
    MapOptions,
    marker,
    Marker,
} from 'leaflet';
import { bboxes, decode, decode_bbox, encode } from 'ngeohash';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { mapLayer } from '../../../../consts/map-layers';

type c = [number, number];
type s = 'selected' | 'parent selected' | 'child selected' | 'unselected';

@Component({
    selector: 'app-geo-search',
    templateUrl: './geo-search.component.html',
    styleUrls: ['./geo-search.component.scss'],
})
export class GeoSearchComponent {
    @Input() selection: string[] = [];
    @Output() selectionChange = new EventEmitter<string[]>();

    map?: Map;

    private layer: any;
    private labels: Marker[] = [];
    private precision = -1;

    readonly mapOptions: MapOptions = {
        center: latLng(0, 0),
        zoom: 1,
        doubleClickZoom: false,
        minZoom: 1,
        layers: [mapLayer()],
    };

    constructor(
        private readonly snackbar: MatSnackBar,
        private readonly translate: TranslateService,
        private readonly ngZone: NgZone
    ) {}

    mapReady($event: Map): void {
        this.map = $event;
        this.addLayers();
    }

    addLayers(): void {
        this.precision = Math.ceil(this.map!.getZoom() / 2.5);
        const geoJson = bboxes(
            this.map!.getBounds().getSouthWest().lat,
            this.map!.getBounds().getSouthWest().lng,
            this.map!.getBounds().getNorthEast().lat,
            this.map!.getBounds().getNorthEast().lng,
            this.precision
        ).map((hash) => {
            const [a, b, c, d] = decode_bbox(hash);
            return {
                type: 'Polygon',
                coordinates: [
                    [
                        [b, a],
                        [b, c],
                        [d, c],
                        [d, a],
                    ],
                ],
            };
        });

        this.labels.forEach((l) => this.map?.removeLayer(l));
        this.labels = [];
        const layer = this.layerFromJson(geoJson);
        if (this.layer) this.map?.removeLayer(this.layer);
        this.layer = layer;
        this.map?.addLayer(this.layer);
        this.selectionChange.emit(this.selection);
    }

    deleteSelection() {
        this.selection = [];
        this.addLayers();
    }

    addByChip(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();
        if (value) {
            const { latitude, longitude } = decode(value);
            if (value === encode(latitude, longitude, Math.max(value.length))) {
                const [state, lockReason] = this.stateOfHash(value);
                if (state === 'parent selected' || state === 'child selected') {
                    this.openLockedSnackbar(state, value, lockReason!);
                } else {
                    const uniques = [...new Set([...this.selection, value])];
                    if (uniques.length !== this.selection.length) {
                        this.selection = uniques.sort();
                        this.addLayers();
                    }
                }
            } else {
                const params = { hash: value };
                this.localizedSnackbar(`snackbar.geoHash.invalid`, params);
            }
        }
        event.chipInput?.clear();
    }

    removeByChip(geoHash: string) {
        this.selection = this.selection.filter((s) => s !== geoHash);
        this.addLayers();
    }

    private layerFromJson(geoJson: any) {
        return geoJSON(geoJson, {
            style: (feature) => {
                const coordinates = (feature!.geometry as any).coordinates;
                return this.styleOfCoordinates(coordinates);
            },
            onEachFeature: (feature, layer) => {
                const coordinates = (feature as any).coordinates;
                const center = this.coordinatesCenter(coordinates);
                const hash = encode(center.lat, center.lng, this.precision);
                const icon = divIcon({
                    className: 'd-flex click-through',
                    html: `<div class='label m-auto'>${hash}</div>`,
                    iconSize: { x: 100, y: 40 } as any,
                });
                const label = marker(center, { icon });
                this.labels.push(label);

                layer.on({
                    add: () => label.addTo(this.map!),
                    click: (feature) => this.toggleHashLayer(feature, hash),
                });
            },
        });
    }

    private styleOfCoordinates(coordinates: [[c, c, c, c]]) {
        const center = this.coordinatesCenter(coordinates);
        const hash = encode(center.lat, center.lng, this.precision);
        const [state] = this.stateOfHash(hash);
        return this.styleByState(state);
    }

    private stateOfHash(hash: string): [s, string?] {
        if (this.selection.includes(hash)) return ['selected'];
        else {
            const child = this.selection.find((h) => h.startsWith(hash));
            if (!!child) return ['child selected', child];
            const parent = this.selection.find((h) => hash.startsWith(h));
            if (!!parent) return ['parent selected', parent];
            else return ['unselected'];
        }
    }

    private toggleHashLayer(feature: LeafletEvent, hash: string) {
        const [state, lockReason] = this.stateOfHash(hash);
        if (state === 'parent selected' || state === 'child selected') {
            this.openLockedSnackbar(state, hash, lockReason!);
        } else if (state === 'unselected') {
            this.selection = [...this.selection, hash].sort();
            this.selectionChange.emit(this.selection);
            feature.target.setStyle(this.styleByState('selected'));
        } else {
            this.selection = this.selection.filter((h) => h !== hash);
            this.selectionChange.emit(this.selection);
            feature.target.setStyle(this.styleByState('unselected'));
        }
    }

    private openLockedSnackbar(
        state: 'child selected' | 'parent selected',
        hash: string,
        lockReason: string
    ) {
        const scope = state === 'parent selected' ? 'parent' : 'child';
        const message = `snackbar.geoHash.locked.${scope}`;
        this.localizedSnackbar(message, { hash, lockReason });
    }

    private localizedSnackbar(message: string, params: any) {
        const action = 'general.close';
        this.translate.get([message, action], params).subscribe((r) => {
            this.ngZone.run(() => {
                this.snackbar.open(r[message], r[action], { duration: 3000 });
            });
        });
    }

    private styleByState(state: s) {
        const shared = { weight: 2, opacity: 0.5, color: 'grey' };
        const selected = { ...shared, fillOpacity: 0.5 };
        if (state === 'unselected') return { ...shared, fillOpacity: 0 };
        else if (state === 'parent selected') {
            return { ...selected, fillColor: 'blue' };
        } else if (state === 'selected') {
            return { ...selected, fillColor: 'green' };
        } else return { ...selected, fillColor: 'yellow' };
    }

    private coordinatesCenter(coordinates: [[c, c, c, c]]) {
        const lat = (coordinates[0][0][1] + coordinates[0][2][1]) / 2;
        const lng = (coordinates[0][0][0] + coordinates[0][2][0]) / 2;
        return { lat, lng };
    }
}
