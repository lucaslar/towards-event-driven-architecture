package de.htwberlin.lla.master.towardseda.sample01.modulith.query.rest;

import de.htwberlin.lla.master.towardseda.sample01.modulith.laureate.export.model.LaureateAndPrizes;
import de.htwberlin.lla.master.towardseda.sample01.modulith.query.export.QueryService;
import de.htwberlin.lla.master.towardseda.sample01.modulith.query.export.model.LaureateResults;
import de.htwberlin.lla.master.towardseda.sample01.modulith.query.export.model.QueryResponse;
import de.htwberlin.lla.master.towardseda.sample01.modulith.query.rest.model.QueryEndpointResponse;
import de.htwberlin.lla.master.towardseda.sample01.modulith.query.rest.model.QueryEndpointServiceResult;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.json.DecodeException;
import io.vertx.core.json.Json;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Controller
@AllArgsConstructor
public class QueryServiceHandler {

    private final QueryService QUERY_SERVICE;

    public Router createRouter(final Vertx vertx) {
        Router router = Router.router(vertx);
        router.route(HttpMethod.POST, "/query").handler(this::handleQuery);
        return router;
    }

    private void handleQuery(final RoutingContext routingContext) {
        System.out.println("Query Handler: Incoming request.");
        routingContext.request().bodyHandler(bodyHandler -> {
            try {
                final QueryResponse queryResponse = QUERY_SERVICE.query(bodyHandler.toJsonObject());

                if (queryResponse == null) routingContext.response().setStatusCode(400).end("Invalid query");
                else {
                    CompositeFuture.join(laureateStreams(queryResponse).collect(Collectors.toList())).onComplete(ar -> {
                        if (ar.succeeded())
                            System.out.println("Query Handler: Successfully collected laureate results.");
                        else System.err.println("Query Handler: Failed to load one or more laureate results.");

                        final List<QueryEndpointServiceResult> laureateResults = queryResponse.getLaureateResults()
                                .stream()
                                .map(this::mapLaureateResponse)
                                .collect(Collectors.toList());

                        System.out.println("Query Handler: Returning response.");
                        routingContext.response()
                                .putHeader("content-type", "application/json")
                                .end(Json.encode(QueryEndpointResponse.of(queryResponse.getUuid(), queryResponse.getTimestamp(), queryResponse.getQueryData(), laureateResults)));
                    });
                }
            } catch (DecodeException e) {
                System.err.println("Query Handler: Invalid JSON object. Rejecting request.");
                routingContext.response().setStatusCode(400).end("Invalid body. Must be JSON!");
                System.err.println(e);
            }
        });
    }

    private Stream<Future<List<LaureateAndPrizes>>> laureateStreams(final QueryResponse queryResponse) {
        return queryResponse
                .getLaureateResults()
                .stream()
                .map(LaureateResults::getSearch);
    }

    private QueryEndpointServiceResult mapLaureateResponse(final LaureateResults lrs) {
        final QueryEndpointServiceResult result = new QueryEndpointServiceResult(lrs.getService());
        if (lrs.getSearch().succeeded()) result.setResults(lrs.getSearch().result());
        else if (lrs.getSearch().failed()) result.setError(lrs.getSearch().cause().toString());
        else result.setError("Unknown exception.");
        return result;
    }
}
