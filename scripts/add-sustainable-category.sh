#!/bin/bash
# Script om Duurzame Cadeaus categorie toe te voegen via Firebase REST API

echo "🌱 Adding Duurzame Cadeaus category to Firestore..."
echo ""

# Haal product IDs op uit JSON file
PRODUCT_IDS=$(jq -r '[.[] | .id | tostring] | join("\",\"")' public/data/shop-like-you-give-a-damn-import-ready.json)

# Firebase project details
PROJECT_ID="gifteez-7533b"
COLLECTION="dealCategoryBlocks"
DOCUMENT="current"

# Nieuwe categorie ID
CATEGORY_ID="duurzame-cadeaus-$(date +%s)"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "📦 Found products from Shop Like You Give A Damn"
echo "🆔 Category ID: $CATEGORY_ID"
echo ""

# Maak de Firestore update payload
cat > /tmp/firestore-update.json << EOF
{
  "fields": {
    "categories": {
      "arrayValue": {
        "values": [
          {
            "mapValue": {
              "fields": {
                "id": {"stringValue": "$CATEGORY_ID"},
                "title": {"stringValue": "Duurzame Cadeaus"},
                "description": {"stringValue": "🌿 Bewuste en ecologische geschenken van Shop Like You Give A Damn. Prachtige sets met vegan en duurzame producten. Perfect voor mensen die van de aarde houden."},
                "itemIds": {
                  "arrayValue": {
                    "values": [
$(echo "$PRODUCT_IDS" | sed 's/^/                      {"stringValue": "/; s/$/"},/')
                    ]
                  }
                }
              }
            }
          }
        ]
      }
    },
    "updatedAt": {"stringValue": "$TIMESTAMP"},
    "version": {"integerValue": "1"}
  }
}
EOF

echo "⚠️  NOTE: This script requires manual Firebase authentication"
echo "   For now, please use the browser console method instead:"
echo ""
echo "1. Go to: https://gifteez-7533b.web.app/admin"
echo "2. Open browser console (F12)"
echo "3. Run: cat scripts/add-sustainable-category.js"
echo "4. Copy and paste the script into console"
echo ""
echo "Alternative: Use Firebase CLI with --token flag"
echo ""

# Cleanup
rm /tmp/firestore-update.json
