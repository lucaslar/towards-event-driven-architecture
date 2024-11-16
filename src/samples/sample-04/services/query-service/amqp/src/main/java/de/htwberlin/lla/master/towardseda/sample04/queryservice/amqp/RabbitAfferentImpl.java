package de.htwberlin.lla.master.towardseda.sample04.queryservice.amqp;

import de.htwberlin.lla.master.towardseda.sample04.queryservice.amqp.export.RabbitAfferent;
import de.htwberlin.lla.master.towardseda.sample04.queryservice.websocket.export.QueryServiceSocket;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.rabbitmq.RabbitMQClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;

@RequiredArgsConstructor
@Controller
public class RabbitAfferentImpl implements RabbitAfferent {
    private final QueryServiceSocket SOCKET;
    private final RabbitMQClient CLIENT;
    private final Vertx VERTX;

    @Override
    public Future<Void> initializeChannels() {
        final String LAUREATES_TOPIC_BINDER_CHANNEL_NAME = "query.laureatebinder.success";
        final String LAUREATES_ERR_TOPIC_BINDER_CHANNEL_NAME = "query.laureatebinder.err";
        final String PRIZE_FANOUT_BINDER_CHANNEL_NAME = "query.prizebinder.success";
        final String PRIZE_ERR_FANOUT_BINDER_CHANNEL_NAME = "query.prizebinder.err";

        declareDurableQueue(LAUREATES_TOPIC_BINDER_CHANNEL_NAME);
        declareDurableQueue(LAUREATES_ERR_TOPIC_BINDER_CHANNEL_NAME);
        declareDurableQueue(PRIZE_FANOUT_BINDER_CHANNEL_NAME);
        declareDurableQueue(PRIZE_ERR_FANOUT_BINDER_CHANNEL_NAME);

        final String LAUREATES_TOPIC_NAME = "laureate.results";
        final String LAUREATES_ERR_TOPIC_NAME = "laureate.failed";
        final String PRIZES_FANOUT_NAME = "prize.results";
        final String PRIZES_ERR_FANOUT_NAME = "prize.failed";

        return Future.future(f -> {
            CompositeFuture.join(
                    bindQueueToTopicExchange(LAUREATES_TOPIC_BINDER_CHANNEL_NAME, LAUREATES_TOPIC_NAME, "laureate.results.#"),
                    bindQueueToTopicExchange(LAUREATES_ERR_TOPIC_BINDER_CHANNEL_NAME, LAUREATES_ERR_TOPIC_NAME, "laureate.failed.#"),
                    bindQueueToFanoutExchange(PRIZE_FANOUT_BINDER_CHANNEL_NAME, PRIZES_FANOUT_NAME),
                    bindQueueToFanoutExchange(PRIZE_ERR_FANOUT_BINDER_CHANNEL_NAME, PRIZES_ERR_FANOUT_NAME)
            ).onSuccess(ar -> {
                consumeAndSendToSocketAsData(LAUREATES_TOPIC_BINDER_CHANNEL_NAME, LAUREATES_TOPIC_NAME);
                consumeAndSendToSocketAsData(LAUREATES_ERR_TOPIC_BINDER_CHANNEL_NAME, LAUREATES_ERR_TOPIC_NAME);
                consumeAndSendToSocketAsData(PRIZE_FANOUT_BINDER_CHANNEL_NAME, PRIZES_FANOUT_NAME);
                consumeAndSendToSocketAsData(PRIZE_ERR_FANOUT_BINDER_CHANNEL_NAME, PRIZES_ERR_FANOUT_NAME);
                f.complete();
            });
        });
    }

    private void declareDurableQueue(final String name) {
        final JsonObject config = new JsonObject().put("x-message-ttl", 60 * 60 * 1000);
        CLIENT.queueDeclare(name, true, false, false, config, ar -> {
            if (ar.failed()) {
                System.err.println("Rabbit: An error occurred on initializing queue '" + name + "':" + ar.cause().toString());
            } else System.out.println("Rabbit: Queue '" + name + "' declared successfully.");
        });
    }

    private Future<Void> bindQueueToFanoutExchange(final String name, final String exchange) {
        return bindQueueToExchange("fanout", name, exchange, "");
    }

    private Future<Void> bindQueueToTopicExchange(final String name, final String exchange, final String routingKey) {
        return bindQueueToExchange("topic", name, exchange, routingKey);
    }

    private Future<Void> bindQueueToExchange(final String type, final String queue, final String exchange, final String routingKey) {
        return Future.future(future -> {
            CLIENT.queueBind(queue, exchange, routingKey, ar -> {
                if (ar.failed()) {
                    VERTX.executeBlocking(blockingFuture -> {
                        try {
                            System.err.println("Rabbit: An error occurred on binding '" + queue + "' to " + type + " '" + exchange + "':" + ar.cause().toString());
                            System.err.println("Rabbit: Reattempting to bind '" + queue + "' to " + type + "'" + exchange + "' in 5 seconds");
                            Thread.sleep(5000);
                            bindQueueToExchange(type, queue, exchange, routingKey).onComplete(ar2 -> {
                                blockingFuture.complete();
                                if (ar2.succeeded()) future.complete();
                            });
                        } catch (InterruptedException e) {
                            System.err.println("Rabbit: Reconnection interrupted.");
                            blockingFuture.complete();
                        }
                    });
                } else {
                    System.out.println("Rabbit: '" + queue + "' successfully bound to " + type + " '" + exchange + "'.");
                    future.complete();
                }
            });
        });
    }

    private void consumeAndSendToSocketAsData(final String channel, final String type) {
        CLIENT.basicConsumer(channel, ar -> {
            if (ar.succeeded()) {
                ar.result().handler(message -> {
                    final JsonObject body = message.body().toJsonObject();
                    if (body == null || body.isEmpty() || !body.containsKey("uuid")) {
                        System.err.println("Rabbit ('" + channel + "'): Body must not be null or empty and contain a uuid!");
                    } else SOCKET.sendDataByUuid(body.getString("uuid"), type, body);
                });
            } else {
                System.err.println("Rabbit: An error occurred on consuming from queue '" + channel + "':" + ar.cause().toString());
            }
        });
    }
}
