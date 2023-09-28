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

INSERT INTO users(email, password) VALUES (
  'testing100@example.com',
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0aW5nMTAwQGV4YW1wbGUuY29tIiwiZXhwIjoxNzExNTc0NDIxfQ.KA1kPv95YJWpo1n3FAmysm5NDbfy-aStkRTtfwsYOFI'
);

INSERT INTO users(email, password) VALUES (
  'testing101@example.com',
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0aW5nMTAwQGV4YW1wbGUuY29tIiwiZXhwIjoxNzExNTc0NDIxfQ.KA1kPv95YJWpo1n3FAmysm5NDbfy-aStkRTtfwsYOFI'
);
