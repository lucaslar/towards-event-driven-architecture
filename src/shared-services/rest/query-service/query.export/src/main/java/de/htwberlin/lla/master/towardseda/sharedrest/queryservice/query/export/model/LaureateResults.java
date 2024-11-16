package de.htwberlin.lla.master.towardseda.sharedrest.queryservice.query.export.model;

import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor(staticName = "of")
@Getter
public class LaureateResults {
    private String service;
    private Future<JsonArray> search;
}
