#!/bin/bash

# Labels API Test Script
# Usage: ./scripts/test-labels-api.sh <BASE_URL> <JWT_TOKEN>

BASE_URL="${1:-http://localhost:3002}"
TOKEN="${2}"

if [ -z "$TOKEN" ]; then
    echo "Usage: ./test-labels-api.sh <BASE_URL> <JWT_TOKEN>"
    echo "Example: ./test-labels-api.sh http://localhost:3002 eyJhbGc..."
    exit 1
fi

echo "🧪 Testing Labels API at $BASE_URL"
echo "Using token: ${TOKEN:0:20}..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Get all images (should show labels array)
echo -e "${BLUE}Test 1: Get all images (with labels)${NC}"
IMAGES_RESPONSE=$(curl -s -X GET "$BASE_URL/images" \
  -H "Authorization: Bearer $TOKEN")
echo "$IMAGES_RESPONSE" | jq '.'

# Extract first image ID for subsequent tests
IMAGE_ID=$(echo "$IMAGES_RESPONSE" | jq -r '.[0].id // empty')

if [ -z "$IMAGE_ID" ]; then
    echo -e "${YELLOW}⚠️  No images found. Upload an image first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found image: $IMAGE_ID${NC}"
echo ""

# Test 2: Create a new label
echo -e "${BLUE}Test 2: Create new label 'vacation'${NC}"
curl -X POST "$BASE_URL/images/labels/new" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "vacation",
    "color": "#FF5733"
  }' | jq '.'
echo ""

# Test 3: Create another label
echo -e "${BLUE}Test 3: Create new label 'family'${NC}"
curl -X POST "$BASE_URL/images/labels/new" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "family",
    "color": "#33FF57"
  }' | jq '.'
echo ""

# Test 4: Get all labels
echo -e "${BLUE}Test 4: Get all available labels${NC}"
LABELS_RESPONSE=$(curl -s -X GET "$BASE_URL/images/labels/all" \
  -H "Authorization: Bearer $TOKEN")
echo "$LABELS_RESPONSE" | jq '.'

LABEL_ID=$(echo "$LABELS_RESPONSE" | jq -r '.[0].id // empty')
echo -e "${GREEN}✅ Found label: $LABEL_ID${NC}"
echo ""

# Test 5: Add label to image
echo -e "${BLUE}Test 5: Add 'vacation' label to image${NC}"
curl -X POST "$BASE_URL/images/$IMAGE_ID/labels" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "vacation",
    "color": "#FF5733"
  }' | jq '.'
echo ""

# Test 6: Add another label to same image
echo -e "${BLUE}Test 6: Add 'family' label to image${NC}"
curl -X POST "$BASE_URL/images/$IMAGE_ID/labels" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "family",
    "color": "#33FF57"
  }' | jq '.'
echo ""

# Test 7: Get single image (should now have labels)
echo -e "${BLUE}Test 7: Get single image with labels${NC}"
curl -s -X GET "$BASE_URL/images/$IMAGE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 8: Try to add duplicate label (should fail)
echo -e "${BLUE}Test 8: Try to add duplicate label (should fail)${NC}"
curl -X POST "$BASE_URL/images/$IMAGE_ID/labels" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "vacation"
  }' | jq '.'
echo ""

# Test 9: Remove label from image
echo -e "${BLUE}Test 9: Remove 'vacation' label from image${NC}"
if [ -n "$LABEL_ID" ]; then
    curl -X DELETE "$BASE_URL/images/$IMAGE_ID/labels/$LABEL_ID" \
      -H "Authorization: Bearer $TOKEN" | jq '.'
    echo ""
else
    echo -e "${RED}❌ No label ID found${NC}"
fi

# Test 10: Verify label was removed
echo -e "${BLUE}Test 10: Verify label was removed${NC}"
curl -s -X GET "$BASE_URL/images/$IMAGE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.labels'
echo ""

# Test 11: Delete label completely (removes from all images)
echo -e "${BLUE}Test 11: Delete label completely${NC}"
if [ -n "$LABEL_ID" ]; then
    curl -X DELETE "$BASE_URL/images/labels/$LABEL_ID" \
      -H "Authorization: Bearer $TOKEN"
    echo ""
    echo -e "${GREEN}✅ Label deleted${NC}"
else
    echo -e "${RED}❌ No label ID found${NC}"
fi
echo ""

# Final: Show all labels
echo -e "${BLUE}Final: Show remaining labels${NC}"
curl -s -X GET "$BASE_URL/images/labels/all" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

echo -e "${GREEN}✅ All tests completed!${NC}"
