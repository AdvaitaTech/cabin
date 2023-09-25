DROP SCHEMA IF EXISTS testing CASCADE;
CREATE SCHEMA testing;

CREATE TABLE testing.users (
	id  BIGSERIAL PRIMARY KEY,
	email       VARCHAR(200) NOT NULL,
	password    VARCHAR(200) NOT NULL,
	UNIQUE (email)
);

CREATE TABLE testing.journals (
	id  BIGSERIAL PRIMARY KEY,
	entry       TEXT NOT NULL,
  author      int NOT NULL,
  CONSTRAINT fk_author
    FOREIGN KEY(author)
    REFERENCES testing.users(id)
);
