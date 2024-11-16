package de.htwberlin.lla.master.towardseda.sample01.modulith.query.rest.model;

import de.htwberlin.lla.master.towardseda.sample01.modulith.laureate.export.model.LaureateAndPrizes;
import lombok.Data;

import java.util.List;

@Data
public class QueryEndpointServiceResult {
    private String service;
    private List<LaureateAndPrizes> results;
    private String error;

    public QueryEndpointServiceResult(final String service) {
        this.service = service;
    }
}
