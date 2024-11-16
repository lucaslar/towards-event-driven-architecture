package de.htwberlin.lla.master.towardseda.sample04.prizeservice.prize.export.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@AllArgsConstructor(staticName = "of")
@ToString
@Builder
public class Prize {
    private String category;
    private Integer laureate;
    private Integer year;
    private Integer prizeAmount;
    private Integer prizeAmountAdjusted;
}
