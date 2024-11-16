package de.htwberlin.lla.master.towardseda.sample04.queryservice.websocket;

import de.htwberlin.lla.master.towardseda.sample04.queryservice.query.export.QueryService;
import de.htwberlin.lla.master.towardseda.sample04.queryservice.query.export.model.QueryResponse;
import de.htwberlin.lla.master.towardseda.sample04.queryservice.websocket.export.QueryServiceSocket;
import de.htwberlin.lla.master.towardseda.sample04.queryservice.websocket.model.StoredSocketConnection;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.sockjs.SockJSHandler;
import io.vertx.ext.web.handler.sockjs.SockJSHandlerOptions;
import io.vertx.ext.web.handler.sockjs.SockJSSocket;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Timer;

@RequiredArgsConstructor
@Controller
public class QueryServiceSocketImpl implements QueryServiceSocket {

    private final HashMap<String, StoredSocketConnection> openConnections = new HashMap<>();
    private final QueryService QUERY_SERVICE;
    private final Vertx VERTX;

    @Override
    public Router createRouter(final Vertx vertx) {
        final Router router = Router.router(vertx);
        final SockJSHandlerOptions options = new SockJSHandlerOptions().setHeartbeatInterval(2000);
        final SockJSHandler sockJSHandler = SockJSHandler.create(vertx, options);
        final Router subRouter = sockJSHandler.socketHandler(sockJSSocket -> sockJSSocket.handler(d -> handleSubmittedQuery(d, sockJSSocket)));
        router.mountSubRouter("/", subRouter);
        return router;
    }

    @Override
    public void sendDataByUuid(final String uuid, final String type, final Object data) {
        final StoredSocketConnection connection = openConnections.get(uuid);
        if (connection != null) sendData(connection, type, data);
        else System.out.println("Websocket: Socket belonging to query with UUID " + uuid + " appears to be closed!");
    }

    private void handleSubmittedQuery(final Buffer data, final SockJSSocket socket) {
        System.out.println("Query Socket Handler: Incoming message (query).");
        QueryResponse validatedData = null;

        final StoredSocketConnection connection = StoredSocketConnection.of(socket, null);
        try {
            final JsonObject jsonData = new JsonObject(data);
            if (jsonData.containsKey("clientRef")) connection.setClientRef(jsonData.getString("clientRef"));
            validatedData = QUERY_SERVICE.query(jsonData.getJsonObject("queryData"));
        } catch (Exception e) {
            sendMessage(connection, "query.rejected", e.toString());
        }

        if (validatedData == null) sendMessage(connection, "query.rejected", "Invalid query");
        else {
            sendData(connection, "query.submitted", validatedData);
            scheduleQueryDataDeletion(validatedData.getUuid().toString(), connection);
        }
    }

    private void sendMessage(final StoredSocketConnection connection, final String type, final String message) {
        final JsonObject response = new JsonObject();
        response.put("type", type);
        response.put("message", message);
        if (connection.getClientRef() != null) response.put("ref", connection.getClientRef());
        connection.getSocket().write(response.toString());
    }

    private void sendData(final StoredSocketConnection connection, final String type, final Object data) {
        final JsonObject response = new JsonObject();
        response.put("type", type);
        response.put("data", data);
        if (connection.getClientRef() != null) response.put("ref", connection.getClientRef());
        connection.getSocket().write(response.toString());
    }

    private void scheduleQueryDataDeletion(final String uuid, final StoredSocketConnection connection) {
        VERTX.executeBlocking(blockingFuture -> {
            openConnections.put(uuid, connection);
            new Timer().schedule(new java.util.TimerTask() {
                @Override
                public void run() {
                    final StoredSocketConnection foundConnection = openConnections.get(uuid);
                    if (foundConnection != null) {
                        System.out.println("Query Socket Handler: Closed connection for query with UUID " + uuid + ".");
                        sendMessage(foundConnection, "query.closed", uuid);
                        openConnections.remove(uuid);
                    }
                    blockingFuture.complete();
                }
            }, 60 * 60 * 1000);
        });
    }
}
