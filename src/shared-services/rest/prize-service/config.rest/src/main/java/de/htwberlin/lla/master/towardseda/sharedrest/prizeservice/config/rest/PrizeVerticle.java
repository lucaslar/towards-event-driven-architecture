package de.htwberlin.lla.master.towardseda.sharedrest.prizeservice.config.rest;

import de.htwberlin.lla.master.towardseda.sharedrest.prizeservice.prize.rest.PrizeServiceHandler;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpServer;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class PrizeVerticle extends AbstractVerticle {

    final PrizeServiceHandler PRIZE_SERVICE_HANDLER;

    @Override
    public void start(Promise<Void> startPromise) {
        final HttpServer httpServer = vertx.createHttpServer();
        httpServer.requestHandler(PRIZE_SERVICE_HANDLER.createRouter(vertx));
        httpServer.listen(8080);
        System.out.println("Verticle: Started. Listening on port 8080.");
        startPromise.complete();
    }
}
