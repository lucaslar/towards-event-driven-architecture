package de.htwberlin.lla.master.towardseda.sample04.queryservice.query.export;

import de.htwberlin.lla.master.towardseda.sample04.queryservice.query.export.model.QueryResponse;
import io.vertx.core.json.JsonObject;

/**
 * Service for managing queries incl. a validation thereof.
 */
public interface QueryService {

    /**
     * Validates query data and, if valid, emits an event.
     *
     * @param data Query data.
     * @return Validated query data.
     */
    QueryResponse query(final JsonObject data);
}
