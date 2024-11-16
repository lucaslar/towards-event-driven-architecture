CREATE TABLE laureate
(
    id             SMALLINT PRIMARY KEY         NOT NULL,
    name           VARCHAR(255)                 NOT NULL,
    given_name     VARCHAR(255)                 NULL,
    gender         VARCHAR(55)                  NOT NULL,
    wiki_url       VARCHAR(255) UNIQUE          NOT NULL,
    laureate_url   VARCHAR(255) UNIQUE          NOT NULL,
    external_url   VARCHAR(255) UNIQUE          NOT NULL,
    birth          DATE                         NULL,
    birth_year     SMALLINT                     NULL,
    death          DATE                         NULL,
    death_year     SMALLINT                     NULL,
    birth_location VARCHAR(12)                  NULL,
    death_location VARCHAR(12)                  NULL
);