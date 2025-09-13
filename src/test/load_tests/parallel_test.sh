#!/bin/bash

URL="http://localhost:8080/api/shorten"
TOTAL=500
CONCURRENCY=50

echo "Starting load test..."
echo "Total requests: $TOTAL"
echo "Concurrency: $CONCURRENCY"
echo "----------------------------------"

generate_request() {
  i=$1
  LONG_URL="https://httpbin.org/anything/page-$i-$(date +%s%N)"

  RESPONSE=$(curl -s -X POST "$URL" \
    -H "Content-Type: application/json" \
    -d "{\"url\":\"$LONG_URL\"}")

  echo "$i -> $RESPONSE"
}

export -f generate_request
export URL

seq 1 $TOTAL | xargs -n1 -P$CONCURRENCY -I{} bash -c 'generate_request "$@"' _ {}

echo "----------------------------------"
echo "Load test completed."