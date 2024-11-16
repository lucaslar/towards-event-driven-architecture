package de.htwberlin.lla.master.towardseda.sample04.queryservice.amqp.export;

import io.vertx.core.json.JsonObject;

/**
 * Controller defining all methods in relation to efferent, i.e. published, events.
 */
public interface RabbitEfferent {

    /**
     * Initializes all channels the client writes to.
     */
    void initializeChannels();

    /**
     * Publishes an event informing about a valid query to the respective exchange.
     *
     * @param data Validated query data to be published.
     */
    void publishSubmittedQuery(final JsonObject data);
}
