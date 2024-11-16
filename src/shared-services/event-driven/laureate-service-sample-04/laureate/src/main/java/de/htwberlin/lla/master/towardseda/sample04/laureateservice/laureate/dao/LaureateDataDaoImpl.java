package de.htwberlin.lla.master.towardseda.sample04.laureateservice.laureate.dao;

import de.htwberlin.lla.master.towardseda.sample04.laureateservice.laureate.export.model.Laureate;
import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.pgclient.PgPool;
import io.vertx.sqlclient.Row;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Repository
@AllArgsConstructor
public class LaureateDataDaoImpl implements LaureateDataDao {

    private final PgPool PG_POOL;

    @Override
    public Future<List<Laureate>> searchLaureates(final JsonObject data) {
        final String query = "SELECT DISTINCT * FROM laureate WHERE " + buildQueryCondition(data);
        return PG_POOL.query(query)
                .execute()
                .map(rs -> StreamSupport.stream(rs.spliterator(), true).map(this::mapRow).toList());
    }

    private String buildQueryCondition(final JsonObject data) {
        final List<String> fields = new ArrayList<>();
        if (data.containsKey("firstName")) fields.add(startsWithTlc(data.getString("firstName"), "given_name"));
        if (data.containsKey("lastName")) fields.add(startsWithTlc(data.getString("lastName"), "name"));
        if (data.containsKey("gender")) fields.add("gender='" + data.getString("gender") + "'");

        if (data.containsKey("birthDate")) fields.add(dateMapping(data.getValue("birthDate"), "birth"));
        if (data.containsKey("deathDate")) fields.add(dateMapping(data.getValue("deathDate"), "death"));

        if (data.containsKey("birthLocation")) {
            fields.add(geoHashMapping(data.getJsonArray("birthLocation"), "birth_location"));
        }
        if (data.containsKey("deathLocation")) {
            fields.add(geoHashMapping(data.getJsonArray("deathLocation"), "death_location"));
        }

        return String.join(" AND ", fields);
    }

    private String startsWithTlc(final String str, final String key) {
        final String safeString = str.toLowerCase().replaceAll("'","''");
        return "STARTS_WITH(LOWER(" + key + "), '" + safeString + "')";
    }

    private String dateMapping(final Object dateField, final String key) {
        String operator = "";
        final JsonObject json = JsonObject.mapFrom(dateField);
        final String date = json.getString("date");
        final String year = json.getString("year");

        switch (json.getString("operator")) {
            case "eq" -> operator += "=";
            case "lt" -> operator += "<";
            case "gt" -> operator += ">";
        }

        if (date == null) return key + "_year" + operator + year;
        else return key + operator + "'" + date + "'";
    }

    private String geoHashMapping(final JsonArray hashes, final String key) {
        final String hashesOr = hashes
                .stream()
                .map(hash -> startsWithTlc((String) hash, key))
                .collect(Collectors.joining(" OR "));
        return "(" + hashesOr + ")";
    }

    private Laureate mapRow(Row row) {
        return Laureate.of(
                row.getInteger("id"),
                row.getString("name"),
                row.getString("given_name"),
                row.getString("gender"),
                row.getString("wiki_url"),
                row.getString("laureate_url"),
                row.getString("external_url"),
                row.getLocalDate("birth"),
                row.getInteger("birth_year"),
                row.getLocalDate("death"),
                row.getInteger("death_year"),
                row.getString("birth_location"),
                row.getString("death_location")
        );
    }
}
