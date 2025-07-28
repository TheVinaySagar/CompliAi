#!/bin/bash

echo "Testing CompliAI Chat Endpoints"
echo "=================================="

# Test 1: Get authentication token
echo "Step 1: Getting authentication token..."
TOKEN=$(curl -s -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@compliai.com", "password": "admin123"}' | \
  python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('access_token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo "Failed to get authentication token"
    exit 1
fi

echo "Token obtained successfully: ${TOKEN:0:30}..."

# Test 2: Basic chat endpoint
echo -e "\nStep 2: Testing basic chat endpoint..."
CHAT_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "http://localhost:8000/chat/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is GRC compliance and why is it important?",
    "conversation_id": "test-conversation-001",
    "mode": "general"
  }')

HTTP_STATUS=$(echo "$CHAT_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
RESPONSE_BODY=$(echo "$CHAT_RESPONSE" | sed '/HTTP_STATUS:/d')

echo "HTTP Status: $HTTP_STATUS"
if [ "$HTTP_STATUS" = "200" ]; then
    echo "Chat endpoint working!"
    echo "Response preview: $(echo "$RESPONSE_BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('response', '')[:100])" 2>/dev/null)..."
else
    echo "Chat endpoint failed"
    echo "Response: $RESPONSE_BODY"
fi

# Test 3: Framework-specific chat
echo -e "\nStep 3: Testing framework-specific chat..."
FRAMEWORK_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "http://localhost:8000/chat/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the key controls in ISO 27001 for access management?",
    "conversation_id": "test-conversation-002",
    "framework_context": "ISO 27001",
    "mode": "general"
  }')

HTTP_STATUS=$(echo "$FRAMEWORK_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
RESPONSE_BODY=$(echo "$FRAMEWORK_RESPONSE" | sed '/HTTP_STATUS:/d')

echo "HTTP Status: $HTTP_STATUS"
if [ "$HTTP_STATUS" = "200" ]; then
    echo "Framework-specific chat working!"
    echo "Response preview: $(echo "$RESPONSE_BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('response', '')[:100])" 2>/dev/null)..."
else
    echo "Framework-specific chat failed"
    echo "Response: $RESPONSE_BODY"
fi

# Test 4: List conversations
echo -e "\nStep 4: Testing conversation listing..."
CONV_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "http://localhost:8000/chat/conversations" \
  -H "Authorization: Bearer $TOKEN")

HTTP_STATUS=$(echo "$CONV_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
RESPONSE_BODY=$(echo "$CONV_RESPONSE" | sed '/HTTP_STATUS:/d')

echo "HTTP Status: $HTTP_STATUS"
if [ "$HTTP_STATUS" = "200" ]; then
    echo "Conversation listing working!"
    echo "Conversations: $RESPONSE_BODY"
else
    echo "Conversation listing failed"
    echo "Response: $RESPONSE_BODY"
fi

echo -e "\nChat endpoint testing completed!"
