# QA — `sinterklaas-voor-kinderen-onder-25` (15 nov 2025)

- **Source JSON**: `public/programmatic/sinterklaas-voor-kinderen-onder-25.json`
- **Build command**: `npm run build-programmatic-indices` (Coolblue feed only)
- **Products live**: 10

## Bevindingen

1. **Overdominantie BlueBuilt** – 7/10 items zijn BlueBuilt accessoires (muismatten + screenprotectors). Lijst oogt nu als bureauset i.p.v. pakjesavond.
2. **Geen speelgoed/knutselartikelen** – Alle items zijn gaming/peripheral upgrades (koptelefoons, muismat, screenprotector, PSN-kaart). Geen Lego, boeken, creatief materiaal.
3. **Dubbele varianten** – Zowel ergonomische als standaard muismat én drie verschillende Switch screenprotectors leveren weinig nieuwe waarde.
4. **Leeftijd mismatch** – MicroSD-kaart en PSN-tegoed zijn meer geschikt voor tieners; er ontbreekt content voor 4–9 jaar.
5. **Merklimiet tijdelijk opgehoogd** – `maxPerBrand` staat nu op 6 om 10 producten te halen. Zodra er meer speelgoedfeeds zijn (Bol, Intertoys) moet dit terug naar 2–3 om herhaling te voorkomen.

## Suggesties voor volgende iteratie

- Bron uitbreiden met Bol / Intertoys via AWIN zodat LEGO/Duplo/knutselsets kunnen matchen.
- Tijdelijke manual overrides / editor picks toevoegen voor klassiek speelgoed (< €25).
- Alternatieve keywords toevoegen (`puzzels`, `knutselboek`, `speelkaarten`, `snoep`, `schoencadeau`).
- Zodra nieuw aanbod binnen is: verlaag `maxPerBrand` terug naar 2 en voeg `excludeKeywords` toe voor kantoorartikelen.

## Playwright regressietests (15 nov 2025)

- Laatste run: `npx playwright test e2e/blog.spec.ts e2e/giftfinder.spec.ts e2e/deals.spec.ts`.
- Resultaat: 2 bekende WebKit-failures in `e2e/blog.spec.ts` (desktop WebKit + iPhone 12 Safari) doordat de **related posts**-sectie niet zichtbaar wordt na automationscroll.
- Impact: Functioneel OK, maar regressiedekking op WebKit ontbreekt voor deze sectie.
- Tijdelijke aanpak: fouten laten staan en runs als "verwacht rood" noteren. Optioneel kan `test.fixme()` worden gezet voor WebKit-varianten.
- Definitieve fix (backlog): DOM-locator toevoegen die zonder scroll kan wachten op `[data-testid="related-posts"]` zodat WebKit geen scrolljitter meer nodig heeft.
