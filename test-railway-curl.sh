#!/bin/bash

# Railway API Test Script
# Tests the Gemini transformation endpoint using curl

echo "🚀 Railway Gemini API Test Script"
echo "=================================="
echo ""

# Configuration
API_URL="https://letzteshemd-faceswap-api-production.up.railway.app/gemini-transform"
IMAGE_PATH="/Users/alexanderburum-auensen/Downloads/download (9).jpeg"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to encode image to base64
encode_image() {
    if [ -f "$IMAGE_PATH" ]; then
        echo "📸 Encoding image: $IMAGE_PATH"
        IMAGE_BASE64=$(base64 -i "$IMAGE_PATH" | tr -d '\n')
        echo -e "${GREEN}✓ Image encoded successfully${NC}"
    else
        echo -e "${YELLOW}⚠ Image not found, using test data${NC}"
        # Use a tiny 1x1 pixel PNG as fallback
        IMAGE_BASE64="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    fi
}

# Test 1: Check if API is reachable
test_connection() {
    echo ""
    echo "Test 1: API Connection"
    echo "----------------------"
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$API_URL")
    
    if [ "$HTTP_CODE" -ne "000" ]; then
        echo -e "${GREEN}✓ API is reachable (HTTP $HTTP_CODE)${NC}"
        return 0
    else
        echo -e "${RED}✗ API is not reachable${NC}"
        return 1
    fi
}

# Test 2: Send transformation request
test_transformation() {
    echo ""
    echo "Test 2: Transformation Request"
    echo "------------------------------"
    
    # Create JSON payload
    JSON_PAYLOAD=$(cat <<EOF
{
    "image": "data:image/png;base64,$IMAGE_BASE64",
    "prompt": "Transform this into a Pixar-style cartoon",
    "productId": "test-product-123",
    "customerId": "test-customer-456",
    "watermarkImage": {
        "url": "https://cdn.shopify.com/watermark.png",
        "width": 410,
        "height": 410,
        "spaceBetweenWatermarks": 100
    }
}
EOF
)
    
    echo "📤 Sending POST request to $API_URL"
    echo "   Payload size: $(echo "$JSON_PAYLOAD" | wc -c) bytes"
    echo ""
    
    # Send request and capture response
    RESPONSE=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        -d "$JSON_PAYLOAD")
    
    # Check if response is valid JSON
    if echo "$RESPONSE" | python3 -m json.tool > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Valid JSON response received${NC}"
        echo ""
        echo "Response:"
        echo "$RESPONSE" | python3 -m json.tool
        
        # Check if successful
        if echo "$RESPONSE" | grep -q '"success":true'; then
            echo ""
            echo -e "${GREEN}✓ Transformation successful!${NC}"
            
            # Extract image URL if present
            IMAGE_URL=$(echo "$RESPONSE" | grep -o '"imageUrl":"[^"]*' | cut -d'"' -f4)
            if [ ! -z "$IMAGE_URL" ]; then
                echo "   Image URL: $IMAGE_URL"
            fi
        else
            echo ""
            echo -e "${YELLOW}⚠ Transformation returned an error${NC}"
            ERROR_MSG=$(echo "$RESPONSE" | grep -o '"message":"[^"]*' | cut -d'"' -f4)
            echo "   Error: $ERROR_MSG"
        fi
    else
        echo -e "${RED}✗ Invalid response received${NC}"
        echo "Raw response: $RESPONSE"
    fi
}

# Test 3: Quick health check
test_health() {
    echo ""
    echo "Test 3: Quick Health Check"
    echo "-------------------------"
    
    START_TIME=$(date +%s)
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d '{"test": true}')
    END_TIME=$(date +%s)
    
    RESPONSE_TIME=$((END_TIME - START_TIME))
    
    echo "   Response Code: $HTTP_CODE"
    echo "   Response Time: ${RESPONSE_TIME}ms"
    
    if [ "$HTTP_CODE" -eq "200" ] || [ "$HTTP_CODE" -eq "400" ] || [ "$HTTP_CODE" -eq "500" ]; then
        echo -e "${GREEN}✓ API is responding to requests${NC}"
    else
        echo -e "${RED}✗ Unexpected response code${NC}"
    fi
}

# Main execution
main() {
    echo "🔧 Configuration:"
    echo "   API URL: $API_URL"
    echo "   Image: $IMAGE_PATH"
    echo ""
    
    # Encode image
    encode_image
    
    # Run tests
    if test_connection; then
        test_transformation
        test_health
    fi
    
    echo ""
    echo "=================================="
    echo -e "${GREEN}✓ Test Complete${NC}"
    echo "Time: $(date)"
    echo ""
}

# Run main function
main