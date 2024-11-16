package de.htwberlin.lla.master.towardseda.sharedrest.queryservice.query.rest.model;

import io.vertx.core.json.JsonArray;
import lombok.Data;

@Data
public class QueryEndpointServiceResult {
    private String service;
    private JsonArray results;
    private String error;

    public QueryEndpointServiceResult(final String service) {
        this.service = service;
    }
}
