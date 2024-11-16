package de.htwberlin.lla.master.towardseda.sample04.prizeservice.amqp;

import com.rabbitmq.client.AMQP;
import com.rabbitmq.client.BasicProperties;
import de.htwberlin.lla.master.towardseda.sample04.prizeservice.amqp.export.RabbitEfferent;
import de.htwberlin.lla.master.towardseda.sample04.prizeservice.prize.export.model.Prize;
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
    private final String PRIZE_FANOUT_CHANNEL_NAME = "prize.results";
    private final String PRIZE_ERR_FANOUT_CHANNEL_NAME = "prize.failed";

    @Override
    public void initializeChannels() {
        declareFanoutExchange(PRIZE_FANOUT_CHANNEL_NAME);
        declareFanoutExchange(PRIZE_ERR_FANOUT_CHANNEL_NAME);
        System.out.println("Rabbit: Initialized efferent channels.");
    }

    @Override
    public void publishPrizesFound(String uuid, List<Prize> prizes, String scope) {
        final JsonObject event = new JsonObject()
                .put("uuid", uuid)
                .put("prizes", new JsonArray(prizes))
                .put("scope", scope);
        publishToExchange(PRIZE_FANOUT_CHANNEL_NAME, event, "Prizes found");
    }

    @Override
    public void publishPrizeSearchError(final String uuid, final String message, final String scope) {
        final JsonObject event = new JsonObject().put("uuid", uuid).put("message", message).put("scope", scope);
        publishToExchange(PRIZE_ERR_FANOUT_CHANNEL_NAME, event, "Prize search error");
    }

    private void declareFanoutExchange(final String name) {
        final JsonObject config = new JsonObject().put("x-message-ttl", 60 * 60 * 1000);
        CLIENT.exchangeDeclare(name, "fanout", true, false, config, onResult -> {
            if (onResult.failed()) {
                System.err.println("Rabbit: An error occurred on initializing fanout exchange '" + name + "':" + onResult.cause().toString());
            } else System.out.println("Rabbit: Fanout exchange '" + name + "' declared successfully.");
        });
    }

    private void publishToExchange(final String exchange, final JsonObject queryData, final String context) {
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
