# 🆕 Google Tag Manager Container Aanmaken

## Als je nog GEEN GTM container hebt:

### Stap 1: Maak Account aan
1. Ga naar https://tagmanager.google.com/
2. Klik **Create Account**
3. Vul in:
   - **Account Name:** Gifteez
   - **Country:** Netherlands
   - **Share data:** Aanbevolen (maar optioneel)
4. Klik **Continue**

### Stap 2: Maak Container aan
1. **Container name:** Gifteez.nl
2. **Target platform:** Web
3. Klik **Create**
4. **Accepteer** Terms of Service

### Stap 3: Noteer Container ID
Je krijgt nu een popup met code. Je ziet:
```
<!-- Google Tag Manager -->
Container ID: GTM-XXXXXXX  ← Dit is je nieuwe ID
```

### Stap 4: Update index.html met jouw Container ID

**LET OP:** Je huidige code heeft `GTM-KC68DTEN`, maar als je een nieuwe container aanmaakt, krijg je een ander ID zoals `GTM-ABC1234`.

**Kies één van deze opties:**

**OPTIE 1: Gebruik bestaande container GTM-KC68DTEN** (Aanbevolen)
- Als je al toegang hebt tot deze container
- Dan hoef je niks te wijzigen in de code
- Ga direct naar STAP 2: VARIABLES AANMAKEN

**OPTIE 2: Gebruik nieuwe container**
- Als je een nieuwe container hebt aangemaakt met ID GTM-ABC1234
- Dan moet je index.html updaten:

```html
<!-- WIJZIG DIT in index.html -->

<!-- Van: -->
GTM-KC68DTEN

<!-- Naar: -->
GTM-ABC1234  (jouw nieuwe ID)
```

---

## ✅ Ga verder naar STAP 2 als je container klaar is!

