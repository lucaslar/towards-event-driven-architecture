package de.htwberlin.lla.master.towardseda.sharedrest.queryservice.query.out;

import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.codec.BodyCodec;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import io.vertx.core.json.JsonArray;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.client.predicate.ResponsePredicate;

@Service
@AllArgsConstructor
public class LaureateDataClient {

    private final Vertx VERTX;

    public Future<JsonArray> search(final String host, final JsonObject cleanedQueryData) {
        System.out.println("Laureate Data Client: Requesting " + host + ":8080. [POST] => /search");
        return Future.future(handler -> {
            WebClient.create(VERTX)
                    .post(8080, host, "/search")
                    .putHeader("Accept", "application/json")
                    .putHeader("content-type", "application/json")
                    .as(BodyCodec.jsonArray())
                    .expect(ResponsePredicate.SC_OK)
                    .sendJsonObject(cleanedQueryData, ar -> {
                        if (ar.succeeded()) handler.complete(ar.result().body());
                        else handler.fail(ar.cause());
                    });
        });
    }
}
