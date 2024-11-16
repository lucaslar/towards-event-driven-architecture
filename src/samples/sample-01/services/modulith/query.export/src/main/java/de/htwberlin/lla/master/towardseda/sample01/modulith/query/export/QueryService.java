package de.htwberlin.lla.master.towardseda.sample01.modulith.query.export;

import de.htwberlin.lla.master.towardseda.sample01.modulith.query.export.model.QueryResponse;
import io.vertx.core.json.JsonObject;

/**
 * Service for managing queries incl. a validation thereof.
 */
public interface QueryService {

    /**
     * Validates query data and, if valid, delegates the searches for laureates matching the given criteria.
     *
     * @param data Query data.
     * @return Found data for laureates matching the given query (incl. their won Nobel Prizes).
     */
    QueryResponse query(final JsonObject data);
}
