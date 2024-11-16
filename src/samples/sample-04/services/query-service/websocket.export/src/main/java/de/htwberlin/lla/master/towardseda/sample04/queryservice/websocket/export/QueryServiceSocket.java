package de.htwberlin.lla.master.towardseda.sample04.queryservice.websocket.export;

import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;

/**
 * Websocket for duplex communication to clients.
 */
public interface QueryServiceSocket {
    /**
     * @param vertx Vertx context.
     * @return Router including subrouter running on "/" handling websocket connections.
     */
    Router createRouter(final Vertx vertx);

    /**
     * Sends data to the client socket matching the given uuid (if any).
     *
     * @param type Type of data.
     * @param data Data to be sent.
     */
    void sendDataByUuid(final String uuid, final String type, final Object data);
}
