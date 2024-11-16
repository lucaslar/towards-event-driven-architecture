import { Component } from '@angular/core';
import { SearchService } from '../../services/search.service';

@Component({
    selector: 'app-results-content',
    templateUrl: './results-content.component.html',
    styleUrls: ['./results-content.component.scss'],
})
export class ResultsContentComponent {
    constructor(readonly search: SearchService) {}
}
