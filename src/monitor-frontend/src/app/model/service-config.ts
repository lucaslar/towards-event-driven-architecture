export class ServiceConfig {
    constructor(
        readonly name: string,
        readonly host: string,
        readonly port: number,
        readonly sourceOfTruth: boolean,
        readonly sync: boolean
    ) {}
}
