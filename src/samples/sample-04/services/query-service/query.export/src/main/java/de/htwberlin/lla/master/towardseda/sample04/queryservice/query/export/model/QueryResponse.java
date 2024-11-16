package de.htwberlin.lla.master.towardseda.sample04.queryservice.query.export.model;

import io.vertx.core.json.JsonObject;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Date;
import java.util.UUID;

@AllArgsConstructor(staticName = "of")
@Getter
public class QueryResponse {
    private UUID uuid;
    private Date timestamp;
    private JsonObject queryData;
}