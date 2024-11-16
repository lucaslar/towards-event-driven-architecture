package de.htwberlin.lla.master.towardseda.sample01.modulith.query.export.model;

import de.htwberlin.lla.master.towardseda.sample01.modulith.laureate.export.model.LaureateAndPrizes;
import io.vertx.core.Future;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@AllArgsConstructor(staticName = "of")
@Getter
public class LaureateResults {
    private String service;
    private Future<List<LaureateAndPrizes>> search;
}
