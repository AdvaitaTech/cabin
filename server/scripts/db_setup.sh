#!/bin/bash
DIR=$(pwd)
FILE="$DIR/scripts/schema.sql"
if [ -f "$FILE" ]
then
  echo 'psql -f "$FILE" journal_test'
  psql -f "$FILE" journal_test
else
  echo "please run this from the root of the server director (named server)"
fi
