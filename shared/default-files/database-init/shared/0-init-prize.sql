CREATE TABLE prize_category
(
    id    SMALLINT PRIMARY KEY NOT NULL,
    title VARCHAR(255) UNIQUE  NOT NULL
);

CREATE TABLE prize
(
    category              SMALLINT REFERENCES prize_category NOT NULL,
    year                  SMALLINT                           NOT NULL,
    prize_amount          INTEGER                            NOT NULL,
    prize_amount_adjusted INTEGER                            NOT NULL,
    PRIMARY KEY (category, year)
);