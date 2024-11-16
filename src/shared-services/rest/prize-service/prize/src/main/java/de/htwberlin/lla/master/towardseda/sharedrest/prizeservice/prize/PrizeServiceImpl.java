package de.htwberlin.lla.master.towardseda.sharedrest.prizeservice.prize;

import de.htwberlin.lla.master.towardseda.sharedrest.prizeservice.prize.dao.PrizeDataDao;
import de.htwberlin.lla.master.towardseda.sharedrest.prizeservice.prize.export.PrizeService;
import de.htwberlin.lla.master.towardseda.sharedrest.prizeservice.prize.export.model.Prize;
import io.vertx.core.Future;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
@AllArgsConstructor
public class PrizeServiceImpl implements PrizeService {

    private final PrizeDataDao DAO;

    @Override
    public Future<List<Prize>> getPrizesForLaureates(final int... ids) {
        System.out.println("Prize Service: Loading prizes for laureate(s): " + Arrays.toString(ids));
        return DAO.searchPrizesForLaureates(ids);
    }
}
