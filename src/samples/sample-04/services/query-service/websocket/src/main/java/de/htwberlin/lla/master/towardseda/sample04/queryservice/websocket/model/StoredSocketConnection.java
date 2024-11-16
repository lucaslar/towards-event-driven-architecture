package de.htwberlin.lla.master.towardseda.sample04.queryservice.websocket.model;

import io.vertx.ext.web.handler.sockjs.SockJSSocket;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.lang.Nullable;

@AllArgsConstructor(staticName = "of")
@Getter
public class StoredSocketConnection {
    private SockJSSocket socket;
    @Nullable
    @Setter
    private String clientRef;
}
