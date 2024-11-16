package de.htwberlin.lla.master.towardseda.sample04.queryservice.config.amqp;

import de.htwberlin.lla.master.towardseda.sample04.queryservice.amqp.export.RabbitAfferent;
import de.htwberlin.lla.master.towardseda.sample04.queryservice.amqp.export.RabbitEfferent;
import de.htwberlin.lla.master.towardseda.sample04.queryservice.websocket.QueryServiceSocketImpl;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpServer;
import io.vertx.rabbitmq.RabbitMQClient;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Controller;

@Controller
@AllArgsConstructor
public class QueryVerticle extends AbstractVerticle {

    private final QueryServiceSocketImpl QUERY_SERVICE_SOCKET;
    private final RabbitMQClient RABBIT_CLIENT;
    private final RabbitAfferent RABBIT_AFFERENT;
    private final RabbitEfferent RABBIT_EFFERENT;

    @Override
    public void start(Promise<Void> startPromise) {
        RABBIT_CLIENT.start().onComplete(ar -> {
            if (ar.succeeded()) {
                System.out.println("Verticle: Rabbit started.");
                RABBIT_EFFERENT.initializeChannels();
                RABBIT_AFFERENT.initializeChannels().onSuccess(ar2 -> {
                    final HttpServer httpServer = vertx.createHttpServer();
                    httpServer.requestHandler(QUERY_SERVICE_SOCKET.createRouter(vertx));
                    httpServer.listen(8080);
                    System.out.println("Verticle: Started. Socket listening on port 8080.");
                    startPromise.complete();
                });
            } else System.err.println("Verticle: Could not start/connect to Rabbit (retry enabled): " + ar.cause());
        });
    }
}
