CREATE TABLE prize_to_laureate
(
    year     SMALLINT NOT NULL,
    category SMALLINT NOT NULL,
    laureate SMALLINT NOT NULL, -- No reference to laureate table
    FOREIGN KEY (category, year) REFERENCES prize (category, year),
    PRIMARY KEY (year, category, laureate)
);
