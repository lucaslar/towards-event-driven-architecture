package de.htwberlin.lla.master.towardseda.sample04.prizeservice.prize;

import de.htwberlin.lla.master.towardseda.sample04.prizeservice.amqp.export.RabbitEfferent;
import de.htwberlin.lla.master.towardseda.sample04.prizeservice.prize.dao.PrizeDataDao;
import de.htwberlin.lla.master.towardseda.sample04.prizeservice.prize.export.PrizeService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
@AllArgsConstructor
public class PrizeServiceImpl implements PrizeService {

    private final PrizeDataDao DAO;
    private final RabbitEfferent RABBIT;

    @Override
    public void searchPrizesForLaureates(String uuid, String scope, int... ids) {
        System.out.println("Prize Service: Loading prizes for laureate(s): " + Arrays.toString(ids));
        try {
            DAO.searchPrizesForLaureates(ids).onComplete(ar -> {
                if (ar.succeeded()) RABBIT.publishPrizesFound(uuid, ar.result(), scope);
                else RABBIT.publishPrizeSearchError(uuid, ar.cause().toString(), scope);
            });
        } catch (Exception e) {
            System.err.println("Prize Service: Unexpected error:");
            System.err.println(e);
            RABBIT.publishPrizeSearchError(uuid, e.toString(), scope);
        }
    }
}
