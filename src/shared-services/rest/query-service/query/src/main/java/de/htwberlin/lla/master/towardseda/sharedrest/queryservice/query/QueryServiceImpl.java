package de.htwberlin.lla.master.towardseda.sharedrest.queryservice.query;

import de.htwberlin.lla.master.towardseda.sharedrest.queryservice.query.export.QueryService;
import de.htwberlin.lla.master.towardseda.sharedrest.queryservice.query.export.model.LaureateResults;
import de.htwberlin.lla.master.towardseda.sharedrest.queryservice.query.export.model.LaureateService;
import de.htwberlin.lla.master.towardseda.sharedrest.queryservice.query.export.model.QueryResponse;
import de.htwberlin.lla.master.towardseda.sharedrest.queryservice.query.out.LaureateDataClient;
import io.vertx.core.json.JsonObject;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class QueryServiceImpl implements QueryService {
    private final LaureateDataClient LAUREATE_DATA_CLIENT;

    private final String[] STR_FIELDS = {"firstName", "lastName", "gender"};
    private final String[] DATE_FIELDS = {"birthDate", "deathDate"};
    private final String[] LOCATION_FIELDS = {"birthLocation", "deathLocation"};

    private List<LaureateService> laureateServices;

    QueryServiceImpl(final LaureateDataClient laureateDataClient) {
        this.LAUREATE_DATA_CLIENT = laureateDataClient;
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
            final List<LaureateResults> laureateResponses = laureateServices
                    .stream()
                    .map(ls -> LaureateResults.of(ls.getScope(), LAUREATE_DATA_CLIENT.search(ls.getHost(), cleanedQueryData)))
                    .toList();
            return QueryResponse.of(uuid, timestamp, cleanedQueryData, laureateResponses);
        }
    }

    @Override
    public void setServiceInstances(final List<LaureateService> laureateServices) {
        this.laureateServices = laureateServices;
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
