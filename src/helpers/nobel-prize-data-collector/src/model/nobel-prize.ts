import { TranslationTripple } from './TranslationTripple.js';
import { Link } from './link.js';

export interface NobelPrize {
    awardYear: string;
    category: TranslationTripple;
    categoryFullName: TranslationTripple;
    dateAwarded: string;
    prizeAmount: number;
    prizeAmountAdjusted: number;
    links: Link[];
    laureates: {
        id: string;
        knownName: TranslationTripple;
        fullName: TranslationTripple;
        portion: string;
        sortOrder: string;
        motivation: TranslationTripple;
        links: Link[];
    }[];
}
