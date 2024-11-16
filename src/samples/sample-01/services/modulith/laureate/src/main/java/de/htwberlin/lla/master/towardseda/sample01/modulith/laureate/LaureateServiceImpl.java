package de.htwberlin.lla.master.towardseda.sample01.modulith.laureate;

import de.htwberlin.lla.master.towardseda.sample01.modulith.laureate.dao.LaureateDataDao;
import de.htwberlin.lla.master.towardseda.sample01.modulith.laureate.export.LaureateService;
import de.htwberlin.lla.master.towardseda.sample01.modulith.laureate.export.model.Laureate;
import de.htwberlin.lla.master.towardseda.sample01.modulith.laureate.export.model.LaureateAndPrizes;
import de.htwberlin.lla.master.towardseda.sample01.modulith.laureate.model.PendingLaureatePrize;
import de.htwberlin.lla.master.towardseda.sample01.modulith.laureate.model.SimulatedBehaviour;
import de.htwberlin.lla.master.towardseda.sample01.modulith.prize.export.PrizeService;
import de.htwberlin.lla.master.towardseda.sample01.modulith.prize.export.model.Prize;
import io.vertx.core.*;
import io.vertx.core.json.JsonObject;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Scope(scopeName = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class LaureateServiceImpl implements LaureateService {

    @Getter
    @Setter
    private String scope = null;

    @Setter
    private int index = -1;

    private final LaureateDataDao DAO;
    private final PrizeService PRIZE_SERVICE;

    private final String SAMPLE_INDEX;
    private final Vertx VERTX;

    LaureateServiceImpl(final LaureateDataDao dao, final PrizeService prizeService, final Vertx vertx) {
        DAO = dao;
        PRIZE_SERVICE = prizeService;
        VERTX = vertx;
        SAMPLE_INDEX = System.getenv("SIMULATED_BEHAVIOUR_SAMPLE_INDEX");

        if (SAMPLE_INDEX == null) System.out.println("Laureate Service: Simulated behaviour mode disabled.");
        else System.out.println("Laureate Service: Simulated behaviour mode enabled.");
    }

    @Override
    public Future<List<LaureateAndPrizes>> search(final JsonObject data) {
        System.out.println("Laureate Service (" + scope + "): Starting search.");
        final Future<List<PendingLaureatePrize>> pending = DAO.searchLaureates(scope, data).map(this::mapToPrizeRequest);

        return Future.future(promise -> {
            final SimulatedBehaviour simulatedBehaviour = checkForSimulatedBehaviour(data);
            if (simulatedBehaviour == SimulatedBehaviour.ERROR) {
                System.out.println("Laureate Service (" + scope + "): Simulating error.");
                promise.fail("Simulated error triggered by special query (for testing purposes).");
            } else pending.onComplete(result -> {
                if (pending.succeeded()) {
                    final Stream<Future<List<Prize>>> prizesStream = result.result().stream().map(PendingLaureatePrize::getPrizes);
                    CompositeFuture.join(prizesStream.collect(Collectors.toList())).onComplete(ignored -> {
                        onPrizeDataComplemented(simulatedBehaviour, promise, result);
                    });
                } else {
                    System.err.println("Laureate Service (" + scope + "): Search failed, see information below:");
                    System.err.println(result.cause().toString());
                    promise.fail(result.cause());
                }
            });
        });
    }

    private List<PendingLaureatePrize> mapToPrizeRequest(final List<Laureate> laureates) {
        final int[] ids = laureates.parallelStream().mapToInt(Laureate::getId).toArray();
        if (ids.length > 0) {
            System.out.println("Laureate Service (" + scope + "): Successful search. Found laureate(s). Collecting prize data.");
            final Future<List<Prize>> prizes = PRIZE_SERVICE.getPrizesForLaureates(ids);
            return laureates.parallelStream().map(l -> {
                final Future<List<Prize>> filtered = prizes.map(pl -> pl
                        .stream()
                        .filter(p -> p.getLaureate().equals(l.getId()))
                        .toList());
                return PendingLaureatePrize.of(l, filtered);
            }).toList();
        } else {
            System.out.println("Laureate Service (" + scope + "): Successful search. No laureate found.");
            return laureates.parallelStream().map(l -> PendingLaureatePrize.of(l, null)).toList();
        }
    }

    private void onPrizeDataComplemented(
            final SimulatedBehaviour simulatedBehaviour,
            final Promise<List<LaureateAndPrizes>> promise,
            final AsyncResult<List<PendingLaureatePrize>> result
    ) {
        VERTX.executeBlocking(blockingFuture -> {
            if (simulatedBehaviour == SimulatedBehaviour.TIMEOUT) {
                try {
                    System.out.println("Laureate Service (" + scope + "): Simulating timeout (90s).");
                    Thread.sleep(90000);
                } catch (InterruptedException e) {
                    System.err.println("Laureate Service (" + scope + "): Timeout interrupted.");
                }
            }
            promise.complete(result
                    .result()
                    .stream()
                    .map(p -> {
                        return p.getPrizes().succeeded()
                                ? LaureateAndPrizes.of(p.getLaureate(), p.getPrizes().result())
                                : LaureateAndPrizes.of(p.getLaureate(), p.getPrizes().cause().toString());
                    }).toList());
            blockingFuture.complete();
        });
    }

    private SimulatedBehaviour checkForSimulatedBehaviour(final JsonObject data) {
        final boolean isQualifyingQuery = SAMPLE_INDEX != null
                && data.containsKey("firstName")
                && data.containsKey("deathLocation")
                && data.getString("firstName").equalsIgnoreCase("obelix");

        if (isQualifyingQuery) {
            final String hashBase = SAMPLE_INDEX + index;
            final Optional<Object> found = data
                    .getJsonArray("deathLocation")
                    .stream()
                    .filter(dl -> ((String) dl).equalsIgnoreCase(hashBase + "e") || ((String) dl).equalsIgnoreCase(hashBase + "t"))
                    .findFirst();

            if (found.isPresent() && found.get().toString().endsWith("e")) return SimulatedBehaviour.ERROR;
            else if (found.isPresent() && found.get().toString().endsWith("t")) return SimulatedBehaviour.TIMEOUT;
        }
        return SimulatedBehaviour.NONE;
    }
}
