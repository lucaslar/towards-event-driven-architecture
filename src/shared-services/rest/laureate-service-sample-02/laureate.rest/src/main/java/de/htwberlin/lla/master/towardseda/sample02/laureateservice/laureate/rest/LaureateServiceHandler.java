package de.htwberlin.lla.master.towardseda.sample02.laureateservice.laureate.rest;

import de.htwberlin.lla.master.towardseda.sample02.laureateservice.laureate.export.LaureateService;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.json.DecodeException;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Controller;

@Controller
@AllArgsConstructor
public class LaureateServiceHandler {

    private final LaureateService LAUREATE_SERVICE;

    public Router createRouter(final Vertx vertx) {
        Router router = Router.router(vertx);
        router.route(HttpMethod.POST, "/search").handler(this::handlePrizeReq);
        return router;
    }

    private void handlePrizeReq(final RoutingContext routingContext) {
        routingContext.request().bodyHandler(bodyHandler -> {
            try {
                final JsonObject body = bodyHandler.toJsonObject();
                if (body == null || body.isEmpty()) {
                    routingContext.response().setStatusCode(400).end("Body must not be null or empty!");
                } else {
                    LAUREATE_SERVICE.search(body).onComplete(ar -> {
                        if (ar.succeeded()) {
                            System.out.println("Laureate Handler: Successfully collected laureate data. Returning results.");
                            routingContext.response()
                                    .putHeader("content-type", "application/json")
                                    .end(Json.encode(ar.result()));
                        } else {
                            System.err.println("Laureate Handler: Failed to collect prize data. Returning 500. Check logs below:");
                            System.err.println(ar.cause().toString());
                            routingContext.response().setStatusCode(500).end(ar.cause().toString());
                        }
                    });
                }
            } catch (DecodeException e) {
                System.err.println("Laureate Handler: Invalid JSON object. Rejecting request.");
                routingContext.response().setStatusCode(400).end("Invalid body. Must be JSON!");
                System.err.println(e);
            }
        });
    }
}
