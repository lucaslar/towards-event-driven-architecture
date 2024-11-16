package de.htwberlin.lla.master.towardseda.sample04.prizeservice.prize.export;

/**
 * Service for managing Nobel Prize search logic.
 */
public interface PrizeService {
    /**
     * Performs a search for prizes received by laureates with the given IDs and emits an event with the results.
     *
     * @param uuid UUID of the initiating query request.
     * @param scope Service scope, i.e. Nobel Prize category of the initiating service.
     * @param ids Laureate IDs the prizes are to be searched for.
     */
    void searchPrizesForLaureates(final String uuid, final String scope, final int... ids);
}
