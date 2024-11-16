package de.htwberlin.lla.master.towardseda.sharedrest.prizeservice.prize.export;

import de.htwberlin.lla.master.towardseda.sharedrest.prizeservice.prize.export.model.Prize;
import io.vertx.core.Future;

import java.util.List;

/**
 * Service for managing Nobel Prize search logic.
 */
public interface PrizeService {
    /**
     * Performs a search for prizes received by laureates with the given IDs.
     *
     * @param ids Laureate IDs the prizes are to be returned for.
     * @return Future resolved with prizes received by the laureates with the given IDs.
     */
    Future<List<Prize>> getPrizesForLaureates(final int... ids);
}
