import fs from 'fs';
import json2csv from 'json2csv';
import {
    collectLaureateApiData,
    collectPrizeApiData,
} from './api-collector.js';
import csv from 'csvtojson/index.js';

/**
 * Directory the data is to be stored in.
 */
const dir = process.env.dir || '/usr/src/app/data';

const readJsonData = async (api: string): Promise<any[]> => {
    const file = `${dir}/cached_api/${api}_api.json`;
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
    scope: 'monolith_only' | 'distributed_only' | 'shared' = 'shared'
) => {
    const scopeDir = `${dir}/csv_data/${scope}`;

    if (!fs.existsSync(scopeDir)) {
        await fs.promises.mkdir(scopeDir, { recursive: true });
    }

    const file = `${scopeDir}/${filename}.csv`;
    await fs.promises.writeFile(file, json2csv.parse(data), 'utf-8');
    console.log('Successfully wrote:', file);
};

export const getInitialData = async () => {
    let laureates, prizes;
    if (process.env.devMode) {
        [laureates, prizes] = await Promise.all(
            ['laureate', 'prize'].map((s) => readJsonData(s))
        );
    } else {
        laureates = await collectLaureateApiData();
        prizes = await collectPrizeApiData();
        await writeJsonCacheFile(laureates, 'laureate');
        await writeJsonCacheFile(prizes, 'prize');
    }

    return { laureates, prizes };
};

export const getStoredLocations = () => {
    const file = `${dir}/csv_data/shared/locations.csv`;
    return fs.existsSync(file) ? csv().fromFile(file) : undefined;
};
