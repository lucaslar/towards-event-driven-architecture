import express, { Application, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { initConfig, sourceOfTruth } from './services/config.service';
import {
    initializeImplementations,
    parallelRequestErr,
    parallelRequestSuccess,
} from './services/parallel.service';
import bodyParser from 'body-parser';
import { ClientRequest, createServer } from 'http';
import { performance } from 'perf_hooks';
import { initializeSocket } from './services/statistics.service';
import { connectToMongoDb } from './services/mongo.service';

/**
 * Express server for the application to run.
 */
const app: Application = express();

initConfig(); // Initializes the application logic (config service) prior to starting the server

// The application does only support sync => async.
if (sourceOfTruth.sync) {
    /**
     * Adds a variables to the response locals in order to measure the request's latency and
     * stringifies JSON body data if any.
     *
     * @param proxyReq Proxied client request
     * @param req Request object.
     * @param res Response object.
     */
    const onProxyReq = (
        proxyReq: ClientRequest,
        req: Request,
        res: Response
    ) => {
        res.locals.performance = performance.now();
        if (req.body) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    };

    /**
     * Creates a proxy middleware with the source of truth as target, built-in error/timeout,
     * request (see above) and response (=> parallel run) handlers.
     */
    const proxyMiddleware = createProxyMiddleware({
        target: sourceOfTruth,
        onError: (e, req, res) => {
            if ((e as any).code === 'ECONNRESET') {
                const message = 'Timeout (> 30s)';
                res.status(504).send(message);
                return parallelRequestErr(message, req, res);
            } else {
                res.status(500).send(e);
                return parallelRequestErr(e, req, res);
            }
        },
        onProxyRes: (proxyRes, req, res) =>
            parallelRequestSuccess(proxyRes, req, res),
        onProxyReq,
        proxyTimeout: 30000,
    });

    connectToMongoDb() // Connects the service to the MongoDB used for storing statistical data
        .then(() => {
            console.log('Successfully connected to statistics DB (MongoDB).');
            const port = 8080;
            app.use(bodyParser.json()); // Enables reading JSON payloads
            app.use('*', proxyMiddleware); // Proxies each request to the source of truth
            initializeImplementations(); // Initializes tha sync. and async client implementations.
            const http = createServer(app); // Creates an HTTP server
            initializeSocket(http); // Initializes a socket for asynchronously sending statistics
            http.listen(port, () => console.log(`Server started at :${port}`)); // Starts the server
        })
        .catch((err) => {
            console.error(`Could not connect to statistics DB (MongoDB): ${err}`);
            process.exit(1)
        });
} else {
    console.warn('This tool does only support a synchronous source of truth.');
}
