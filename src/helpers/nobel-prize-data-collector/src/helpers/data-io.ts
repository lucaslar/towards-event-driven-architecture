import fs from 'fs';
import json2csv from 'json2csv';
import {
    collectLaureateApiData,
    collectPrizeApiData,
} from './api-collector.js';
import csv from 'csvtojson/index.js';
import { Laureate } from '../model/laureate.js';
import { NobelPrize } from '../model/nobel-prize.js';

/**
 * Directory the data is to be stored in.
 */
const dir = process.env.dir || '/usr/src/app/data';

const readJsonData = async (api: string): Promise<Laureate[] | undefined> => {
    const file = `${dir}/cached_api/${api}_api.json`;
    if (!fs.existsSync(file)) return undefined;
    return JSON.parse(await fs.promises.readFile(file, { encoding: 'utf8' }));
};

const writeJsonCacheFile = async (data: any, api: string) => {
    const cacheDir = `${dir}/cached_api`;

    if (!fs.existsSync(cacheDir)) {
        await fs.promises.mkdir(cacheDir, { recursive: true });
    }

    const file = `${cacheDir}/${api}_api.json`;
    const json = JSON.stringify(data, undefined, 2);
    await fs.promises.writeFile(file, json, 'utf-8');
    console.log('Successfully wrote (= cached):', file);
};

export const writeCsvFile = async (
    data: any,
    filename: string,
    scope: 'monolith_only' | 'distributed_only' | 'shared' = 'shared',
) => {
    const scopeDir = `${dir}/csv_data/${scope}`;

    if (!fs.existsSync(scopeDir)) {
        await fs.promises.mkdir(scopeDir, { recursive: true });
    }

    const file = `${scopeDir}/${filename}.csv`;
    await fs.promises.writeFile(file, json2csv.parse(data), 'utf-8');
    console.log('Successfully wrote:', file);
};

export const getInitialData = async (): Promise<{
    laureates: Laureate[];
    prizes: NobelPrize[];
}> => {
    const laureates = process.env.devMode
        ? ((await readJsonData('laureate')) ?? (await collectLaureateApiData()))
        : await collectLaureateApiData();

    const prizes = process.env.devMode
        ? ((await readJsonData('prize')) ?? (await collectPrizeApiData()))
        : await collectPrizeApiData();

    await writeJsonCacheFile(laureates, 'laureate');
    await writeJsonCacheFile(prizes, 'prize');

    return { laureates, prizes };
};

export const getStoredLocations = () => {
    const file = `${dir}/csv_data/shared/locations.csv`;
    return fs.existsSync(file) ? csv().fromFile(file) : undefined;
};
