CREATE TABLE users (
	id  BIGSERIAL PRIMARY KEY,
	email       VARCHAR(200) NOT NULL,
	password    VARCHAR(200) NOT NULL,
	UNIQUE (email)
);

CREATE TABLE journals (
	id  BIGSERIAL PRIMARY KEY,
  title       TEXT,
	entry       TEXT NOT NULL,
  author      int NOT NULL,
  CONSTRAINT fk_author
    FOREIGN KEY(author)
    REFERENCES users(id)
);

