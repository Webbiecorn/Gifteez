# Coolblue feed snel terugvinden

Deze gids beschrijft hoe je de actuele Coolblue productfeed binnen het project kunt lokaliseren en controleren.

## 1. Snelle CLI-check (aanrader)

```bash
npm run show:coolblue-feed
```

De tool toont:

- Het pad naar `data/importedProducts.json` (de gebundelde Coolblue feed)
- Aantal producten, bestandsgrootte en laatste wijzigingsdatum
- Enkele voorbeeldproducten
- Verwijzingen naar de download/convert scripts
- De LocalStorage key (`gifteez_coolblue_feed_v1`) voor wanneer je via de browser wilt kijken

Je kunt het script ook direct aanroepen:

```bash
node scripts/show-coolblue-feed.mjs
```

## 2. Feed updaten of opnieuw binnenhalen

- `scripts/feedDownloader.mjs` – download automatisch de laatste feed via Awin
- `scripts/processCsv.mjs` – converteert de CSV naar `data/importedProducts.json`

Combineer deze scripts wanneer je een nieuwe feed wilt bundelen in de app.

## 3. Inspectie via de browser (optioneel)

1. Open de live site in Chrome/Edge en ga naar DevTools → **Application** → **Local Storage** → `https://gifteez.nl`
2. Zoek naar de key `gifteez_coolblue_feed_v1`
3. Kopieer de JSON en plak het eventueel in een editor om te analyseren

Met deze stappen heb je altijd snel inzicht in de Coolblue feed die de site gebruikt.
