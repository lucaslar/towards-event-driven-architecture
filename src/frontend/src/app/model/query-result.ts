import { ServiceResult } from './service-result';

export class QueryResult {
    constructor(
        readonly uuid: string,
        readonly serviceResults: ServiceResult[],
        readonly timestamp: Date,
        readonly queryData: any
    ) {}
}
