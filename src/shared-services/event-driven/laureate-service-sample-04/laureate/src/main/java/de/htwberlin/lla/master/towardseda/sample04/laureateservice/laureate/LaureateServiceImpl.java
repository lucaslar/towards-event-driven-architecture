package de.htwberlin.lla.master.towardseda.sample04.laureateservice.laureate;

import de.htwberlin.lla.master.towardseda.sample04.laureateservice.amqp.export.RabbitEfferent;
import de.htwberlin.lla.master.towardseda.sample04.laureateservice.laureate.dao.LaureateDataDao;
import de.htwberlin.lla.master.towardseda.sample04.laureateservice.laureate.export.LaureateService;
import de.htwberlin.lla.master.towardseda.sample04.laureateservice.laureate.export.model.Laureate;
import de.htwberlin.lla.master.towardseda.sample04.laureateservice.laureate.model.SimulatedBehaviour;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LaureateServiceImpl implements LaureateService {

    private final LaureateDataDao DAO;
    private final RabbitEfferent RABBIT;
    private final Vertx VERTX;
    private final String SCOPE;
    private final String SAMPLE_INDEX;
    private final String SERVICE_INDEX;

    LaureateServiceImpl(final LaureateDataDao dao, final RabbitEfferent rabbit, final Vertx vertx) {
        DAO = dao;
        RABBIT = rabbit;
        VERTX = vertx;
        SCOPE = System.getenv("SCOPE");

        final String behaviourSampleKey = "SIMULATED_BEHAVIOUR_SAMPLE_INDEX";
        final String behaviourServiceKey = "SIMULATED_BEHAVIOUR_SERVICE_INDEX";
        SAMPLE_INDEX = System.getenv(behaviourSampleKey);
        SERVICE_INDEX = System.getenv(behaviourServiceKey);

        if (SAMPLE_INDEX == null || SERVICE_INDEX == null) {
            System.out.println("Laureate Service: Simulated behaviour mode disabled. Requires args: " + behaviourSampleKey + " & " + behaviourServiceKey + ".");
        } else System.out.println("Laureate Service: Simulated behaviour mode enabled.");
    }

    @Override
    public void search(final JsonObject data) {
        System.out.println("Laureate Service: Starting search.");
        final String uuid = data.getString("uuid");
        final JsonObject queryData = data.getJsonObject("queryData");
        try {
            final Future<List<Laureate>> pending = DAO.searchLaureates(queryData);
            final SimulatedBehaviour simulatedBehaviour = checkForSimulatedBehaviour(queryData);
            if (simulatedBehaviour == SimulatedBehaviour.ERROR) {
                System.out.println("Laureate Service: Simulating error.");
                RABBIT.publishLaureateSearchError(uuid, "Simulated error triggered by special query (for testing purposes).", SCOPE);
            } else pending.onComplete(result -> {
                if (result.succeeded()) onLaureateSearchCompleted(simulatedBehaviour, uuid, result.result());
                else {
                    System.err.println("Laureate Service: Search failed, see information below:");
                    System.err.println(result.cause().toString());
                    RABBIT.publishLaureateSearchError(uuid, result.cause().toString(), SCOPE);
                }
            });
        } catch (Exception e) {
            System.err.println("Laureate Service: Unexpected error:");
            System.err.println(e);
            RABBIT.publishLaureateSearchError(uuid, e.toString(), SCOPE);
        }
    }

    private void onLaureateSearchCompleted(
            final SimulatedBehaviour simulatedBehaviour,
            final String uuid,
            final List<Laureate> laureates
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
            RABBIT.publishLaureatesFound(uuid, laureates, SCOPE);
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
