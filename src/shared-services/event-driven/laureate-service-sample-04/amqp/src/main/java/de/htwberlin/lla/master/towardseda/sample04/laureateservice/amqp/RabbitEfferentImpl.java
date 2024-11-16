package de.htwberlin.lla.master.towardseda.sample04.laureateservice.amqp;

import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.BasicProperties;
import de.htwberlin.lla.master.towardseda.sample04.laureateservice.amqp.export.RabbitEfferent;
import de.htwberlin.lla.master.towardseda.sample04.laureateservice.laureate.export.model.Laureate;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.rabbitmq.RabbitMQClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;

import java.util.List;

@RequiredArgsConstructor
@Controller
public class RabbitEfferentImpl implements RabbitEfferent {

    private final RabbitMQClient CLIENT;
    private final String LAUREATES_TOPIC_CHANNEL_NAME = "laureate.results";
    private final String LAUREATES_ERR_TOPIC_CHANNEL_NAME = "laureate.failed";

    @Override
    public void initializeChannels() {
        declareTopicExchange(LAUREATES_TOPIC_CHANNEL_NAME);
        declareTopicExchange(LAUREATES_ERR_TOPIC_CHANNEL_NAME);
        System.out.println("Rabbit: Initialized efferent channels.");
    }

    @Override
    public void publishLaureatesFound(final String uuid, final List<Laureate> laureates, final String scope) {
        final JsonObject event = new JsonObject()
                .put("uuid", uuid)
                .put("laureates", new JsonArray(laureates))
                .put("scope", scope);
        final String routingKey = "laureate.results." + System.getenv("SCOPE").toLowerCase().replaceAll("\\s+", "");
        publishToTopicExchange(LAUREATES_TOPIC_CHANNEL_NAME, routingKey, event, "Laureates found");
    }

    @Override
    public void publishLaureateSearchError(final String uuid, final String message, final String scope) {
        final JsonObject event = new JsonObject().put("uuid", uuid).put("message", message).put("scope", scope);
        final String routingKey = "laureate.failed." + System.getenv("SCOPE").toLowerCase().replaceAll("\\s+", "");
        publishToTopicExchange(LAUREATES_ERR_TOPIC_CHANNEL_NAME, routingKey, event, "Laureate search error");
    }

    private void declareTopicExchange(final String name) {
        final JsonObject config = new JsonObject().put("x-message-ttl", 60 * 60 * 1000);
        CLIENT.exchangeDeclare(name, "topic", true, false, config, onResult -> {
            if (onResult.failed()) {
                System.err.println("Rabbit: An error occurred on initializing topic exchange '" + name + "':" + onResult.cause().toString());
            } else System.out.println("Rabbit: Topic exchange '" + name + "' declared successfully.");
        });
    }

    private void publishToTopicExchange(final String exchange, final String routingKey, final JsonObject queryData, final String context) {
        System.out.println("Rabbit (Context: '" + context + "'): Publishing event.");
        CLIENT.confirmSelect(confirmResult -> {
            if (confirmResult.succeeded()) {
                final BasicProperties properties = new AMQP.BasicProperties.Builder().deliveryMode(2).build();
                CLIENT.basicPublish(exchange, routingKey, properties, queryData.toBuffer(), pubResult -> {
                    if (pubResult.succeeded()) {
                        CLIENT.waitForConfirms(waitResult -> {
                            if (waitResult.failed()) printPubError(exchange, context, waitResult.cause());
                            else {
                                System.out.println("Rabbit (Context: '" + context + "'): Publish to topic exchange confirmed by broker!");
                            }
                        });
                    } else printPubError(exchange, context, pubResult.cause());
                });
            } else printPubError(exchange, context, confirmResult.cause());
        });
    }

    private void printPubError(final String exchange, final String context, Throwable error) {
        System.out.println("Rabbit (Context: '" + context + "'): An error occurred on publishing to topic '" + exchange + "':\n" + error.toString());
    }
}
