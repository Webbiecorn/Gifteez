# 📧 Email & Newsletter Status - Gifteez.nl

**Datum:** 19 oktober 2025  
**Status:** ⚠️ Gedeeltelijk geïmplementeerd

---

## ✅ WAT WERKT AL

### 1. Contact Form Backend

**File:** `functions/src/index.ts`
**Endpoint:** `POST /api/contact`
**Status:** ✅ Volledig geïmplementeerd

**Features:**

- Rate limiting (60 req/min per IP)
- Spam protection (honeypot + timing check)
- Email verzenden via Resend API
- Reply-to header correct ingesteld
- HTML email templates
- Error handling

**Vereist:**

```env
RESEND_API_KEY=re_...
CONTACT_FROM=contact@gifteez.nl  (optioneel, default)
CONTACT_TO=info@gifteez.nl       (optioneel, default)
```

### 2. Newsletter Service (Frontend)

**File:** `services/newsletterService.ts`
**Status:** ✅ Volledig geïmplementeerd

**Features:**

- Firestore integratie
- Add/update/remove subscribers
- Unsubscribe functie
- Get subscribers by frequency/category
- Preference management
- Email validation
- Duplicate check

**Firestore Collection:** `newsletter_subscribers`

### 3. Newsletter Component

**File:** `components/NewsletterSignup.tsx`
**Status:** ✅ Bestaat maar wordt niet gebruikt!

**Variants:**

- `inline` - Voor in footer of sidebar
- `modal` - Voor popup/dedicated page

**Features:**

- Email + naam velden
- Frequency selection (immediate/daily/weekly)
- Category preferences
- Success/error messages
- Loading states

### 4. Email Notification Service

**File:** `services/emailNotificationService.ts`
**Status:** ✅ Geïmplementeerd (maar geen backend)

---

## ❌ WAT ONTBREEKT

### 1. Newsletter API Endpoint

**Probleem:** Frontend NewsletterService schrijft direct naar Firestore, maar:

- ❌ Geen email bevestiging verzonden
- ❌ Geen welcome email
- ❌ Geen double opt-in
- ❌ Geen email validatie backend-side
- ❌ Geen rate limiting

**Nodig:**

```typescript
POST /api/newsletter/subscribe
{
  email: string,
  name?: string,
  preferences?: {...}
}

POST /api/newsletter/unsubscribe
{
  email: string
}

GET /api/newsletter/confirm/:token
```

### 2. Email Templates

**Ontbreekt:**

- Welcome email voor nieuwe subscribers
- Blog notification emails
- Deal alerts
- Contact form confirmation (naar verzender)

### 3. Newsletter in Footer

**Probleem:** Footer heeft wel social links, maar geen newsletter signup!

---

## 🔧 WAT TE FIXEN

### PRIORITY 1: Newsletter in Footer Plaatsen (5 min)

**File:** `components/Footer.tsx`

Voeg toe in footer grid:

```tsx
{
  /* Newsletter Signup */
}
;<div>
  <NewsletterSignup
    showToast={showToast}
    variant="inline"
    title="Blijf op de hoogte"
    description="Ontvang de beste cadeau-tips & deals!"
  />
</div>
```

### PRIORITY 2: Newsletter API Endpoint (30 min)

**File:** `functions/src/index.ts`

Toevoegen:

```typescript
// POST /api/newsletter/subscribe
app.post('/api/newsletter/subscribe', async (req: Request, res: Response) => {
  try {
    const { email, name, preferences } = req.body

    // Validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Invalid email' })
    }

    // Check if already subscribed
    const existing = await NewsletterService.getSubscriberByEmail(email)
    if (existing && existing.isActive) {
      return res.status(400).json({ error: 'Already subscribed' })
    }

    // Add to Firestore
    await NewsletterService.addSubscriber({
      email,
      name,
      isActive: true,
      subscribedAt: new Date().toISOString(),
      preferences: preferences || {
        frequency: 'weekly',
        categories: ['all'],
        deals: true,
        newPosts: true,
      },
    })

    // Send welcome email via Resend
    if (resend) {
      await resend.emails.send({
        from: 'Gifteez <newsletter@gifteez.nl>',
        to: [email],
        subject: '🎁 Welkom bij Gifteez!',
        html: getWelcomeEmailTemplate(name || 'daar'),
      })
    }

    res.json({ ok: true })
  } catch (e: any) {
    console.error('newsletter_error', e)
    res.status(500).json({ error: 'Server error' })
  }
})
```

### PRIORITY 3: Welcome Email Template (10 min)

**File:** `functions/src/templates/welcomeEmail.ts`

