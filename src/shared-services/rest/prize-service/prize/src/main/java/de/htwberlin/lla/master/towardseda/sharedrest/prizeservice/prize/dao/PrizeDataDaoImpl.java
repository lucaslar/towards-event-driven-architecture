package de.htwberlin.lla.master.towardseda.sharedrest.prizeservice.prize.dao;

import de.htwberlin.lla.master.towardseda.sharedrest.prizeservice.prize.export.model.Prize;
import io.vertx.core.Future;
import io.vertx.pgclient.PgPool;
import io.vertx.sqlclient.Row;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.StreamSupport;

@Repository
@AllArgsConstructor
public class PrizeDataDaoImpl implements PrizeDataDao {

    private final PgPool PG_POOL;

    @Override
    public Future<List<Prize>> searchPrizesForLaureates(int... ids) {
        final String idsString = IntStream.of(ids).mapToObj(Integer::toString).collect(Collectors.joining(","));
        final String query = "SELECT * FROM prize p INNER JOIN prize_category pc ON pc.id = p.category INNER JOIN prize_to_laureate ptl ON ptl.category = p.category AND ptl.year = p.year WHERE laureate IN (" + idsString + ")";
        return PG_POOL.query(query)
                .execute()
                .map(rs -> StreamSupport.stream(rs.spliterator(), true).map(this::mapRow).toList());
    }

    private Prize mapRow(Row row) {
        return Prize.of(
                row.getString("title"),
                row.getInteger("laureate"),
                row.getInteger("year"),
                row.getInteger("prize_amount"),
                row.getInteger("prize_amount_adjusted")
        );
    }
}
