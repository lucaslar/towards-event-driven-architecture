package de.htwberlin.lla.master.towardseda.sample03.laureateservice.laureate.out;

import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonArray;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.client.predicate.ResponsePredicate;
import io.vertx.ext.web.codec.BodyCodec;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.stream.Collectors;

@Service
public class PrizeDataClient {

    private final Vertx VERTX;

    private final String PRIZE_SERVICE_HOST;
    private final int PRIZE_SERVICE_PORT;

    PrizeDataClient(final Vertx vertx) {
        VERTX = vertx;
        PRIZE_SERVICE_HOST = System.getenv("PRIZE_SERVICE_HOST");
        PRIZE_SERVICE_PORT = System.getenv("PRIZE_SERVICE_PORT") != null && System.getenv("PRIZE_SERVICE_PORT").matches("[0-9]+")
                ? Integer.parseInt(System.getenv("PRIZE_SERVICE_PORT"))
                : 8080;
    }

    public Future<JsonArray> requestPrizes(final int[] lids) {
        System.out.println("Prize Data Client: Requesting " + PRIZE_SERVICE_HOST + ":8080. [GET] => /prizes");
        final String lidsString = Arrays.stream(lids).mapToObj(i -> "" + i).collect(Collectors.joining(","));
        return Future.future(handler -> {
            WebClient.create(VERTX)
                    .get(PRIZE_SERVICE_PORT, PRIZE_SERVICE_HOST, "/prizes")
                    .putHeader("Accept", "application/json")
                    .as(BodyCodec.jsonArray())
                    .expect(ResponsePredicate.SC_OK)
                    .setQueryParam("lid", lidsString)
                    .send(ar -> {
                        if (ar.succeeded()) handler.complete(ar.result().body());
                        else handler.fail(ar.cause());
                    });
        });
    }
}
