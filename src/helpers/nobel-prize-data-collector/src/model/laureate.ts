import { TranslationTripple } from './TranslationTripple.js';
import { Link } from './link.js';
import { Location } from './location.js';

type Affiliation = Location & {
    name: TranslationTripple;
    nameNow: TranslationTripple;
};

type NobelPrize = {
    awardYear: string;
    category: TranslationTripple;
    categoryFullName: TranslationTripple;
    sortOrder: string;
    portion: string;
    dateAwarded: string;
    prizeStatus: string;
    motivation: TranslationTripple;
    prizeAmount: number;
    prizeAmountAdjusted: number;
    affiliations: Affiliation[];
    links: Link[];
};

export interface Laureate {
    id: string;
    orgName?: TranslationTripple;
    knownName: TranslationTripple;
    givenName: TranslationTripple;
    familyName: TranslationTripple;
    fullName: TranslationTripple;
    fileName: string;
    gender: string;
    birth?: { date: string; place?: Location };
    founded?: { date: string; place?: Location };
    death?: { date: string; place?: Location };
    wikipedia: { slug: string; english: string };
    wikidata: { id: string; url: string };
    sameAs: string[];
    links: Link[];
    nobelPrizes: NobelPrize[];
}
