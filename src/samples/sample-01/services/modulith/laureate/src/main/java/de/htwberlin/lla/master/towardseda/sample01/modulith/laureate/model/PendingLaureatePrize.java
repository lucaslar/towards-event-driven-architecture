package de.htwberlin.lla.master.towardseda.sample01.modulith.laureate.model;

import de.htwberlin.lla.master.towardseda.sample01.modulith.laureate.export.model.Laureate;
import de.htwberlin.lla.master.towardseda.sample01.modulith.prize.export.model.Prize;
import io.vertx.core.Future;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor(staticName = "of")
public class PendingLaureatePrize {
    private Laureate laureate;
    private Future<List<Prize>> prizes;
}
