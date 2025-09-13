#!/bin/bash

echo "🚀 Testing Gifteez Product Automation System"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directory paths
BASE_DIR="/home/kevin/Gifteez website/gifteez"
SCRIPTS_DIR="$BASE_DIR/scripts"
DATA_DIR="$BASE_DIR/data"
PUBLIC_DATA_DIR="$BASE_DIR/public/data"

echo -e "${BLUE}📍 Working in: $BASE_DIR${NC}"

# Test 1: Check if CSV file exists
echo -e "\n${YELLOW}Test 1: Checking for downloaded CSV file...${NC}"
CSV_FILE="/home/kevin/Downloads/datafeed_2566111.csv"
if [ -f "$CSV_FILE" ]; then
    LINE_COUNT=$(wc -l < "$CSV_FILE")
    echo -e "${GREEN}✅ CSV file found: $LINE_COUNT lines${NC}"
else
    echo -e "${RED}❌ CSV file not found at $CSV_FILE${NC}"
    echo -e "${YELLOW}💡 Run the feed downloader first${NC}"
fi

# Test 2: Check if processing scripts exist
echo -e "\n${YELLOW}Test 2: Checking processing scripts...${NC}"
if [ -f "$SCRIPTS_DIR/processCsv.mjs" ]; then
    echo -e "${GREEN}✅ CSV processor found${NC}"
else
    echo -e "${RED}❌ CSV processor missing${NC}"
fi

if [ -f "$SCRIPTS_DIR/feedDownloader.mjs" ]; then
    echo -e "${GREEN}✅ Feed downloader found${NC}"
else
    echo -e "${RED}❌ Feed downloader missing${NC}"
fi

# Test 3: Check if TypeScript services exist
echo -e "\n${YELLOW}Test 3: Checking TypeScript services...${NC}"
if [ -f "$BASE_DIR/services/productFeedService.ts" ]; then
    echo -e "${GREEN}✅ Product feed service found${NC}"
else
    echo -e "${RED}❌ Product feed service missing${NC}"
fi

if [ -f "$BASE_DIR/services/dynamicProductService.ts" ]; then
    echo -e "${GREEN}✅ Dynamic product service found${NC}"
else
    echo -e "${RED}❌ Dynamic product service missing${NC}"
fi

# Test 4: Check processed data files
echo -e "\n${YELLOW}Test 4: Checking processed data files...${NC}"
if [ -f "$DATA_DIR/sampleProducts.json" ]; then
    SAMPLE_COUNT=$(jq length "$DATA_DIR/sampleProducts.json" 2>/dev/null || echo "0")
    echo -e "${GREEN}✅ Sample products found: $SAMPLE_COUNT items${NC}"
else
    echo -e "${RED}❌ Sample products file missing${NC}"
fi

if [ -f "$DATA_DIR/importedProducts.json" ]; then
    IMPORT_COUNT=$(jq length "$DATA_DIR/importedProducts.json" 2>/dev/null || echo "0")
    echo -e "${GREEN}✅ Imported products found: $IMPORT_COUNT items${NC}"
else
    echo -e "${RED}❌ Imported products file missing${NC}"
fi

# Test 5: Check public data access
echo -e "\n${YELLOW}Test 5: Checking public data access...${NC}"
if [ -f "$PUBLIC_DATA_DIR/sampleProducts.json" ]; then
    echo -e "${GREEN}✅ Public sample products available${NC}"
else
    echo -e "${RED}❌ Public sample products missing${NC}"
    echo -e "${YELLOW}💡 Copying sample data to public folder...${NC}"
    mkdir -p "$PUBLIC_DATA_DIR"
    if [ -f "$DATA_DIR/sampleProducts.json" ]; then
        cp "$DATA_DIR/sampleProducts.json" "$PUBLIC_DATA_DIR/"
        echo -e "${GREEN}✅ Sample data copied to public folder${NC}"
    fi
fi

