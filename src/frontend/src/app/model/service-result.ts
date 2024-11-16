import { Laureate } from './laureate';

export class ServiceResult {
    constructor(
        readonly service: string,
        readonly results?: Laureate[],
        readonly error?: string
    ) {}
}
