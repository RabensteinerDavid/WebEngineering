#!/bin/sh
set -eu

# Run against a fresh API or wait one minute for the previous window to expire.
api_url=${1:-http://localhost:3000}
for attempt in $(seq 1 11); do
  printf '\nAttempt %s\n' "$attempt"
  curl -sS -i "$api_url/api/auth/login" \
    -H 'Content-Type: application/json' \
    -d '{"email":"rate-limit-check@example.com","password":"deliberately wrong password"}'
done
