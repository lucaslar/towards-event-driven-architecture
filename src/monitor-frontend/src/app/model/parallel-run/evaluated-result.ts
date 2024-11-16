import { ServiceConfig } from '../service-config';
import { Quality } from './quality';

export type EvaluatedResult = {
    quality: Quality;
    response: any;
    config: ServiceConfig;
};
