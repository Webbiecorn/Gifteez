# Blog-sync naar Firestore (Double A Premium update)

De vernieuwde blogpost voor **Double A Premium 500 Vel (A4)** staat nu in `data/blogData.ts` en wordt automatisch meegebouwd. Gebruik onderstaande stappen om dezelfde content ook naar de live Firestore-collectie te pushen.

## 1. Controleer of je bent ingelogd in het admin dashboard

1. Ga naar [https://gifteez.nl/admin](https://gifteez.nl/admin) en log in met een geautoriseerd admin-account.
2. Controleer in het tabblad **Instellingen** of je als admin wordt herkend.

## 2. Blogpost bijwerken via het CMS

1. Open het tabblad **Blog Posts**.
2. Klik op **Nieuwe post** (of **Bewerken** als de Firestore-versie al bestaat) en vul de volgende velden in:
   - **Slug**: `double-a-premium-500-vel-a4-cadeau-review`
   - **Titel**: `Double A Premium 500 Vel (A4) Cadeau Review: Papier dat indruk maakt`
   - **Categorie**: `Home & Office`
   - **Excerpt**: kopiër de vernieuwde intro uit de seed-data.
   - **Inhoud**: plak de tekst uit `data/blogData.ts` of gebruik de editor om secties/FAQ aan te maken.
   - **Afbeelding**: `https://coolblue.bynder.com/transform/ef091a22-547f-4ae2-bc91-d7c76ad724c5/102424?io=transform:fit,height:800,width:800&format=png&quality=100`
   - **SEO**: vul de meta-velden in conform de seed-data (meta title, description, keywords, OG-tags).
3. Sla de post op en publiceer.

> Tip: gebruik de optie **Preview** in het CMS of open `https://gifteez.nl/blog/double-a-premium-500-vel-a4-cadeau-review` in een incognitovenster om te checken of de live versie gelijkloopt met de seed-versie.

## 3. Checklist integreren

- De printbare checklist staat op `/downloads/double-a-productivity-checklist.html`. Controleer in de live post of de link correct werkt.
- Wil je een PDF aanbieden? Print de HTML vanuit de browser naar PDF en upload het bestand als bijlage in Firebase Storage of een CDN. Update de link in de blogpost indien nodig.

## 4. Optioneel: automatiseren

Mocht je vaker seed-posts willen publiceren, overweeg een script dat:

1. `blogData.ts` parst en omzet naar het JSON-formaat van het CMS.
2. Via de Firebase Admin SDK posts upsert.

Voor nu is de handmatige route het veiligst; deze gids zorgt ervoor dat de Double A-post één-op-één overeenkomt in Firestore.
