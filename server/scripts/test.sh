#!/bin/bash
DIR=$(pwd)
FILE="$DIR/scripts/schema.sql"
if [ -f "$FILE" ]
then
  echo 'psql -f "$FILE" journal_test'
  dropdb journal_test
  createdb journal_test
  psql -f "$FILE" journal_test
  cargo test
else
  echo "please run this from the root of the server directory (named server)"
fi
