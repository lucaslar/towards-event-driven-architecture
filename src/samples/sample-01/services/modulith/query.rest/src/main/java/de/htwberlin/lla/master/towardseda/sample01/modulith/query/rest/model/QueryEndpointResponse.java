package de.htwberlin.lla.master.towardseda.sample01.modulith.query.rest.model;

import io.vertx.core.json.JsonObject;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Getter
@AllArgsConstructor(staticName = "of")
public class QueryEndpointResponse {
    private UUID uuid;
    private Date timestamp;
    private JsonObject queryData;
    private List<QueryEndpointServiceResult> serviceResults;
}
