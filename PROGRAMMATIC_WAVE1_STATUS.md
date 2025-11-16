# Wave-1 Programmatic Guides — Status (15 nov 2025)

Wave-1 bundelt de seizoensgidsen die we deze week willen live trekken. Elke gids wordt gevoed via `npm run build-programmatic-indices` met dezelfde Coolblue feed.

| Slug                                       | Titel                                                  | JSON-output                                                         | Producten (na diversifying) | QA-notities                                                                             |
| ------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------- |
| `kerst-voor-hem-onder-50`                  | Kerstcadeaus voor hem onder €50                        | `public/programmatic/kerst-voor-hem-onder-50.json`                  | 7                           | Slechts 7 snelle gadgets. Heeft extra feed of manuele picks nodig voor 10+ tips.        |
| `kerst-voor-haar-onder-50`                 | Beste kerstcadeaus voor haar onder €100 (2025)         | `public/programmatic/kerst-voor-haar-onder-50.json`                 | 24                          | Mix van beauty + cozy tech. Controleer dat copy nog steeds "onder €50" uitstraalt.      |
| `sinterklaas-voor-kinderen-onder-25`       | Sinterklaas cadeaus voor kinderen: 25 ideeën onder €25 | `public/programmatic/sinterklaas-voor-kinderen-onder-25.json`       | 10                          | Gaming-accessoires heavy. Zie aparte QA-notities hieronder.                             |
| `kerst-voor-collegas-onder-25`             | Kerstcadeaus voor collega’s onder €25                  | `public/programmatic/kerst-voor-collegas-onder-25.json`             | 20                          | Goede mix van bureauspullen. Check of er nog lampen/kaarsen tussen glippen.             |
| `kerst-tech-onder-100`                     | Tech cadeaus onder €100 voor kerst                     | `public/programmatic/kerst-tech-onder-100.json`                     | 16                          | Prima spreiding maar kan nog 8 extra items gebruiken.                                   |
| `kerst-duurzaam-onder-50`                  | Duurzame kerstcadeaus onder €50                        | `public/programmatic/kerst-duurzaam-onder-50.json`                  | 24                          | Nu gevuld met Coolblue-cadeaus; labels "duurzaam" controleren tot AWIN-feed live staat. |
| `last-minute-kerstcadeaus-vandaag-bezorgd` | Last-minute kerstcadeaus (morgen in huis)              | `public/programmatic/last-minute-kerstcadeaus-vandaag-bezorgd.json` | 20                          | Alleen Coolblue; levering ≤2 dagen klopt volgens feed.                                  |

**Volgende stappen**

- Aanvullende feed (Shop Like You Give A Damn / Bol) aansluiten om duurzame en vrouwenpagina’s realistischer te maken.
- Voor hem onder €50 aanvullen met curated editor picks of fallback-cadeaubonnen.
- Wave-1 routing en hero copy testen in `ProgrammaticLandingPage` (nu geüpdatet met sorting/filter + internal links).
