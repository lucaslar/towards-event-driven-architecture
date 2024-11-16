import { ServiceConfig } from './types/service-config';
import { IncomingMessage, request, RequestOptions } from 'http';
import { performance } from 'perf_hooks';
import { parseJsonWithDefault } from './functions/json-functions';
import { SyncResponse } from './types/sync-response';

/**
 * Representation of a synchronous client.
 */
export class SyncClientImpl {

    /**
     * @param config Configuration of the service this implementation communicates with.
     */
    constructor(readonly config: ServiceConfig) {}

    /**
     * Sends an HTTP request with a configured timeout and measures latency.
     *
     * @param path HTTP path.
     * @param method HTTP method.
     * @param body Body to be sent.
     * @return Promise resolved with result + latency or rejected with a reason + latency.
     */
    async handleHttpRequest(
        path: string,
        method: string,
        body: any
    ): Promise<{ result: SyncResponse; latency: number }> {
        return new Promise((resolve, reject) => {
            const { host, port } = this.config;
            const options: RequestOptions = {
                host,
                port,
                path,
                method,
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000,
            };

            const perf = performance.now();
            const req = request(options, async (res) => {
                const result = await this.handleRes(res);
                resolve({
                    result,
                    latency: performance.now() - perf,
                });
            });

            const rejWithLatency = (e: any) => {
                reject({ reason: e, latency: performance.now() - perf });
            };

            req.on('error', (e) => rejWithLatency(e));
            req.on('timeout', () => rejWithLatency('Timeout (> 30s)'));
            req.on('uncaughtException', (e) => rejWithLatency(e));
            req.write(JSON.stringify(body ?? {}));
            req.end();
        });
    }

    /**
     * Handles a synchronous HTTP response.
     *
     * @param proxyRes Incoming response message.
     * @return Promise resolved with a status code + result data or rejected with status code + error message.
     */
    async handleRes(proxyRes: IncomingMessage): Promise<SyncResponse> {
        return new Promise((res, rej) => {
            let chunks = '';
            const status = proxyRes.statusCode;
            proxyRes.on('data', (chunk) => (chunks += chunk));
            proxyRes.on('end', () => {
                res({ status, resultData: parseJsonWithDefault(chunks) });
            });
            proxyRes.on('error', (err) =>
                rej({ status, message: err.message })
            );
        });
    }
}
