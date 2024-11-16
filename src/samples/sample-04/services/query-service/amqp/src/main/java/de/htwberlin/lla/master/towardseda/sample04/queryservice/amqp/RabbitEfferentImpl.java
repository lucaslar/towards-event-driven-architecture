package de.htwberlin.lla.master.towardseda.sample04.queryservice.amqp;

import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.BasicProperties;
import de.htwberlin.lla.master.towardseda.sample04.queryservice.amqp.export.RabbitEfferent;
import io.vertx.core.json.JsonObject;
import io.vertx.rabbitmq.RabbitMQClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;

@RequiredArgsConstructor
@Controller
public class RabbitEfferentImpl implements RabbitEfferent {

    private final String QUERY_FANOUT_CHANNEL_NAME = "query.submitted";

    private final RabbitMQClient CLIENT;

    @Override
    public void initializeChannels() {
        declareFanoutExchange(QUERY_FANOUT_CHANNEL_NAME);
        System.out.println("Rabbit: Initialized efferent channels.");
    }

    @Override
    public void publishSubmittedQuery(final JsonObject data) {
        publishToFanoutExchange(QUERY_FANOUT_CHANNEL_NAME, data, "Submitted query");
    }

    private void declareFanoutExchange(final String name) {
        final JsonObject config = new JsonObject().put("x-message-ttl", 60 * 60 * 1000);
        CLIENT.exchangeDeclare(name, "fanout", true, false, config, onResult -> {
            if (onResult.failed()) {
                System.err.println("Rabbit: An error occurred on initializing fanout exchange '" + name + "':" + onResult.cause().toString());
            } else System.out.println("Rabbit: Fanout exchange '" + name + "' declared successfully.");
        });
    }

    private void publishToFanoutExchange(final String exchange, final JsonObject queryData, final String context) {
        System.out.println("Rabbit (Context: '" + context + "'): Publishing event.");
        CLIENT.confirmSelect(confirmResult -> {
            if (confirmResult.succeeded()) {
                final BasicProperties properties = new AMQP.BasicProperties.Builder().deliveryMode(2).build();
                CLIENT.basicPublish(exchange, "", properties, queryData.toBuffer(), pubResult -> {
                    if (pubResult.succeeded()) {
                        CLIENT.waitForConfirms(waitResult -> {
                            if (waitResult.failed()) printPubError(exchange, context, waitResult.cause());
                            else {
                                System.out.println("Rabbit (Context: '" + context + "'): Publish to fanout exchange confirmed by broker!");
                            }
                        });
                    } else printPubError(exchange, context, pubResult.cause());
                });
            } else printPubError(exchange, context, confirmResult.cause());
        });
    }

    private void printPubError(final String exchange, final String context, Throwable error) {
        System.out.println("Rabbit (Context: '" + context + "'): An error occurred on publishing to fanout '" + exchange + "':\n" + error.toString());
    }

}
