import {
    getInitialData,
    getStoredLocations,
    writeCsvFile,
} from './helpers/data-io.js';
import { capitalize } from './helpers/utils.js';
import { getGeoHash12 } from './helpers/geo-service.js';

// Initial data

const { laureates, prizes } = await getInitialData();

// Shared functions

const getLaureateLocation = (l: any, s: string) => {
    const loc = ['cityNow', 'countryNow'].reduce((p, c) => {
        const data = (l[s]?.place ?? {})[c]?.en ?? l[s + capitalize(c)]?.en;
        const foundationData =
            s === 'birth'
                ? l.founded?.place[c]?.en ?? l.foundedCity?.en
                : undefined;
        return { ...p, [c]: data ?? foundationData };
    }, {}) as any;
    return loc.cityNow && loc.countryNow
        ? JSON.stringify({ city: loc.cityNow, country: loc.countryNow })
        : undefined;
};

// Interim data

const locationsMap: { [x: string]: any } =
    (await getStoredLocations())?.reduce((p: any, c: any) => {
        return {
            ...p,
            [JSON.stringify({ city: c.city, country: c.country })]: c,
        };
    }, {}) ?? {};

const newLocationsJson = laureates
    .flatMap((l) => ['birth', 'death'].map((s) => getLaureateLocation(l, s)))
    .filter((l) => !!l && !locationsMap[l]);

if (newLocationsJson.length) {
    const uniques = [...new Set(newLocationsJson)];
    console.log('Collecting data for', uniques.length, 'new locations');
    for (const location of uniques) {
        const { country, city } = JSON.parse(location!);
        const hash = await getGeoHash12(country, city);
        locationsMap[location!] = { hash, country, city };
    }
}

const laureatesUpdated = laureates.map((l) => {
    let [birth, death] = [l.birth?.date ?? l.founded?.date, l.death?.date];
    const birth_year = birth ? +birth.split('-')[0] : undefined;
    const death_year = death ? +death.split('-')[0] : undefined;
    if (birth?.includes('-00-00')) birth = undefined;
    if (death?.includes('-00-00')) death = undefined;
    let [birthLocation, deathLocation] = [{}, {}];
    const birthLocationKey = getLaureateLocation(l, 'birth');
    const deathLocationKey = getLaureateLocation(l, 'death');

    if (birthLocationKey) {
        birthLocation = { birth_location: locationsMap[birthLocationKey].hash };
    }

    if (deathLocationKey) {
        deathLocation = { death_location: locationsMap[deathLocationKey].hash };
    }

    return {
        id: +l.id,
        name: l.orgName?.en ?? l.familyName?.en ?? l.fullName?.en,
        given_name: l.givenName?.en,
        nobelPrizes: l.nobelPrizes,
        gender: l.orgName ? 'org' : l.gender,
        wiki_url: l.wikipedia.english,
        laureate_url: l.links.find((link: any) => link.rel === 'laureate').href,
        external_url: l.links.find((link: any) => link.rel === 'external').href,
        birth,
        birth_year,
        death,
        death_year,
        ...birthLocation,
        ...deathLocation,
    };
});

const uniquePrizeCategoriesMap: { [k: string]: any } = [
    ...new Set(prizes.map((p) => p.category.en)),
].reduce((p, title, i) => ({ ...p, [title]: { id: i + 1, title } }), {});

const prizesUpdated = prizes
    .map((p) => ({
        category: uniquePrizeCategoriesMap[p.category.en].id,
        year: +p.awardYear,
        laureates: p.laureates?.map((l: any) => +l.id),
        prize_amount: p.prizeAmount,
        prize_amount_adjusted: p.prizeAmountAdjusted,
    }))
    .filter((p) => !!p.laureates);

// Final data

const locations = Object.values(locationsMap);
const prizeCategories = Object.values(uniquePrizeCategoriesMap);

const relationPrizeLaureate = prizesUpdated.flatMap((p) => {
    return p.laureates.map((laureate: number) => ({
        year: p.year,
        category: p.category,
        laureate,
    }));
});

const laureatesForMonolith = laureatesUpdated.map((l) => {
    const { nobelPrizes, ...data } = l;
    return data;
});

const prizesMapped = prizesUpdated.map((l) => {
    const { laureates, ...data } = l;
    return data;
});

const laureatesByPrize = laureatesUpdated.reduce((lp: any, lc) => {
    const { nobelPrizes, ...l } = lc;
    const categories = nobelPrizes.map((p: any) => p.category.en);
    const categoriesUpdated = categories.reduce((pp: any, pc: string) => {
        return { ...pp, [pc]: lp[pc] ? [...lp[pc], l] : [l] };
    }, {});
    return { ...lp, ...categoriesUpdated };
}, {});

// Write final data

await Promise.all([
    writeCsvFile(locations, 'locations'),
    writeCsvFile(prizesMapped, 'prizes'),
    writeCsvFile(prizeCategories, 'prize_categories'),
    writeCsvFile(relationPrizeLaureate, 'prize_to_laureate'),

    writeCsvFile(laureatesForMonolith, 'laureates', 'monolith_only'),

    ...Object.keys(laureatesByPrize).map((cat) => {
        const file = 'laureates_' + cat.split(' ')[0].toLowerCase();
        return writeCsvFile(laureatesByPrize[cat], file, 'distributed_only');
    }),
]);
