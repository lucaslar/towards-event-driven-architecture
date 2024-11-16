package de.htwberlin.lla.master.towardseda.sharedrest.queryservice.config.rest;

import de.htwberlin.lla.master.towardseda.sharedrest.queryservice.query.rest.QueryServiceHandler;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpServer;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Controller;

@Controller
@AllArgsConstructor
public class QueryVerticle extends AbstractVerticle {

    private final QueryServiceHandler QUERY_SERVICE_HANDLER;

    @Override
    public void start(final Promise<Void> startPromise) {
        final HttpServer httpServer = vertx.createHttpServer();
        httpServer.requestHandler(QUERY_SERVICE_HANDLER.createRouter(vertx, config().getJsonArray("laureateServices")));
        httpServer.listen(8080);
        System.out.println("Verticle: Started. Listening on port 8080.");
        startPromise.complete();
    }
}