# Test 6: Run CSV processing test
echo -e "\n${YELLOW}Test 6: Testing CSV processing...${NC}"
if [ -f "$CSV_FILE" ] && [ -f "$SCRIPTS_DIR/processCsv.mjs" ]; then
    echo -e "${BLUE}🔄 Running CSV processor (first 100 lines for speed)...${NC}"
    cd "$BASE_DIR"
    
    # Create a smaller test file for faster processing
    head -101 "$CSV_FILE" > "/tmp/test_feed.csv"
    
    # Temporarily modify the script to use test file
    TEST_SCRIPT="/tmp/test_processor.mjs"
    sed "s|/home/kevin/Downloads/datafeed_2566111.csv|/tmp/test_feed.csv|g" "$SCRIPTS_DIR/processCsv.mjs" > "$TEST_SCRIPT"
    
    if timeout 30 node "$TEST_SCRIPT" > /tmp/csv_test_output.log 2>&1; then
        echo -e "${GREEN}✅ CSV processing test completed${NC}"
        grep "Successfully processed" /tmp/csv_test_output.log | head -1
    else
        echo -e "${RED}❌ CSV processing test failed or timed out${NC}"
        echo -e "${YELLOW}💡 Check /tmp/csv_test_output.log for details${NC}"
    fi
    
    # Clean up
    rm -f "/tmp/test_feed.csv" "$TEST_SCRIPT"
else
    echo -e "${YELLOW}⏭️  Skipping CSV processing test (missing files)${NC}"
fi

# Test 7: Check build system
echo -e "\n${YELLOW}Test 7: Testing build system...${NC}"
cd "$BASE_DIR"
if npm run build > /tmp/build_test.log 2>&1; then
    echo -e "${GREEN}✅ Build system working${NC}"
else
    echo -e "${RED}❌ Build system failed${NC}"
    echo -e "${YELLOW}💡 Check /tmp/build_test.log for details${NC}"
fi

# Test 8: Check development server
echo -e "\n${YELLOW}Test 8: Testing development server...${NC}"
if pgrep -f "vite" > /dev/null; then
    echo -e "${GREEN}✅ Development server is running${NC}"
    echo -e "${BLUE}🌐 Available at: http://localhost:5173/${NC}"
else
    echo -e "${YELLOW}⚠️  Development server not running${NC}"
    echo -e "${BLUE}💡 Start with: npm run dev${NC}"
fi

# Test 9: Check data freshness
echo -e "\n${YELLOW}Test 9: Checking data freshness...${NC}"
if [ -f "$CSV_FILE" ]; then
    FILE_AGE=$(find "$CSV_FILE" -mtime +1 2>/dev/null | wc -l)
    if [ "$FILE_AGE" -eq 0 ]; then
        echo -e "${GREEN}✅ CSV data is fresh (less than 1 day old)${NC}"
    else
        echo -e "${YELLOW}⚠️  CSV data is older than 1 day${NC}"
        echo -e "${BLUE}💡 Consider downloading fresh data${NC}"
    fi
fi

# Summary
echo -e "\n${BLUE}📊 AUTOMATION SYSTEM SUMMARY${NC}"
echo -e "${BLUE}=============================${NC}"

TOTAL_TESTS=9
PASSED_TESTS=0

# Count passed tests (simplified check)
[ -f "$CSV_FILE" ] && ((PASSED_TESTS++))
[ -f "$SCRIPTS_DIR/processCsv.mjs" ] && ((PASSED_TESTS++))
[ -f "$BASE_DIR/services/productFeedService.ts" ] && ((PASSED_TESTS++))
[ -f "$DATA_DIR/sampleProducts.json" ] && ((PASSED_TESTS++))
[ -f "$PUBLIC_DATA_DIR/sampleProducts.json" ] && ((PASSED_TESTS++))

echo -e "${GREEN}✅ Tests Passed: $PASSED_TESTS/$TOTAL_TESTS${NC}"

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 All systems operational! Automation ready for production.${NC}"
elif [ $PASSED_TESTS -ge 7 ]; then
    echo -e "${YELLOW}⚠️  Most systems working. Minor issues detected.${NC}"
else
    echo -e "${RED}❌ Major issues detected. Review failed tests above.${NC}"
fi

echo -e "\n${BLUE}🚀 Quick Start Commands:${NC}"
echo -e "${BLUE}• Download feed: node scripts/feedDownloader.mjs download${NC}"
echo -e "${BLUE}• Process feed:  node scripts/processCsv.mjs${NC}"
echo -e "${BLUE}• Start dev:     npm run dev${NC}"
echo -e "${BLUE}• Build:         npm run build${NC}"
echo -e "${BLUE}• Deploy:        npm run deploy${NC}"

echo -e "\n${GREEN}✨ Test completed!${NC}"
