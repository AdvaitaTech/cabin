trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT
DIR=$(pwd)
FILE="$DIR/server/scripts/schema.sql"
SEED="$DIR/server/scripts/seed.sql"
dropdb journal_test
createdb journal_test
psql -f "$FILE" journal_test
psql -f "$SEED" journal_test
cd server
RUST_ENV=test cargo run &
cd ../client
bun vite --host 0.0.0.0 &
bun cypress run
