import { ServiceConfig } from './types/service-config';
import SockJS from 'sockjs-client';
import { WebSocket } from 'ws';
import { performance } from 'perf_hooks';
import { AsyncResultCache } from './types/async-result-cache';
import { loggingConfig } from '../services/config.service';

/**
 * Representation of an asynchronous client.
 */
export class AsyncClientImpl {
    /**
     * True if the socket connection is active, false if not.
     * @private
     */
    private _isRunning = false;

    /**
     * Socket connection to the asynchronous service.
     * @private
     */
    private socket?: WebSocket;

    /**
     * Object serving as a cache for asynchronous results with custom strings as keys and {{ AsyncResultCache }} as values.
     * @private
     */
    private resultCache: { [k: string]: AsyncResultCache } = {};

    /**
     * Establishes a socket connection.
     *
     * @param config Configuration of the service this implementation communicates with.
     */
    constructor(readonly config: ServiceConfig) {
        this.createSocket();
    }

    /**
     * Sends a message to the service this implementation communicates with and defines an asynchronous
     * result cache entry.
     *
     * @param data Data to be sent.
     * @param clientRef Unique identifier.
     * @param callback Function to be executed on receiving a result.
     * @param asyncChannel Channel the message is to be sent to (see inline comment for SockJS).
     */
    send(
        data: any,
        clientRef: string,
        callback: (latency: number, data: any) => void,
        asyncChannel?: string | null
    ): void {
        // No channel concept in SockJS. Therefore, the channel is ignored.
        if (!this.isRunning) {
            const msg = `${this.config.name}: Not running - no message emitted.`;
            console.warn(msg);
        } else {
            const jsonStr = JSON.stringify({ queryData: data, clientRef });
            const start = performance.now();
            this.socket?.send(jsonStr, (c) => console.log(c));
            this.resultCache[clientRef] = { start, callback, data: {} };
        }
    }

    /**
     * @return True if the socket connection is active, false if not.
     */
    get isRunning() {
        return this._isRunning;
    }

    /**
     * Informs about an established socket connection and sets the internal boolean {{ _isRunning }} to true.
     * @private
     */
    private onSocketOpened(): void {
        console.log(this.config.name, '=> socket opened');
        this._isRunning = true;
    }

    /**
     * Logs a received message if configured and maps the result to its initiating, cached request.
     * This process includes measuring latency in comparison to the initiating request and handling the response.
     * If no mapping is possible, the reason is logged.
     *
     * @param message Received message.
     * @private
     */
    private onSocketMessage(message: any): void {
        const perf = performance.now();
        if (loggingConfig.logAsynchronousMessages) {
            console.log(this.config.name, '=> message:', message);
        }

        const data = JSON.parse(message.data);
        if (data.ref) {
            const cached = this.resultCache[data.ref];
            if (cached) this.handleResponse(data, data.ref, perf);
            else {
                const msg = `Cannot map response. No values stored for '${data.ref}'.`;
                console.log(msg);
            }
        } else console.log("Cannot map async response. No 'ref' property.");
    }

    /**
     * Informs about a closed socket, sets {{ _isRunning }} to false and attempts to reconnect after 5s
     * (repeated until a connection can be established).
     * @private
     */
    private onSocketClosed(): void {
        console.log(
            this.config.name,
            '=> socket closed. Attempting to reconnect in 5s.'
        );
        this._isRunning = false;
        delete this.socket;
        setTimeout(() => this.createSocket(), 5000);
    }

    /**
     * Creates a socket connection to the configured service.
     * @private
     */
    private createSocket(): void {
        const connectionUrl = `http://${this.config.host}:${this.config.port}/`;
        const socket = new SockJS(connectionUrl);
        socket.onopen = () => this.onSocketOpened();
        socket.onmessage = (message: any) => this.onSocketMessage(message);
        socket.onclose = () => this.onSocketClosed();
        this.socket = socket;
    }

    /**
     * Handles a response by caching it based on the received type.
     * In case of a rejected/closed query, the cached search is deleted.
     * If the query is not closed, it is validated.
     *
     * @param data Received data.
     * @param ref Reference to the cached object/initiating request.
     * @param perf Measured performance on receiving the result.
     * @private
     */
    private handleResponse(
        data: { type: string; ref?: string; data?: any; message?: string },
        ref: string,
        perf: number
    ): void {
        const cached = this.resultCache[ref];
        if (data.type === 'query.submitted') cached.data.qr = data.data;
        else if (data.type === 'query.rejected') cached.data.qe = data.message;
        else if (data.type === 'laureate.results') {
            cached.data.lr = [...(cached.data.lr ?? []), data.data];
        } else if (data.type === 'laureate.failed') {
            cached.data.le = [...(cached.data.le ?? []), data.data];
        } else if (data.type === 'prize.results') {
            cached.data.pr = [...(cached.data.pr ?? []), data.data];
        } else if (data.type === 'prize.failed') {
            cached.data.pe = [...(cached.data.pe ?? []), data.data];
        } else if (data.type !== 'query.closed') {
            console.log(`Unknown message type '${data.type}'`);
        }

        if (data.type !== 'query.closed') {
            cached.callback(perf - cached.start, this.assembleResult(cached));
        }

        if (data.type === 'query.rejected' || data.type === 'query.closed')
            delete this.resultCache[ref];
    }

    /**
     * Assembles a result in order to connect objects so that they have the same structure as synchronous results.
     *
     * @param cached Cache for an initialing request containing the data to be assembled.
     * @return Assembled result.
     * @private
     */
    private assembleResult(cached: AsyncResultCache): any {
        const assembled: any = cached.data.qr ?? cached.data.qe ?? {};

        if (
            typeof assembled === 'object' &&
            assembled !== null &&
            (cached.data.lr?.length || cached.data.le?.length)
        ) {
            assembled.serviceResults = [
                ...(cached.data.le ?? []).map((l: any) => ({
                    error: l.message,
                    service: l.scope,
                })),
                ...(cached.data.lr ?? []).map((lr: any) => {
                    const service = lr.scope;
                    const results = lr.laureates;

                    const prizeData = cached.data.pr?.find(
                        (p: any) => p.scope === service
                    );

                    if (prizeData) {
                        results.forEach((l: any) => {
                            l.prizes = prizeData.prizes.filter(
                                (p: any) => p.laureate === l.id
                            );
                        });
                    } else {
                        const prizeErrs = cached.data.pe?.find(
                            (p: any) => p.scope === service
                        );
                        if (prizeErrs) {
                            results.forEach((l: any) => {
                                l.prizesErr = prizeErrs.message;
                            });
                        }
                    }

                    return { service, results };
                }),
            ];
        }

        return assembled;
    }
}
