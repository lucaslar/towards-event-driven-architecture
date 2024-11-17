import { NominatimResponse } from '../model/nominatim-response.js';
import ngeohash from 'ngeohash';
import { performance } from 'perf_hooks';
import request from 'request';

const minWaitTime = 2000;
let latestRequest = 0;

const nominatimUrl =
    process.env.nominatimUrl || 'https://nominatim.openstreetmap.org';

const geoHashPrecisions = [
    { precision: 7, kmLat: 0.1529, kmLon: 0.1524 },
    { precision: 6, kmLat: 1.2, kmLon: 0.6094 },
    { precision: 5, kmLat: 4.9, kmLon: 4.9 },
    { precision: 4, kmLat: 39.1, kmLon: 19.5 },
    { precision: 3, kmLat: 156.5, kmLon: 156 },
    { precision: 2, kmLat: 1252.3, kmLon: 624.1 },
    { precision: 1, kmLat: 5009.4, kmLon: 4992.6 },
];

const cityMapping: { [k: string]: string } = {
    ['{"country":"Pakistan","city":"Jhang Maghiāna"}']: 'Jhang',
    ['{"country":"Lithuania","city":"Zelvas"}']: 'Želva',
    ['{"country":"East Timor","city":"Wailacama"}']: '',
    ['{"country":"China","city":"Hofei, Anhwei"}']: 'Hofei',
    ['{"country":"Poland","city":"Goldschmieden, near Breslau"}']: 'Breslau',
    ['{"country":"Romania","city":"Nitzkydorf, Banat"}']: 'Nițchidorf',
    ['{"country":"Poland","city":"Dabrovica"}']: 'Dabrowica',
    ['{"country":"Germany","city":"Hoechst"}']: 'Höchst',
    ['{"country":"United Kingdom","city":"Tardebigg"}']: 'Tardebigge',
    ['{"country":"United Kingdom","city":"Langford Grove, Maldon, Essex"}']:
        'Maldon',
    ['{"country":"Guatemala","city":"Aldea Chimel"}']: 'Lanquín',
    ['{"country":"Ukraine","city":"Zloczov"}']: 'Zolochiv',
    ['{"country":"Northern Ireland","city":"Casteldàwson"}']: 'Castledawson',
    ['{"country":"Belarus","city":"Vishneva"}']: 'Вишнево',
    ['{"country":"Russia","city":"Parusnoye"}']: 'Парусное',
    ['{"country":"Belarus","city":"Vitebsk, Belorussia"}']: 'Vitebsk',
};

const countryMapping: { [k: string]: string } = {
    ['Faroe Islands (Denmark)']: 'Faroe Islands',
    ['Guadeloupe Island']: 'Guadeloupe',
};

const boundingBoxToLatLon = (box: [string, string, string, string]) => {
    const mapped = box.map((l) => +l);
    return [mapped.splice(2), mapped] as [[number, number], [number, number]];
};

const hashOfNominatimResult = (result: NominatimResponse) => {
    // Current approach: Hash for center
    return ngeohash.encode(+result.lat, +result.lon, 12);

    // Previous approach: hash for bounding box

    // const [lon, lat] = boundingBoxToLatLon(result.boundingbox);
    // const posA = new GeoPosition(lat[0], lon[0]);
    // const latDist = posA.Distance(new GeoPosition(lat[1], lon[0])) * 0.001;
    // const lonDist = posA.Distance(new GeoPosition(lat[0], lon[1])) * 0.001;
    // const precision =
    //     geoHashPrecisions.find((v) => v.kmLat >= latDist && v.kmLon >= lonDist)
    //         ?.precision ?? 1;
    // return ngeohash.encode(+result.lat, +result.lon, precision);
};

const nominatimQuery = (
    country: string,
    city: string,
    strategy: 'exact' | 'query' = 'exact'
): Promise<NominatimResponse | undefined> => {
    const searchParams =
        strategy === 'exact'
            ? `country=${country}&city=${city}`
            : `q=${city} ${country}`;
    const headers = { Referer: 'towards-edd/geoservice' };
    const uri = `${nominatimUrl}/search?${searchParams}&format=json&limit=1`;
    const clientServerOptions = { method: 'GET', uri: encodeURI(uri), headers };
    return new Promise(async (resolve, reject) => {
        while (performance.now() - latestRequest < minWaitTime) {
            const t = performance.now() - latestRequest;
            await new Promise((r) => setTimeout(r, t));
        }
        console.log(strategy, 'search:', country, city, '...');
        latestRequest = performance.now();
        request(clientServerOptions, async (error: any, response: any) => {
            if (error) reject(error);
            else {
                const result = JSON.parse(response.body);
                if (result.length) resolve(result[0]);
                else if (strategy === 'query') resolve(undefined);
                else {
                    try {
                        resolve(await nominatimQuery(country, city, 'query'));
                    } catch (e) {
                        reject(e);
                    }
                }
            }
        });
    });
};

const cleanedCityName = (country: string, city: string) => {
    const mapped = cityMapping[JSON.stringify({ country, city })];
    if (mapped !== undefined) return mapped;
    else if (country === 'Israel') return city.replace('Kibbutz', '');
    else return city;
};

export const getGeoHash12 = async (country: string, city: string) => {
    const searchCountry = countryMapping[country] ?? country;
    const searchCity = cleanedCityName(searchCountry, city);
    const result = await nominatimQuery(searchCountry, searchCity);
    return result ? hashOfNominatimResult(result) : undefined;
};

// export const getLocationData = async (country: string, city: string) => {
//     const searchCountry = countryMapping[country] ?? country;
//     const searchCity = cleanedCityName(searchCountry, city);
//     const result = await nominatimQuery(searchCountry, searchCity);
//     if (!result) return undefined;
//     else {
//         return {
//             hash: hashOfNominatimResult(result),
//             lat: result.lat,
//             lon: result.lon,
//         };
//     }
// };
