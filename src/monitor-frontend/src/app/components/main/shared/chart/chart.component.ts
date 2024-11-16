import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Chart } from '../../../../model/internal/chart';

@Component({
    selector: 'app-chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.scss'],
})
export class ChartComponent {
    @Input() large: boolean = false;
    @Output() largeChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Input() chart!: Chart;
}
