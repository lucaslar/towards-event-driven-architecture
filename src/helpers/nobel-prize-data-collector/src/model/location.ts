import { TranslationTripple } from './TranslationTripple.js';
import { LocationData } from './location-data.js';

export interface Location {
    city: LocationData;
    country: LocationData;
    cityNow: LocationData;
    countryNow: LocationData;
    continent: TranslationTripple;
    locationString: TranslationTripple;
}
