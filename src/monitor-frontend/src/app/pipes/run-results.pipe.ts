import { Pipe, PipeTransform } from '@angular/core';
import { ParallelRun } from '../model/parallel-run/parallel-run';
import { EvaluatedResult } from '../model/parallel-run/evaluated-result';

@Pipe({
    name: 'runResults',
})
export class RunResultsPipe implements PipeTransform {
    transform(value: ParallelRun): EvaluatedResult[] {
        return [...value.synchronousResults, ...value.asynchronousResults];
    }
}
