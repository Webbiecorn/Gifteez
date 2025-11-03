# Merchant Whitelist Gids

## ⚠️ BELANGRIJK: Alleen goedgekeurde merchants!

Je mag **alleen producten tonen van merchants waarvoor je affiliate goedkeuring hebt gekregen**. 

Als je producten toont van niet-goedgekeurde merchants:
- ❌ Je krijgt **geen commissie** op verkopen
- ❌ Risico op **account suspension** bij affiliate netwerken
- ❌ Overtredingen van **affiliate programma voorwaarden**

---

## Huidige goedgekeurde merchants

✅ **Coolblue** (via AWIN)
✅ **Shop Like You Give A Damn** (via AWIN)
✅ **PartyPro** (via AWIN)

---

## Hoe nieuwe merchants toevoegen

### Stap 1: Aanmelden bij AWIN advertiser
1. Log in op AWIN dashboard
2. Zoek de advertiser (bijv. "MediaMarkt", "Bol.com")
3. Klik "Apply to Join Programme"
4. Wacht op **goedkeuring** (kan 1-14 dagen duren)

### Stap 2: Check je goedkeuring status
- ✅ **Approved** = groen licht, ga door naar stap 3
- ⏳ **Pending** = wachten, nog niet toevoegen
- ❌ **Rejected** = mag je NIET tonen

### Stap 3: Voeg merchant toe aan whitelist
Open `scripts/build-programmatic-indices.mts` en voeg de merchant toe:

```typescript
const APPROVED_MERCHANTS = [
  'Coolblue',
  'Coolblue NL',
  'Shop Like You Give A Damn',
  'PartyPro',
  'PartyPro.nl',
  
  // ⬇️ NIEUW: Voeg hier goedgekeurde merchants toe
  'MediaMarkt',      // ✅ Voorbeeld: na goedkeuring
  'Bol.com',         // ✅ Voorbeeld: na goedkeuring
]
```

### Stap 4: Download merchant feed (optioneel)
Als de merchant niet in je AWIN master feed zit:

1. Ga naar AWIN dashboard → "Links & Tools"
2. Zoek de advertiser
3. Download hun product feed (CSV format)
4. Plaats in `data/feeds/[merchant-naam]-feed.csv`
5. Update `FEED_PATHS` in build script

### Stap 5: Rebuild product indices
```bash
npm run classifier:build
```

Check de output:
- Zie je producten van de nieuwe merchant? ✅
- Geen producten? Check of merchant naam exact klopt

### Stap 6: Deploy naar productie
```bash
npm run build
firebase deploy --only hosting
```

---

## Merchant namen checken

Niet zeker hoe de merchant naam in je feed staat? Check het:

```bash
npx tsx -e "
import { parse } from 'csv-parse/sync';
import fs from 'fs';

const csv = fs.readFileSync('data/feeds/coolblue-latest.csv', 'utf-8');
const rows = parse(csv, { columns: true });

const merchants = new Set();
rows.forEach(row => merchants.add(row.merchant_name));

console.log('Merchants in feed:');
Array.from(merchants).sort().forEach(m => console.log('  -', m));
"
```

---

## Amazon affiliate

Amazon werkt **anders** dan AWIN:
- Eigen affiliate programma (Amazon Associates / PartnerNet)
- Eigen Product Advertising API
- Aparte implementatie nodig

Als je Amazon producten wilt tonen:
1. Meld je aan bij Amazon PartnerNet
2. Krijg API toegang (PA-API)
3. Voeg Amazon normalizer toe aan classifier
4. Amazon producten hebben geen `merchant_name` field → whitelist laat ze door

---

## Veelgestelde vragen

**Q: Ik zie producten van De Bijenkorf in mijn AWIN feed, maar ik ben afgewezen. Worden ze automatisch gefilterd?**  
A: Ja! Als "De Bijenkorf" niet in `APPROVED_MERCHANTS` staat, worden hun producten niet getoond.

**Q: Kan ik meerdere feeds combineren (Coolblue + Bol + MediaMarkt)?**  
A: Ja, maar **alleen na goedkeuring** bij alle drie merchants. Voeg ze toe aan whitelist en laad hun feeds.

**Q: Hoe weet ik of een merchant in mijn AWIN feed zit?**  
A: Check met het "Merchant namen checken" script hierboven.

**Q: Wat als ik per ongeluk niet-goedgekeurde producten toon?**  
A: Verwijder ze direct, rebuild, en deploy. Check je AWIN dashboard voor waarschuwingen.

---

## Best practices

✅ **Doe dit:**
- Controleer goedkeuring **voor** je merchant toevoegt
- Test altijd lokaal voor je deployed
- Documenteer welke merchants je wanneer hebt toegevoegd
- Check regelmatig je AWIN dashboard voor status updates

❌ **Doe dit NIET:**
- Merchants toevoegen "om te testen of het werkt"
- Aannemen dat je automatisch approved bent voor alle AWIN advertisers
- Feeds downloaden van merchants zonder goedkeuring
- Whitelist uitschakelen "om meer producten te hebben"

---

**Laatste update:** 3 november 2025
