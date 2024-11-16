package de.htwberlin.lla.master.towardseda.sample02.laureateservice.config.rest;

import de.htwberlin.lla.master.towardseda.sample02.laureateservice.laureate.rest.LaureateServiceHandler;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpServer;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class LaureateVerticle extends AbstractVerticle {

    private final LaureateServiceHandler LAUREATE_SERVICE_HANDLER;

    @Override
    public void start(final Promise<Void> startPromise) {
        final HttpServer httpServer = vertx.createHttpServer();
        httpServer.requestHandler(LAUREATE_SERVICE_HANDLER.createRouter(vertx));
        httpServer.listen(8080);
        System.out.println("Verticle: Started (scope: '" + System.getenv("SCOPE") + "'). Listening on port 8080.");
        startPromise.complete();
    }
}
