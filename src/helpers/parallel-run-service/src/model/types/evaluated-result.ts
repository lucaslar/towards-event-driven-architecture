import { Quality } from './quality';
import { ServiceConfig } from './service-config';

export type EvaluatedResult = {
    quality: Quality;
    response: any;
    config: ServiceConfig;
};
