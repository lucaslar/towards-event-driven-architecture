import { ServiceConfig } from '../model/types/service-config';
import config from '../assets/config.json';
import { SyncToAsyncIpcConfig } from '../model/types/sync-to-async-ipc-config';
import { LoggingConfig } from '../model/types/logging-config';

/**
 * Validated synchronous service configurations.
 */
export let syncTestedConfigs: ServiceConfig[];

/**
 * Validated asynchronous service configurations.
 */
export let asyncTestedConfigs: ServiceConfig[];

/**
 * Configured source of truth.
 */
export let sourceOfTruth: ServiceConfig;

/**
 * Object containing logging information.
 */
export let loggingConfig: LoggingConfig;

/**
 * Map of maps (object) with synchronous path as key, HTTP method as second key and
 * interprocess communication configuration as value.
 */
export let syncToAsyncIpc: {
    [path: string]: { [method: string]: SyncToAsyncIpcConfig };
};
// async mapping is not covered in this service, but could be implemented reversely.

/**
 * Logs a message (as error) informing about an invalid service configuration including a prefix.
 * @param msg Message(s) to be logged.
 */
const logInvalid = (msg: string[]): void => {
    console.error('Invalid service configuration!', ...msg);
};

/**
 * Validates whether all names in a given list of service configurations are unique
 * and terminates the process with a prior informative message if not.
 *
 * @param configs Configurations to be checked for unique names.
 * @param scope Scope of the configurations (for logging purposes only).
 */
const validateUniqueNames = (configs: ServiceConfig[], scope: string) => {
    if ([...new Set(configs.map((s) => s.name))].length !== configs.length) {
        logInvalid([`${scope}:`, 'Duplicate config names!']);
        process.exit(1);
    }
};

/**
 * Initializes the application based on the configuration JSON file.
 * This process includes a validation of:
 * - exactly one source of truth configured
 * - all synchronous and asynchronous have different names (per group)
 * - Sets logging and interprocess communication configurations
 */
export const initConfig = () => {
    const { sync, async } = config.services;
    const displayedSync = sync.map((s) => ({ ...s, sync: true }));
    const displayedAsync = async.map((s) => ({ ...s, sync: false }));
    const syncSotConfigs = displayedSync.filter((s) => s.sourceOfTruth);
    const asyncSotConfigs = displayedAsync.filter((s) => s.sourceOfTruth);

    if (asyncSotConfigs.length + syncSotConfigs.length !== 1) {
        if (asyncSotConfigs.length + syncSotConfigs.length) {
            logInvalid([
                'Multiple services declared as source of truth:',
                [...syncSotConfigs, ...asyncSotConfigs].join(', '),
            ]);
        } else logInvalid(['No service declared as source of truth.']);
        process.exit(1);
    } else if (syncSotConfigs.length) {
        sourceOfTruth = { ...syncSotConfigs[0], sync: true };
    } else sourceOfTruth = { ...asyncSotConfigs[0], sync: false };

    validateUniqueNames(displayedSync, 'Synchronous service definitions');
    validateUniqueNames(displayedAsync, 'Asynchronous service definitions');

    syncTestedConfigs = displayedSync.filter((s) => !s.sourceOfTruth);
    asyncTestedConfigs = displayedAsync.filter((s) => !s.sourceOfTruth);

    syncToAsyncIpc = config.ipc.syncToAsync;
    loggingConfig = config.logging;

    console.log(
        `Valid service configuration! ${
            syncTestedConfigs.length
        } synchronous service(s) and ${
            asyncTestedConfigs.length
        } asynchronous service(s) tested against ${
            sourceOfTruth.sync ? 'synchronous' : 'asynchronous'
        } source of truth "${sourceOfTruth.name}".`
    );
};
