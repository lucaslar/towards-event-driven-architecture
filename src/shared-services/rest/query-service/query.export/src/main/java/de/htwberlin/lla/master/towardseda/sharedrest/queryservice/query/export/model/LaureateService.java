package de.htwberlin.lla.master.towardseda.sharedrest.queryservice.query.export.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor(staticName = "of")
public class LaureateService {
    private String scope;
    private String host;
}
