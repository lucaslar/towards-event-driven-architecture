package de.htwberlin.lla.master.towardseda.sharedrest.queryservice.query.export;

import de.htwberlin.lla.master.towardseda.sharedrest.queryservice.query.export.model.LaureateService;
import de.htwberlin.lla.master.towardseda.sharedrest.queryservice.query.export.model.QueryResponse;
import io.vertx.core.json.JsonObject;

import java.util.List;

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

    /**
     * @param laureateServices Laureate services to be addressed.
     */
    void setServiceInstances(final List<LaureateService> laureateServices);
}
