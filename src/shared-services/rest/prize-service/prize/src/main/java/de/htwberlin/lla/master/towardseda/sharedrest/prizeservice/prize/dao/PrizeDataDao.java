package de.htwberlin.lla.master.towardseda.sharedrest.prizeservice.prize.dao;

import de.htwberlin.lla.master.towardseda.sharedrest.prizeservice.prize.export.model.Prize;
import io.vertx.core.Future;

import java.util.List;

/**
 * Read access to prize data.
 */
public interface PrizeDataDao {

    /**
     * Performs a search for prizes received by laureates with the given IDs.
     *
     * @param ids Laureate IDs the prizes are to be returned for.
     * @return Future resolved with prizes received by the laureates with the given IDs.
     */
    Future<List<Prize>> searchPrizesForLaureates(final int... ids);
}
