package de.htwberlin.lla.master.towardseda.sample04.prizeservice.amqp;

import de.htwberlin.lla.master.towardseda.sample04.prizeservice.amqp.export.RabbitAfferent;
import de.htwberlin.lla.master.towardseda.sample04.prizeservice.prize.export.PrizeService;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.rabbitmq.RabbitMQClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;

@RequiredArgsConstructor
@Controller
public class RabbitAfferentImpl implements RabbitAfferent {
    private final PrizeService PRIZE_SERVICE;
    private final RabbitMQClient CLIENT;
    private final Vertx VERTX;

    private final String LAUREATES_TOPIC_CHANNEL = "laureate.results";
    private final String LAUREATES_TOPIC_BINDER_CHANNEL_NAME = "prize.laureatebinder";
    private final String LAUREATE_TOPIC_ROUTING_KEY = "laureate.results.#";

    @Override
    public Future<Void> initializeChannels() {
        declareDurableQueue(LAUREATES_TOPIC_BINDER_CHANNEL_NAME);
        return Future.future(f -> {
            bindQueueToTopicExchange(LAUREATES_TOPIC_BINDER_CHANNEL_NAME, LAUREATES_TOPIC_CHANNEL).onSuccess(ar -> {
                consumeLaureateSearchSubmissions();
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

    private Future<Void> bindQueueToTopicExchange(final String queue, final String exchange) {
        return Future.future(future -> {
            CLIENT.queueBind(queue, exchange, LAUREATE_TOPIC_ROUTING_KEY, ar -> {
                if (ar.failed()) {
                    VERTX.executeBlocking(blockingFuture -> {
                        try {
                            System.err.println("Rabbit: An error occurred on binding '" + queue + "' to topic '" + exchange + "':" + ar.cause().toString());
                            System.err.println("Rabbit: Reattempting to bind '" + queue + "' to '" + exchange + "' in 5 seconds");
                            Thread.sleep(5000);
                            bindQueueToTopicExchange(queue, exchange).onComplete(ar2 -> {
                                blockingFuture.complete();
                                if (ar2.succeeded()) future.complete();
                            });
                        } catch (InterruptedException e) {
                            System.err.println("Rabbit: Reconnection interrupted.");
                            blockingFuture.complete();
                        }
                    });
                } else {
                    System.out.println("Rabbit: '" + queue + "' successfully bound to topic '" + exchange + "'.");
                    future.complete();
                }
            });
        });
    }

    private void consumeLaureateSearchSubmissions() {
        CLIENT.basicConsumer(LAUREATES_TOPIC_BINDER_CHANNEL_NAME, ar -> {
            if (ar.succeeded()) {
                ar.result().handler(message -> {
                    final JsonObject body = message.body().toJsonObject();
                    if (body == null || body.isEmpty()) {
                        System.err.println("Rabbit ('" + LAUREATES_TOPIC_BINDER_CHANNEL_NAME + "'): Body must not be null or empty!");
                    } else if (!body.containsKey("laureates") || !body.containsKey("laureates") || !body.containsKey("scope")) {
                        System.err.println("Rabbit ('" + LAUREATES_TOPIC_BINDER_CHANNEL_NAME + "'): Body must contain 'laureates', 'scope' and 'uuid'!");
                    } else {
                        final JsonArray laureates = body.getJsonArray("laureates");

                        if (!laureates.isEmpty()) {
                            final String uuid = body.getString("uuid");
                            final String scope = body.getString("scope");
                            final int[] ids = laureates.stream().mapToInt(l -> JsonObject.mapFrom(l).getInteger("id")).toArray();
                            PRIZE_SERVICE.searchPrizesForLaureates(uuid, scope, ids);
                        } else
                            System.out.println("Rabbit: Consumed event without laureates found. Will not search for prizes.");
                    }
                });
            } else {
                System.err.println("Rabbit: An error occurred on consuming from queue '" + LAUREATES_TOPIC_BINDER_CHANNEL_NAME + "':" + ar.cause().toString());
            }
        });
    }
}
