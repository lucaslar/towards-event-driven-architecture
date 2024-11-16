import { Pipe, PipeTransform } from '@angular/core';
import { QueryResult } from '../model/query-result';

@Pipe({
    name: 'descDate',
})
export class DescDatePipe implements PipeTransform {
    transform(value: QueryResult[]): QueryResult[] {
        return value.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    }
}