```typescript
export function getWelcomeEmailTemplate(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #e11d48 0%, #f97316 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px;">🎁 Welkom ${name}!</h1>
      </div>
      
      <div style="background: #ffffff; padding: 40px 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-bottom: 20px;">
          Bedankt voor je inschrijving op onze nieuwsbrief!
        </p>
        
        <p>Je ontvangt vanaf nu:</p>
        <ul style="line-height: 2;">
          <li>✨ De beste cadeau-ideeën & inspiratie</li>
          <li>🔥 Exclusieve deals & kortingen</li>
          <li>📚 Nieuwe cadeaugidsen & blogs</li>
          <li>💡 Persoonlijke tips van ons team</li>
        </ul>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            <strong>💡 Tip:</strong> Gebruik onze AI GiftFinder om binnen 30 seconden het perfecte cadeau te vinden!
          </p>
          <a href="https://gifteez.nl/giftfinder" style="display: inline-block; margin-top: 10px; background: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            🎁 Probeer GiftFinder
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
          Geen zin meer in onze emails? <a href="https://gifteez.nl/newsletter/unsubscribe?email=${email}" style="color: #e11d48;">Uitschrijven</a>
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Gifteez.nl - Cadeaus geven zonder stress</p>
      </div>
    </body>
    </html>
  `
}
```

---

## 🚀 QUICK IMPLEMENTATION PLAN

### Fase 1: Frontend (5 min)

1. ✅ Newsletter component toevoegen aan Footer
2. ✅ Testen of inschrijving werkt (schrijft naar Firestore)

### Fase 2: Backend API (30 min)

1. ❌ Newsletter subscribe endpoint toevoegen
2. ❌ Newsletter unsubscribe endpoint toevoegen
3. ❌ Welcome email template maken
4. ❌ Email verzenden via Resend

### Fase 3: Email Setup (15 min)

1. ❌ Resend account aanmaken (gratis tot 3000 emails/maand)
2. ❌ Domain verifiëren (gifteez.nl)
3. ❌ DKIM/SPF records instellen
4. ❌ API key toevoegen aan Firebase Functions env

### Fase 4: Testing (10 min)

1. ❌ Test inschrijving vanaf website
2. ❌ Check of welcome email aankomt
3. ❌ Test uitschrijven
4. ❌ Verifieer Firestore data

---

## 📊 RESEND SETUP

### Stap 1: Account Aanmaken

1. Ga naar https://resend.com/
2. Sign up (gratis tot 3000 emails/maand, 100/dag)
3. Verifieer email

### Stap 2: Domain Toevoegen

1. Dashboard → Domains → Add Domain
2. Voer in: `gifteez.nl`
3. Kopieer DNS records

### Stap 3: DNS Records (bij jouw domain provider)

```
Type: TXT
Name: _resend
Value: [krijg je van Resend]

Type: CNAME
Name: resend._domainkey
Value: [krijg je van Resend]

Type: TXT
Name: @
Value: "v=spf1 include:_spf.resend.com ~all"
```

### Stap 4: API Key

1. Dashboard → API Keys → Create API Key
2. Name: `Gifteez Production`
3. Permission: `Sending access`
4. Kopieer key: `re_...`

### Stap 5: Add to Firebase

```bash
cd functions
firebase functions:config:set resend.api_key="re_..."
firebase deploy --only functions
```

**Of via .env file:**

```env
RESEND_API_KEY=re_...
```

---

## ✅ CHECKLIST

**Frontend:**

- [ ] Newsletter component in Footer
- [ ] Test inschrijven (schrijft naar Firestore)
- [ ] Error handling + loading states
- [ ] Toast notifications

**Backend:**

- [ ] Newsletter subscribe endpoint
- [ ] Newsletter unsubscribe endpoint
- [ ] Welcome email template
- [ ] Contact form confirmation email (optioneel)
- [ ] Rate limiting voor newsletter endpoints
- [ ] Email validation

**Email Setup:**

- [ ] Resend account aangemaakt
- [ ] Domain geverifieerd
- [ ] DNS records ingesteld
- [ ] API key toegevoegd aan Functions
- [ ] Test emails verzonden

**Testing:**

- [ ] Inschrijven werkt
- [ ] Welcome email komt aan
- [ ] Uitschrijven werkt
- [ ] Firestore data correct
- [ ] Spam protection werkt
- [ ] Mobile responsive

---

## 🆘 HUIDIGE STATUS

**Wat werkt:**
✅ Contact form backend (met Resend)
✅ Newsletter Firestore service
✅ Newsletter component (bestaat)

**Wat ontbreekt:**
❌ Newsletter in footer UI
❌ Newsletter API endpoints
❌ Welcome emails
❌ Email templates

**Geschatte tijd om te fixen:**

- Frontend (newsletter in footer): **5 minuten**
- Backend API + templates: **30 minuten**
- Resend setup: **15 minuten**
- Testing: **10 minuten**
  **Total: ~60 minuten**

---

## 🎯 VOLGENDE STAP

**Optie 1: Quick Win (5 min)**
→ Newsletter component toevoegen aan Footer
→ Test of Firestore schrijven werkt
→ Emails later

**Optie 2: Complete Setup (60 min)**
→ Alles in één keer: frontend + backend + emails
→ Volledig werkend systeem

**Wat wil je?** 🚀
