package de.htwberlin.lla.master.towardseda.sample01.modulith.config.rest;

import de.htwberlin.lla.master.towardseda.sample01.modulith.query.rest.QueryServiceHandler;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpServer;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class ModulithVerticle extends AbstractVerticle {

    private final QueryServiceHandler QUERY_SERVICE_HANDLER;

    @Override
    public void start(Promise<Void> startPromise) {
        final HttpServer httpServer = vertx.createHttpServer();
        httpServer.requestHandler(QUERY_SERVICE_HANDLER.createRouter(vertx));
        httpServer.listen(8080);
        System.out.println("Verticle: Started. Listening on port 8080.");
        startPromise.complete();
    }
}
