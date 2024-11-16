import { Pipe, PipeTransform } from '@angular/core';
import { Chart } from '../model/internal/chart';

@Pipe({
    name: 'tagFilter',
})
export class TagFilterPipe implements PipeTransform {
    transform(value: Chart[], selectedTags: { [k: string]: boolean }): Chart[] {
        return value.filter((c) => c.tags.every((t) => selectedTags[t]));
    }
}
