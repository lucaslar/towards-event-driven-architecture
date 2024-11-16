package de.htwberlin.lla.master.towardseda.sample01.modulith.laureate.export.model;

import de.htwberlin.lla.master.towardseda.sample01.modulith.prize.export.model.Prize;
import lombok.Getter;

import java.util.List;

public class LaureateAndPrizes extends Laureate {
    @Getter
    private List<Prize> prizes;

    @Getter
    private String prizesErr;

    private LaureateAndPrizes(final Laureate laureate) {
        super();
        super.setId(laureate.getId());
        super.setName(laureate.getName());
        super.setGivenName(laureate.getGivenName());
        super.setGender(laureate.getGender());
        super.setWikiUrl(laureate.getWikiUrl());
        super.setLaureateUrl(laureate.getLaureateUrl());
        super.setExternalUrl(laureate.getExternalUrl());
        super.setBirth(laureate.getBirth());
        super.setBirthYear(laureate.getBirthYear());
        super.setDeath(laureate.getDeath());
        super.setDeathYear(laureate.getDeathYear());
        super.setBirthLocation(laureate.getBirthLocation());
        super.setDeathLocation(laureate.getDeathLocation());
    }

    private LaureateAndPrizes(final Laureate laureate, final List<Prize> prizes) {
        this(laureate);
        this.prizes = prizes;
    }

    private LaureateAndPrizes(final Laureate laureate, final String prizesErr) {
        this(laureate);
        this.prizesErr = prizesErr;
    }

    public static LaureateAndPrizes of(final Laureate laureate, final List<Prize> prizes) {
        return new LaureateAndPrizes(laureate, prizes);
    }

    public static LaureateAndPrizes of(final Laureate laureate, final String error) {
        return new LaureateAndPrizes(laureate, error);
    }
}
