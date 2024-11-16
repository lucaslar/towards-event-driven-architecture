package de.htwberlin.lla.master.towardseda.sample04.laureateservice.amqp.export;

import io.vertx.core.Future;

/**
 * Controller defining all methods in relation to afferent events, i.e. listeners.
 */
public interface RabbitAfferent {

    /**
     * Initializes all the service's queues and binds them to exchanges.
     * @return Future resolved once the bindig is completed.
     */
    Future<Void> initializeChannels();
}
