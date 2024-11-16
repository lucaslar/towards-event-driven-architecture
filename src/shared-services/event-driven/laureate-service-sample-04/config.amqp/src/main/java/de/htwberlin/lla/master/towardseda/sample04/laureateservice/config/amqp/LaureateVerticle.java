package de.htwberlin.lla.master.towardseda.sample04.laureateservice.config.amqp;

import de.htwberlin.lla.master.towardseda.sample04.laureateservice.amqp.export.RabbitAfferent;
import de.htwberlin.lla.master.towardseda.sample04.laureateservice.amqp.export.RabbitEfferent;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.rabbitmq.RabbitMQClient;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class LaureateVerticle extends AbstractVerticle {

    private final RabbitMQClient RABBIT_CLIENT;
    private final RabbitAfferent LAUREATE_SERVICE_RABBIT_AFFERENT;
    private final RabbitEfferent LAUREATE_SERVICE_RABBIT_EFFERENT;

    @Override
    public void start(final Promise<Void> startPromise) {
        RABBIT_CLIENT.start().onComplete(ar -> {
            if (ar.succeeded()) {
                System.out.println("Verticle: Rabbit started (scope: '" + System.getenv("SCOPE") + "').");
                LAUREATE_SERVICE_RABBIT_EFFERENT.initializeChannels();
                LAUREATE_SERVICE_RABBIT_AFFERENT.initializeChannels().onSuccess(ar2 -> startPromise.complete());
            } else System.err.println("Verticle: Could not start/connect to Rabbit (retry enabled): " + ar.cause());
        });
    }
}
