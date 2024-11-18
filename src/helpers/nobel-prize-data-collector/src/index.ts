import {
    getInitialData,
    getStoredLocations,
    writeCsvFile,
} from './helpers/data-io.js';
import ngeohash from 'ngeohash';
import { Laureate } from './model/laureate.js';

// Initial data

const { laureates, prizes } = await getInitialData();

// Shared function:

const firstLocation = (
    l: Laureate,
    event: 'birth' | 'founded' | 'death' = 'birth',
) => {
    const locations: ['cityNow', 'countryNow', 'city', 'country'] = [
        'cityNow',
        'countryNow',
        'city',
        'country',
    ];
    for (const location of locations) {
        if (l[event]?.place?.[location]?.latitude) {
            const { latitude, longitude } = l[event].place[location];
            return ngeohash.encode(+latitude, +longitude, 12);
        }
    }
};

// Interim data

const laureatesUpdated = laureates.map((l) => {
    let birth = l.birth?.date ?? l.founded?.date;
    let death = l.death?.date;
    if (birth?.includes('-00-00')) birth = undefined;
    if (death?.includes('-00-00')) death = undefined;

    return {
        id: +l.id,
        name: l.orgName?.en ?? l.familyName?.en ?? l.fullName?.en,
        given_name: l.givenName?.en,
        nobelPrizes: l.nobelPrizes,
        gender: l.orgName ? 'org' : l.gender,
        wiki_url: l.wikipedia.english,
        laureate_url: l.links.find((l) => l.rel === 'laureate')?.href,
        external_url: l.links.find((l) => l.rel === 'external')?.href,
        birth,
        birth_year: birth ? +birth.split('-')[0] : undefined,
        death,
        death_year: death ? +death.split('-')[0] : undefined,
        birth_location: firstLocation(l) ?? firstLocation(l, 'founded'),
        death_location: firstLocation(l, 'death'),
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
    writeCsvFile(prizesMapped, 'prizes'),
    writeCsvFile(prizeCategories, 'prize_categories'),
    writeCsvFile(relationPrizeLaureate, 'prize_to_laureate'),

    writeCsvFile(laureatesForMonolith, 'laureates', 'monolith_only'),

    ...Object.keys(laureatesByPrize).map((cat) => {
        const file = 'laureates_' + cat.split(' ')[0].toLowerCase();
        return writeCsvFile(laureatesByPrize[cat], file, 'distributed_only');
    }),
]);
