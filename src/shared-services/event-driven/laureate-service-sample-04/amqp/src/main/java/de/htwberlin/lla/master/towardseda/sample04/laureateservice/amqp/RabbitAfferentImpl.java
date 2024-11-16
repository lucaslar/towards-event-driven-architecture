package de.htwberlin.lla.master.towardseda.sample04.laureateservice.amqp;

import de.htwberlin.lla.master.towardseda.sample04.laureateservice.amqp.export.RabbitAfferent;
import de.htwberlin.lla.master.towardseda.sample04.laureateservice.laureate.export.LaureateService;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.rabbitmq.RabbitMQClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;

@RequiredArgsConstructor
@Controller
public class RabbitAfferentImpl implements RabbitAfferent {

    private final LaureateService LAUREATE_SERVICE;
    private final RabbitMQClient CLIENT;
    private final Vertx VERTX;

    private final String QUERY_FANOUT_CHANNEL_NAME = "query.submitted";
    private final String QUERY_FANOUT_BINDER_CHANNEL_NAME = "laureate.querybinder." + System.getenv("SCOPE").toLowerCase().replaceAll("\\s+", "");

    @Override
    public Future<Void> initializeChannels() {
        declareDurableQueue(QUERY_FANOUT_BINDER_CHANNEL_NAME);
        return Future.future(f -> {
            bindQueueToFanoutExchange(QUERY_FANOUT_BINDER_CHANNEL_NAME, QUERY_FANOUT_CHANNEL_NAME).onSuccess(ar -> {
                consumeQuerySubmissions();
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

    private Future<Void> bindQueueToFanoutExchange(final String queue, final String exchange) {
        return Future.future(future -> {
            CLIENT.queueBind(queue, exchange, "", ar -> {
                if (ar.failed()) {
                    VERTX.executeBlocking(blockingFuture -> {
                        try {
                            System.err.println("Rabbit: An error occurred on binding '" + queue + "' to fanout '" + exchange + "':" + ar.cause().toString());
                            System.err.println("Rabbit: Reattempting to bind '" + queue + "' to '" + exchange + "' in 5 seconds");
                            Thread.sleep(5000);
                            bindQueueToFanoutExchange(queue, exchange).onComplete(ar2 -> {
                                blockingFuture.complete();
                                if (ar2.succeeded()) future.complete();
                            });
                        } catch (InterruptedException e) {
                            System.err.println("Rabbit: Reconnection interrupted.");
                            blockingFuture.complete();
                        }
                    });
                } else {
                    System.out.println("Rabbit: '" + queue + "' successfully bound to fanout '" + exchange + "'.");
                    future.complete();
                }
            });
        });
    }

    private void consumeQuerySubmissions() {
        CLIENT.basicConsumer(QUERY_FANOUT_BINDER_CHANNEL_NAME, ar -> {
            if (ar.succeeded()) {
                ar.result().handler(message -> {
                    final JsonObject body = message.body().toJsonObject();
                    if (body == null || body.isEmpty()) {
                        System.err.println("Rabbit ('" + QUERY_FANOUT_BINDER_CHANNEL_NAME + "'): Body must not be null or empty!");
                    } else if (!body.containsKey("queryData") || !body.containsKey("uuid")) {
                        System.err.println("Rabbit ('" + QUERY_FANOUT_BINDER_CHANNEL_NAME + "'): Body must contain 'queryData' and 'uuid'!");
                    } else LAUREATE_SERVICE.search(body);
                });
            } else {
                System.err.println("Rabbit: An error occurred on consuming from queue '" + QUERY_FANOUT_BINDER_CHANNEL_NAME + "':" + ar.cause().toString());
            }
        });
    }
}
