import { TranslationTripple } from './TranslationTripple.js';

export type LocationData = TranslationTripple & {
    sameAs: string[];
    latitude: string;
    longitude: string;
};
