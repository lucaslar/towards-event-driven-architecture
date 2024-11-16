package de.htwberlin.lla.master.towardseda.sample01.modulith.query;

import de.htwberlin.lla.master.towardseda.sample01.modulith.laureate.export.LaureateService;
import de.htwberlin.lla.master.towardseda.sample01.modulith.query.export.QueryService;
import de.htwberlin.lla.master.towardseda.sample01.modulith.query.export.model.LaureateResults;
import de.htwberlin.lla.master.towardseda.sample01.modulith.query.export.model.QueryResponse;
import io.vertx.core.json.JsonObject;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class QueryServiceImpl implements QueryService {
    private final List<LaureateService> LAUREATE_SERVICES;

    private final String[] STR_FIELDS = {"firstName", "lastName", "gender"};
    private final String[] DATE_FIELDS = {"birthDate", "deathDate"};
    private final String[] LOCATION_FIELDS = {"birthLocation", "deathLocation"};

    QueryServiceImpl(
            final LaureateService ls1,
            final LaureateService ls2,
            final LaureateService ls3,
            final LaureateService ls4,
            final LaureateService ls5,
            final LaureateService ls6
    ) {
        ls1.setScope("Chemistry");
        ls2.setScope("Literature");
        ls3.setScope("Peace");
        ls4.setScope("Physics");
        ls5.setScope("Physiology or Medicine");
        ls6.setScope("Economic Sciences");
        LAUREATE_SERVICES = List.of(ls1, ls2, ls3, ls4, ls5, ls6);
        for (int i = 0; i < LAUREATE_SERVICES.size(); i++) LAUREATE_SERVICES.get(i).setIndex((i + 1));
    }

    @Override
    public QueryResponse query(final JsonObject data) {
        final String errMsg = validateData(data);
        if (errMsg != null) {
            System.err.println("Query Service: Invalid query. Reason: " + errMsg);
            return null;
        } else {
            System.out.println("Query Service: Valid query. Starting search for all laureates.");
            final UUID uuid = UUID.randomUUID();
            final Date timestamp = new Date();
            final JsonObject cleanedQueryData = cleanQueryData(data);
            final List<LaureateResults> laureateResponses = LAUREATE_SERVICES
                    .stream()
                    .map(ls -> LaureateResults.of(ls.getScope(), ls.search(cleanedQueryData)))
                    .toList();
            return QueryResponse.of(uuid, timestamp, cleanedQueryData, laureateResponses);
        }
    }

    private String validateData(final JsonObject data) {
        try {
            if (!validateFieldTypes(data)) return "Invalid field types";
            else if (!validateDateFields(data)) return "Invalid date fields";
            else if (!validateStringFields(data)) return "Invalid string fields";
            else return null;
        } catch (Exception e) {
            return e.toString();
        }
    }

    private boolean validateFieldTypes(final JsonObject data) {
        return getAllFields().stream().anyMatch(f -> data.getValue(f) != null);
    }

    private boolean validateDateFields(final JsonObject data) {
        final List<String> filtered = Arrays
                .stream(DATE_FIELDS)
                .filter(df -> data.getValue(df) != null)
                .toList();

        return filtered.isEmpty() ||
                filtered.stream()
                        .map(df -> JsonObject.mapFrom(data.getValue(df)))
                        .allMatch(jo -> {
                            final String operator = jo.getString("operator");
                            if (operator == null || !(operator.equals("eq") || operator.equals("lt") || operator.equals("gt"))) {
                                return false;
                            }
                            final boolean hasDate = jo.getValue("date") != null;
                            final boolean hasYear = jo.getValue("year") != null;
                            final boolean validDate = !hasDate || jo.getString("date").matches("^[0-9]{4}-[0-9]{2}-[0-9]{2}$");
                            final boolean validYear = !hasYear || jo.getInteger("year") != null;
                            return (hasDate && validDate && !hasYear) || (hasYear && validYear && !hasDate);
                        });
    }

    private boolean validateStringFields(final JsonObject data) {
        final List<String> allFields = new ArrayList<>();
        allFields.addAll(Arrays.stream(STR_FIELDS).toList());
        allFields.addAll(Arrays.stream(LOCATION_FIELDS).toList());

        final List<String> filtered = allFields
                .stream()
                .filter(df -> data.getValue(df) != null)
                .toList();

        return filtered.isEmpty() || filtered.stream().allMatch(f -> {
            if (Arrays.asList(LOCATION_FIELDS).contains(f)) {
                return data.getJsonArray(f).stream().allMatch(hash -> hash instanceof String && !((String) hash).isBlank());
            } else return data.getValue(f) instanceof String && !data.getString(f).isBlank();
        });
    }

    private List<String> getAllFields() {
        final List<String> allFields = new ArrayList<>();
        allFields.addAll(Arrays.stream(STR_FIELDS).toList());
        allFields.addAll(Arrays.stream(DATE_FIELDS).toList());
        allFields.addAll(Arrays.stream(LOCATION_FIELDS).toList());
        return allFields;
    }

    private JsonObject cleanQueryData(final JsonObject data) {
        final List<String> allFields = getAllFields();
        final JsonObject cleaned = new JsonObject();

        allFields.forEach(f -> {
            if (data.containsKey(f)) {
                if (Arrays.asList(DATE_FIELDS).contains(f)) {
                    final JsonObject value = JsonObject.mapFrom(data.getValue(f));
                    final JsonObject cleanedVal = new JsonObject();
                    cleanedVal.put("operator", value.getValue("operator"));
                    if (value.containsKey("year")) cleanedVal.put("year", value.getValue("year"));
                    if (value.containsKey("date")) cleanedVal.put("date", value.getValue("date"));
                    cleaned.put(f, cleanedVal);
                } else if (data.getValue(f) instanceof String) cleaned.put(f, data.getString(f).trim());
                else cleaned.put(f, data.getValue(f));
            }
        });

        return cleaned;
    }
}
