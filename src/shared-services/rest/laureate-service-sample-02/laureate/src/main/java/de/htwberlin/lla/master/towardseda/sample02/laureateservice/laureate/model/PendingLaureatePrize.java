package de.htwberlin.lla.master.towardseda.sample02.laureateservice.laureate.model;

import de.htwberlin.lla.master.towardseda.sample02.laureateservice.laureate.export.model.Laureate;
import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor(staticName = "of")
public class PendingLaureatePrize {
    private Laureate laureate;
    private Future<JsonArray> prizes;
}
