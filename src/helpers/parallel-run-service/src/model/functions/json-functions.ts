import { SyncToAsyncIpcConfig } from '../types/sync-to-async-ipc-config';

/**
 * @param arg Value to be tested for being an object and not null.
 * @return True if the given value is an object and not null, false if not.
 */
const isObject = (arg: any) => typeof arg === 'object' && arg !== null;

/**
 * Cleans an object by sorting its arrays and removing null values if configured.
 *
 * @param arg Value to be cleaned.
 * @param rmNull True if null values are to be removed, false if not.
 * @return Cleaned object.
 */
const cleanJson = (arg: any, rmNull?: boolean) => {
    if (arg && Array.isArray(arg)) {
        arg = arg.sort((a, b) =>
            JSON.stringify(a) < JSON.stringify(b) ? 1 : -1
        );
    }

    if (isObject(arg)) {
        const iterate = (obj: any) => {
            Object.keys(obj).forEach((key) => {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    if (Array.isArray(obj[key])) {
                        obj[key] = (obj[key] as any[]).sort((a, b) =>
                            JSON.stringify(a) < JSON.stringify(b) ? 1 : -1
                        );
                    }
                    iterate(obj[key]);
                } else if (obj[key] === null && rmNull) delete obj[key];
            });
        };
        iterate(arg);
    }
    return arg;
};

/**
 * Compares two objects and validates if they have equal content.
 * If configured and available, a compared attribute is validated instead of the whole object.
 *
 * @param contentA First object to be compared.
 * @param contentB Second object to be compared.
 * @param config Configuration for comparison.
 * @return True in case of equal contents, false if not.
 */
export const isEqualContent = (
    contentA: any,
    contentB: any,
    config: SyncToAsyncIpcConfig
): boolean => {
    const rmNull = config.removeNullValuesInComparison;
    const prop = config.comparedPropertyIfExists;

    if (prop && contentA[prop]) contentA = contentA[prop];
    if (prop && contentB[prop]) contentB = contentB[prop];

    const cleanedA = cleanJson(JSON.parse(JSON.stringify(contentA)), rmNull);
    const cleanedB = cleanJson(JSON.parse(JSON.stringify(contentB)), rmNull);

    return JSON.stringify(cleanedA) === JSON.stringify(cleanedB);
};

/**
 * @param str String to be parsed.
 * @return Parsed value or the string itself in case of an error.
 */
export const parseJsonWithDefault = (str: string): any => {
    try {
        return JSON.parse(str);
    } catch (err) {
        return str;
    }
};
