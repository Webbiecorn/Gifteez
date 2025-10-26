#!/bin/bash

# Script to fetch current Amazon product image URLs

echo "Fetching Amazon product images..."

# Array van affiliate links
declare -a links=(
"https://www.amazon.nl/HUAWEI-Ooromsluitend-draagcomfort-Dual-driver-Verbinding/dp/B0F2TD7MBZ"
"https://www.amazon.nl/amazon-echo-dot-5e-generatie-2022-release-smartspeaker-met-wifi-bluetooth-en-alexa-charcoal/dp/B09B8X9RGM"
"https://www.amazon.nl/NOBIS-Powerbank-Draagbare-Snelladen-Compatibel/dp/B0D63H6KKV"
"https://www.amazon.nl/Zelfzorgset-Voor-Vrouwen-Ontspanning-Echtgenote/dp/B0FBGJH28X"
"https://www.amazon.nl/ZOVHYYA-Luchtbevochtiger-Afstandsbediening-Automatische-Uitschakeling/dp/B0CSYY5GXR"
"https://www.amazon.nl/Nekmassageapparaat-2025-Shiatsu-massage-grafeenverwarming-draagstijlen/dp/B0F53MKHBT"
"https://www.amazon.nl/Polar-Night-verzwaringsdeken-voor-volwassenen/dp/B08ZSSCVG7"
"https://www.amazon.nl/Koffiecadeau-probeerset-geroosterd-koffiebonen-volautomaat/dp/B093DLP5MS"
"https://www.amazon.nl/Anthon-Berg-Chocolade-Liquor-Chocolates/dp/B09HT6L72D"
"https://www.amazon.nl/StarBlue-Kaasplankenset-Kaassnijplank-housewarming-Verjaardagscadeaus/dp/B08Q2WTJQX"
"https://www.amazon.nl/Bar-Dedicated-Cocktail-Receptenboek-Cadeauverpakking/dp/B0CRRRMPDR"
"https://www.amazon.nl/kindle-paperwhite-2024/dp/B0CFPWLGF2"
"https://www.amazon.nl/Moleskine-Essential-gelinieerd-notitieboek-rollerballpen/dp/B0B55XSNNV"
"https://www.amazon.nl/Faber-Castell-Creative-Aquarellen-meerkleurig-universiteit/dp/B0828LQX8R"
)

declare -a names=(
"HUAWEI FreeBuds 6i"
"Echo Dot 5e Gen"
"NOBIS Powerbank"
"Spa Gift Set"
"Diffuser"
"Nekmassage"
"Verzwaringsdeken"
"Koffie Set"
"Anthon Berg Chocolade"
"Kaasplank"
"Cocktail Set"
"Kindle"
"Moleskine"
"Aquarel Kit"
)

# Loop door alle links
for i in "${!links[@]}"; do
    echo ""
    echo "=== ${names[$i]} ==="
    
    # Haal HTML op
    html=$(curl -s -A "Mozilla/5.0" "${links[$i]}")
    
    # Extract image URL (zoek naar landingImage of eerste grote product image)
    image=$(echo "$html" | grep -oP 'https://m\.media-amazon\.com/images/I/[^"]+\.jpg' | head -1)
    
    if [ -n "$image" ]; then
        echo "Image URL: $image"
    else
        echo "❌ No image found"
    fi
done
