// Email functions voor Newsletter & Contact
import * as functions from 'firebase-functions/v1';
import { Resend } from 'resend';
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
// Welcome email template
function getWelcomeEmailHtml(name) {
    const displayName = name || 'daar';
    return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welkom bij Gifteez</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #ec4899 0%, #ef4444 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: white; font-size: 32px; font-weight: bold;">🎁 Gifteez</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">AI-powered gift discovery</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: 600;">
                Welkom ${displayName}! 👋
              </h2>
              
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
                Bedankt voor je inschrijving op onze nieuwsbrief! Je bent nu één van de eerste die:
              </p>
              
              <ul style="margin: 0 0 24px; padding-left: 20px; color: #374151; font-size: 16px; line-height: 1.8;">
                <li>De <strong>beste cadeau-deals</strong> ontvangt</li>
                <li>Exclusieve <strong>AI cadeau-tips</strong> krijgt</li>
                <li><strong>Nieuwe blog posts</strong> als eerste leest</li>
                <li>Seizoensinspiratie voor elk moment ontdekt</li>
              </ul>
              
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #ec4899 0%, #ef4444 100%); padding: 0;">
                    <a href="https://gifteez.nl/giftfinder" style="display: block; padding: 16px 32px; color: white; text-decoration: none; font-weight: 600; font-size: 16px; text-align: center;">
                      🎯 Probeer onze GiftFinder
                    </a>
                  </td>
                </tr>
              </table>
              
              <div style="margin: 30px 0; padding: 20px; background: #f3f4f6; border-radius: 8px; border-left: 4px solid #ec4899;">
                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                  <strong>💡 Pro-tip:</strong> Gebruik onze AI GiftFinder om in 30 seconden het perfecte cadeau te vinden. Geen meer urenlang zoeken!
                </p>
              </div>
              
              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Groetjes,<br>
                <strong style="color: #374151;">Het Gifteez Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background: #f9fafb; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0 0 12px; color: #6b7280; font-size: 12px;">
                Je ontvangt deze email omdat je je hebt ingeschreven op Gifteez.nl
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                <a href="https://gifteez.nl/unsubscribe" style="color: #9ca3af; text-decoration: underline;">Afmelden</a> | 
                <a href="https://gifteez.nl/privacy" style="color: #9ca3af; text-decoration: underline;">Privacybeleid</a>
              </p>
              <p style="margin: 12px 0 0; color: #9ca3af; font-size: 11px;">
                © ${new Date().getFullYear()} Gifteez.nl - Slimme cadeau-inspiratie
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
// Plain text version
function getWelcomeEmailText(name) {
    const displayName = name || 'daar';
    return `
Welkom ${displayName}! 👋

Bedankt voor je inschrijving op onze nieuwsbrief!

Je bent nu één van de eerste die:
• De beste cadeau-deals ontvangt
• Exclusieve AI cadeau-tips krijgt  
• Nieuwe blog posts als eerste leest
• Seizoensinspiratie voor elk moment ontdekt

Probeer onze GiftFinder: https://gifteez.nl/giftfinder

💡 Pro-tip: Gebruik onze AI GiftFinder om in 30 seconden het perfecte cadeau te vinden.

Groetjes,
Het Gifteez Team

---
Je ontvangt deze email omdat je je hebt ingeschreven op Gifteez.nl
Afmelden: https://gifteez.nl/unsubscribe
Privacybeleid: https://gifteez.nl/privacy

© ${new Date().getFullYear()} Gifteez.nl - Slimme cadeau-inspiratie
  `.trim();
}
// Firebase Function: Send welcome email when new subscriber is added
export const onNewsletterSubscribe = functions
    .region('europe-west1')
    .firestore.document('newsletter_subscribers/{subscriberId}')
    .onCreate(async (snap, _context) => {
    const subscriber = snap.data();
    const email = subscriber.email;
    const name = subscriber.name;
    if (!email) {
        console.error('No email found in subscriber document');
        return;
    }
    try {
        // Get API key from Firebase Functions config
        const apiKey = functions.config().resend?.api_key;
        if (!apiKey) {
            console.error('RESEND_API_KEY not configured in functions.config()');
            return;
        }
        console.log('Using API key from functions.config()');
        const resendClient = new Resend(apiKey);
        // TEMPORARY: Use Resend's test domain to verify API works
        const result = await resendClient.emails.send({
            from: 'Gifteez <onboarding@resend.dev>',
            to: email,
            subject: 'Welkom bij Gifteez! 🎁',
            html: getWelcomeEmailHtml(name),
            text: getWelcomeEmailText(name),
        });
        console.log(`Welcome email sent to ${email}, Resend ID: ${result.data?.id}`);
    }
    catch (error) {
        console.error('Error sending welcome email:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message, error.stack);
        }
        // Don't throw - we don't want to fail the document creation
    }
});
// Callable Function: Send newsletter campaign
export const sendNewsletterCampaign = functions
    .region('europe-west1')
    .https.onCall(async (data, context) => {
    // Only allow admins to send campaigns
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }
    const email = context.auth.token.email;
    const isAdmin = email && /^(admin|kevin|beheer)@gifteez\.nl$/i.test(email);
    if (!isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can send newsletters');
    }
    if (!resend) {
        throw new functions.https.HttpsError('failed-precondition', 'Email service not configured');
    }
    const { subject, htmlContent, textContent, testEmail } = data;
    if (!subject || !htmlContent) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }
    try {
        // If testEmail is provided, send only to that address
        if (testEmail) {
            const fromAddress = process.env.NEWSLETTER_FROM || 'noreply@gifteez.nl';
            await resend.emails.send({
                from: `Gifteez <${fromAddress}>`,
                to: testEmail,
                subject: `[TEST] ${subject}`,
                html: htmlContent,
                text: textContent || '',
            });
            return { success: true, sent: 1, test: true };
        }
        // TODO: In production, fetch all active subscribers and send in batches
        // For now, return success
        return { success: true, message: 'Campaign endpoint ready - implement batch sending' };
    }
    catch (error) {
        console.error('Error sending campaign:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to send campaign');
    }
});
// GiftFinder Results Email Template
function getGiftFinderEmailHtml(data) {
    const { name, recipient, occasion, budget, gifts } = data;
    const giftCards = gifts
        .map((gift) => `
    <tr>
      <td style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
        <table role="presentation" style="width: 100%;">
          <tr>
            <td style="width: 120px; vertical-align: top;">
              <img src="${gift.imageUrl}" alt="${gift.title}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
            </td>
            <td style="padding-left: 20px; vertical-align: top;">
              <h3 style="margin: 0 0 8px; color: #111827; font-size: 18px; font-weight: 600;">
                ${gift.title}
              </h3>
              ${gift.description ? `<p style="margin: 0 0 12px; color: #6b7280; font-size: 14px; line-height: 1.5;">${gift.description}</p>` : ''}
              <p style="margin: 0 0 12px; color: #ec4899; font-size: 20px; font-weight: bold;">
                ${gift.price}
              </p>
              <a href="${gift.link}" style="display: inline-block; padding: 10px 20px; background: linear-gradient(135deg, #ec4899 0%, #ef4444 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                Bekijk cadeau →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `)
        .join('');
    return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jouw Cadeau Suggesties</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 650px; width: 100%; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #ec4899 0%, #ef4444 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: white; font-size: 32px; font-weight: bold;">🎁 Gifteez</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Jouw persoonlijke cadeau-suggesties</p>
            </td>
          </tr>
          
          <!-- Intro -->
          <tr>
            <td style="padding: 40px 40px 20px;">
              <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 600;">
                Hoi ${name}! 👋
              </h2>
              <p style="margin: 0 0 12px; color: #374151; font-size: 16px; line-height: 1.6;">
                Speciaal voor jou hebben we de perfecte cadeaus gevonden voor <strong>${recipient}</strong> ter gelegenheid van <strong>${occasion}</strong>.
              </p>
              <p style="margin: 0 0 24px; color: #6b7280; font-size: 14px;">
                Budget: <strong>${budget}</strong>
              </p>
            </td>
          </tr>
          
          <!-- Gift Cards -->
          ${giftCards}
          
          <!-- Footer -->
          <tr>
            <td style="padding: 40px; text-align: center; background: #f9fafb; border-radius: 0 0 16px 16px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; font-weight: 600;">
                Wil je meer cadeau-inspiratie?
              </p>
              <a href="https://gifteez.nl/giftfinder" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #ec4899 0%, #ef4444 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-bottom: 20px;">
                Probeer GiftFinder opnieuw
              </a>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                <a href="https://gifteez.nl" style="color: #9ca3af; text-decoration: underline;">Gifteez.nl</a> - 
                AI-powered gift discovery
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
// Contact Form Confirmation Email
function getContactConfirmationHtml(name, message) {
    return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bevestiging Contactbericht</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: 600;">
                Bedankt voor je bericht! ✅
              </h2>
              
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
                Beste ${name},
              </p>
              
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                We hebben je bericht ontvangen en nemen <strong>binnen 24 uur</strong> contact met je op.
              </p>
              
              <div style="padding: 20px; background: #f3f4f6; border-radius: 8px; border-left: 4px solid #ec4899;">
                <p style="margin: 0 0 8px; color: #111827; font-size: 14px; font-weight: 600;">
                  Jouw bericht:
                </p>
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  ${message}
                </p>
              </div>
              
              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Groetjes,<br>
                <strong style="color: #374151;">Het Gifteez Team</strong>
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 30px 40px; background: #f9fafb; border-radius: 0 0 16px 16px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Gifteez.nl - Slimme cadeau-inspiratie
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
// Callable Function: Send GiftFinder Results
export const sendGiftFinderResults = functions
    .region('europe-west1')
    .https.onCall(async (data, _context) => {
    if (!resend) {
        throw new functions.https.HttpsError('failed-precondition', 'Email service not configured');
    }
    const { email, name, recipient, occasion, budget, gifts, subscribeNewsletter } = data;
    if (!email || !name || !gifts || !Array.isArray(gifts)) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }
    try {
        const fromAddress = process.env.GIFTFINDER_FROM || 'giftfinder@gifteez.nl';
        await resend.emails.send({
            from: `Gifteez GiftFinder <${fromAddress}>`,
            to: email,
            subject: `🎁 Jouw persoonlijke cadeau-suggesties voor ${recipient || 'je ontvanger'}`,
            html: getGiftFinderEmailHtml({ name, recipient, occasion, budget, gifts }),
        });
        // If user opted in for newsletter, add them
        if (subscribeNewsletter) {
            // The newsletter subscriber will be created separately in the frontend
            // and trigger the welcome email via onNewsletterSubscribe
        }
        return { success: true };
    }
    catch (error) {
        console.error('Error sending gift finder results:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to send email');
    }
});
// Firestore Trigger: Contact Form Submission
export const onContactFormSubmit = functions
    .region('europe-west1')
    .firestore.document('contact_messages/{messageId}')
    .onCreate(async (snap, _context) => {
    if (!resend) {
        console.warn('Resend not configured, skipping contact emails');
        return;
    }
    const message = snap.data();
    const { name, email, subject, message: messageText } = message;
    if (!email || !name) {
        console.error('Missing required fields in contact message');
        return;
    }
    try {
        const fromAddress = process.env.CONTACT_FROM || 'contact@gifteez.nl';
        const adminEmail = process.env.ADMIN_EMAIL || 'kevin@gifteez.nl';
        // Send confirmation to user
        await resend.emails.send({
            from: `Gifteez Support <${fromAddress}>`,
            to: email,
            subject: 'We hebben je bericht ontvangen',
            html: getContactConfirmationHtml(name, messageText),
        });
        // Send notification to admin
        await resend.emails.send({
            from: `Gifteez Notifications <${fromAddress}>`,
            to: adminEmail,
            subject: `📬 Nieuw contactbericht van ${name}`,
            html: `
          <h2>Nieuw contactbericht</h2>
          <p><strong>Van:</strong> ${name} (${email})</p>
          ${subject ? `<p><strong>Onderwerp:</strong> ${subject}</p>` : ''}
          <p><strong>Bericht:</strong></p>
          <p style="white-space: pre-wrap;">${messageText}</p>
          <hr>
          <p><a href="https://gifteez.nl/admin">Bekijk in admin panel</a></p>
        `,
        });
        console.log(`Contact form emails sent for ${email}`);
    }
    catch (error) {
        console.error('Error sending contact form emails:', error);
        // Don't throw - we don't want to fail the document creation
    }
});
