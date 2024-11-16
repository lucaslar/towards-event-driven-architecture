package de.htwberlin.lla.master.towardseda.sample03.laureateservice.laureate.export.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import lombok.*;

import java.time.LocalDate;

@Data
@AllArgsConstructor(staticName = "of")
@NoArgsConstructor
@ToString
@Builder
public class Laureate {

    @NonNull
    private int id;

    @NonNull
    private String name;

    private String givenName;

    @NonNull
    private String gender;

    @NonNull
    private String wikiUrl;

    @NonNull
    private String laureateUrl;

    @NonNull
    private String externalUrl;

    @JsonDeserialize(using = LocalDateDeserializer.class)
    @JsonSerialize(using = LocalDateSerializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate birth;

    private Integer birthYear;

    @JsonDeserialize(using = LocalDateDeserializer.class)
    @JsonSerialize(using = LocalDateSerializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate death;

    private Integer deathYear;

    private String birthLocation;

    private String deathLocation;
}
