CREATE TABLE prize_to_laureate
(
    year     SMALLINT                     NOT NULL,
    category SMALLINT                     NOT NULL,
    laureate SMALLINT REFERENCES laureate NOT NULL,
    FOREIGN KEY (category, year) REFERENCES prize (category, year),
    PRIMARY KEY (year, category, laureate)
);
