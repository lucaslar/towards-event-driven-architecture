export class Laureate {
    constructor(
        readonly id: number,
        readonly name: string,
        readonly givenName: string,
        readonly gender: string,
        readonly wikiUrl: string,
        readonly laureateUrl: string,
        readonly externalUrl: string,
        readonly birth: Date,
        readonly birthYear: number,
        readonly death: Date,
        readonly deathYear: number,
        readonly birthLocation: string,
        readonly deathLocation: string,
        readonly prizesErr?: string,
        readonly prizes?: {
            category: string;
            laureate: number;
            year: number;
            prizeAmount: number;
            prizeAmountAdjusted: number;
        }[]
    ) {}
}
