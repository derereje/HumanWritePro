#!/bin/bash
OUTPUT_FILE="content.txt"
ERROR_FILE="error.log"

> "$OUTPUT_FILE"
> "$ERROR_FILE"

echo "Testing OpenAI API connection..."
echo ""

response=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d @test-openai-curl.json)

# Separate status code and body
body=$(echo "$response" | sed -e 's/HTTP_STATUS\:.*//g')
status=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')

echo "HTTP Status: $status"

if [[ "$status" -ne 200 ]]; then
  echo "❌ Error! See error.log for details."
  echo "$body" > "$ERROR_FILE"
else
  echo "$body" > "$OUTPUT_FILE"
  echo "✅ Response saved to $OUTPUT_FILE"
fi
