package de.htwberlin.lla.master.towardseda.sharedrest.prizeservice.prize.rest;

import de.htwberlin.lla.master.towardseda.sharedrest.prizeservice.prize.export.PrizeService;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.json.Json;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Controller;

import java.util.Arrays;

@Controller
@AllArgsConstructor
public class PrizeServiceHandler {

    private final PrizeService Prize_SERVICE;

    public Router createRouter(final Vertx vertx) {
        Router router = Router.router(vertx);
        router.route(HttpMethod.GET, "/prizes").handler(this::handlePrizeReq);
        return router;
    }

    private void handlePrizeReq(final RoutingContext routingContext) {
        System.out.println("Prize Handler: Incoming request.");
        final int[] lIds = transformLaureateIds(routingContext.request().getParam("lid"));

        if (lIds == null) {
            routingContext.response()
                    .setStatusCode(400)
                    .end("One or more (comma-separated) ids as integers required. Query param `lid`.");
        } else Prize_SERVICE.getPrizesForLaureates(lIds).onComplete(ar -> {
            if (ar.succeeded()) {
                System.out.println("Prize Handler: Successfully collected prize data. Returning results.");
                routingContext.response()
                        .putHeader("content-type", "application/json")
                        .end(Json.encode(ar.result()));
            } else {
                System.err.println("Prize Handler: Failed to collect prize data. Returning 500. Check logs below:");
                System.err.println(ar.cause().toString());
                routingContext.response().setStatusCode(500).end(ar.cause().toString());
            }
        });
    }

    private int[] transformLaureateIds(final String params) {
        if (params == null || !params.trim().matches("^[0-9]+(,\\s*[0-9]+\\s*)*$")) return null;
        else return Arrays.stream(params.split(",")).mapToInt(id -> Integer.parseInt(id.trim())).toArray();
    }
}