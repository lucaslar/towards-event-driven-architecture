package de.htwberlin.lla.master.towardseda.sample01.modulith.laureate.export;

import de.htwberlin.lla.master.towardseda.sample01.modulith.laureate.export.model.LaureateAndPrizes;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;

import java.util.List;

/**
 * Service for managing laureate search logic, scoped by prize type.
 * E.g. a "Physics" laureate service will only return data for laureates who received a Physics Nobel Prize.
 */
public interface LaureateService {

    /**
     * Performs a search for laureates matching the given query data:
     * - firstName:     Laureate's first name starts with the given String (ignoring case).
     * - lastName:      Laureate's last name starts with the given String (ignoring case).
     * - gender:        Laureate's gender equals the given String.
     * - birthDate:     Laureate's birth date or birth year matches the given query (equals, lower, greater). [type: { operator: "eq"|"lt"|"gt", date: "[0-9]{4}-[0-9]{2}-[0-9]{2}" } or { operator: "eq"|"lt"|"gt", year: [number] }]
     * - deathDate:     Laureate's death date or death year matches the given query (equals, lower, greater). [type: { operator: "eq"|"lt"|"gt", date: "[0-9]{4}-[0-9]{2}-[0-9]{2}" } or { operator: "eq"|"lt"|"gt", year: [number] }]
     * - birthLocation: Laureate's birth location (geo hash) starts with any given String (ignoring case).
     * - deathLocation: Laureate's death location (geo hash) starts with any given String (ignoring case).
     * <p>
     * All arguments are concatenated with "AND".
     *
     * @param data Normalized search data.
     * @return Future resolved with laureates matching the search data.
     */
    Future<List<LaureateAndPrizes>> search(final JsonObject data);

    /**
     * @return Scope to search laureates in.
     */
    String getScope();

    /**
     * @param scope Scope to search laureates in.
     */
    void setScope(final String scope);

    /**
     * @param index Index of the service in order to be able to simulated errors.
     */
    void setIndex(final int index);
}
