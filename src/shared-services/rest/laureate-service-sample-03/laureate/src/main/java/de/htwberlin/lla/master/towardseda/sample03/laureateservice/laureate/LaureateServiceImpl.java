package de.htwberlin.lla.master.towardseda.sample03.laureateservice.laureate;

import de.htwberlin.lla.master.towardseda.sample03.laureateservice.laureate.dao.LaureateDataDao;
import de.htwberlin.lla.master.towardseda.sample03.laureateservice.laureate.export.LaureateService;
import de.htwberlin.lla.master.towardseda.sample03.laureateservice.laureate.export.model.Laureate;
import de.htwberlin.lla.master.towardseda.sample03.laureateservice.laureate.export.model.LaureateAndPrizes;
import de.htwberlin.lla.master.towardseda.sample03.laureateservice.laureate.model.PendingLaureatePrize;
import de.htwberlin.lla.master.towardseda.sample03.laureateservice.laureate.model.SimulatedBehaviour;
import de.htwberlin.lla.master.towardseda.sample03.laureateservice.laureate.out.PrizeDataClient;
import io.vertx.core.*;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class LaureateServiceImpl implements LaureateService {

    private final PrizeDataClient PRIZE_DATA_CLIENT;
    private final LaureateDataDao DAO;
    private final Vertx VERTX;
    private final String SAMPLE_INDEX;
    private final String SERVICE_INDEX;

    LaureateServiceImpl(final LaureateDataDao dao, final Vertx vertx, final PrizeDataClient prizeDataClient) {
        DAO = dao;
        VERTX = vertx;
        PRIZE_DATA_CLIENT = prizeDataClient;

        final String behaviourSampleKey = "SIMULATED_BEHAVIOUR_SAMPLE_INDEX";
        final String behaviourServiceKey = "SIMULATED_BEHAVIOUR_SERVICE_INDEX";
        SAMPLE_INDEX = System.getenv(behaviourSampleKey);
        SERVICE_INDEX = System.getenv(behaviourServiceKey);

        if (SAMPLE_INDEX == null || SERVICE_INDEX == null) {
            System.out.println("Laureate Service: Simulated behaviour mode disabled. Requires args: " + behaviourSampleKey + " & " + behaviourServiceKey + ".");
        } else System.out.println("Laureate Service: Simulated behaviour mode enabled.");
    }

    @Override
    public Future<List<LaureateAndPrizes>> search(final JsonObject data) {
        System.out.println("Laureate Service: Starting search.");
        final Future<List<PendingLaureatePrize>> pending = DAO.searchLaureates(data).map(this::mapToPrizeRequest);

        return Future.future(promise -> {
            final SimulatedBehaviour simulatedBehaviour = checkForSimulatedBehaviour(data);
            if (simulatedBehaviour == SimulatedBehaviour.ERROR) {
                System.out.println("Laureate Service: Simulating error.");
                promise.fail("Simulated error triggered by special query (for testing purposes).");
            } else pending.onComplete(result -> {
                if (pending.succeeded()) {
                    final Stream<Future<JsonArray>> prizesStream = result.result().stream().map(PendingLaureatePrize::getPrizes);
                    CompositeFuture.join(prizesStream.collect(Collectors.toList())).onComplete(ignored -> {
                        onPrizeDataComplemented(simulatedBehaviour, promise, result);
                    });
                } else {
                    System.err.println("Laureate Service: Search failed, see information below:");
                    System.err.println(result.cause().toString());
                    promise.fail(result.cause());
                }
            });
        });
    }

    private List<PendingLaureatePrize> mapToPrizeRequest(final List<Laureate> laureates) {
        final int[] ids = laureates.parallelStream().mapToInt(Laureate::getId).toArray();
        if (ids.length > 0) {
            System.out.println("Laureate Service: Successful search. Found laureate(s). Collecting prize data.");
            final Future<JsonArray> prizes = PRIZE_DATA_CLIENT.requestPrizes(ids);
            return laureates.parallelStream().map(l -> {
                final Future<JsonArray> filtered = prizes.map(pl -> new JsonArray(
                        pl.stream().filter(p -> ((JsonObject) p).getInteger("laureate").equals(l.getId())).toList()
                ));
                return PendingLaureatePrize.of(l, filtered);
            }).toList();
        } else {
            System.out.println("Laureate Service: Successful search. No laureate found.");
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
                    System.out.println("Laureate Service: Simulating timeout (90s).");
                    Thread.sleep(90000);
                } catch (InterruptedException e) {
                    System.err.println("Laureate Service: Timeout interrupted.");
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
            final String hashBase = SAMPLE_INDEX + SERVICE_INDEX;
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
