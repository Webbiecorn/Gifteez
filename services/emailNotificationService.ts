import { User } from '../types'
import type { BlogPost } from '../types'

export interface EmailTemplate {
  subject: string
  htmlContent: string
  textContent: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  name?: string
  subscribedAt: string
  preferences: {
    frequency: 'immediate' | 'daily' | 'weekly'
    categories: string[]
  }
  isActive: boolean
}

export class EmailNotificationService {
  private static apiEndpoint = 'https://api.emailjs.com/api/v1.0/email/send'
  private static serviceId = 'service_gifteez' // Replace with actual EmailJS service ID
  private static templateId = 'template_blog_notification' // Replace with actual template ID
  private static publicKey = 'YOUR_EMAILJS_PUBLIC_KEY' // Replace with actual key

  static async sendNewBlogPostNotification(
    post: BlogPost,
    subscribers: NewsletterSubscriber[]
  ): Promise<void> {
    const template = this.createBlogPostTemplate(post)

    // Filter active subscribers who want blog notifications
    const activeSubscribers = subscribers.filter(
      (sub) =>
        sub.isActive &&
        (sub.preferences.categories.length === 0 ||
          sub.preferences.categories.includes(post.category))
    )

    // Send emails in batches to avoid rate limiting
    const batchSize = 10
    for (let i = 0; i < activeSubscribers.length; i += batchSize) {
      const batch = activeSubscribers.slice(i, i + batchSize)
      await Promise.all(batch.map((subscriber) => this.sendEmail(subscriber, template)))

      // Small delay between batches
      if (i + batchSize < activeSubscribers.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
  }

  static createBlogPostTemplate(post: BlogPost): EmailTemplate {
    const subject = `Nieuwe blog: ${post.title} - Gifteez`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
          .content { padding: 30px; }
          .blog-card { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
          .blog-image { width: 100%; height: 200px; object-fit: cover; }
          .blog-content { padding: 20px; }
          .blog-title { font-size: 22px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
          .blog-excerpt { color: #6b7280; line-height: 1.6; margin-bottom: 15px; }
          .blog-meta { font-size: 14px; color: #9ca3af; margin-bottom: 20px; }
          .cta-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%); 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: bold;
            text-align: center;
          }
          .footer { background-color: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          .unsubscribe { color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎁 Gifteez</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Nieuwe blog post voor jou!</p>
          </div>
          
          <div class="content">
            <div class="blog-card">
              <img src="${post.imageUrl}" alt="${post.title}" class="blog-image">
              <div class="blog-content">
                <h2 class="blog-title">${post.title}</h2>
                <div class="blog-meta">
                  📅 ${new Date(post.publishedDate).toLocaleDateString('nl-NL')} • 
                  👤 ${post.author.name} • 
                  🏷️ ${post.category}
                </div>
                <p class="blog-excerpt">${post.excerpt}</p>
                <a href="https://gifteez.nl/blog/${post.slug}" class="cta-button">Lees Volledig Artikel</a>
              </div>
            </div>
            
            <p>Hallo!</p>
            <p>We hebben een nieuwe blog post gepubliceerd die perfect bij jouw interesses past. Bekijk het laatste artikel van ons team en ontdek nieuwe cadeau-ideeën!</p>
            
            <p>Veel leesplezier!<br>Het Gifteez Team</p>
          </div>
          
          <div class="footer">
            <p>Je ontvangt deze email omdat je geabonneerd bent op Gifteez updates.</p>
            <p class="unsubscribe">
              <a href="https://gifteez.nl/unsubscribe?email={{EMAIL}}" style="color: #9ca3af;">Uitschrijven</a> • 
              <a href="https://gifteez.nl/preferences?email={{EMAIL}}" style="color: #9ca3af;">Voorkeuren aanpassen</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
Nieuwe blog: ${post.title}

${post.excerpt}

Geschreven door: ${post.author.name}
Categorie: ${post.category}
Datum: ${new Date(post.publishedDate).toLocaleDateString('nl-NL')}

Lees het volledige artikel: https://gifteez.nl/blog/${post.slug}

---
Gifteez - De perfecte cadeaus vinden
Uitschrijven: https://gifteez.nl/unsubscribe?email={{EMAIL}}
    `

    return { subject, htmlContent, textContent }
  }

  static async sendEmailToSubscriber(
    subscriber: NewsletterSubscriber,
    template: EmailTemplate
  ): Promise<boolean> {
    return this.sendEmail(subscriber, template)
  }

  private static async sendEmail(
    subscriber: NewsletterSubscriber,
    template: EmailTemplate
  ): Promise<boolean> {
    try {
      // Replace placeholder with actual email
      const personalizedHtml = template.htmlContent.replace(/{{EMAIL}}/g, subscriber.email)
      const personalizedText = template.textContent.replace(/{{EMAIL}}/g, subscriber.email)

      const emailData = {
        service_id: this.serviceId,
        template_id: this.templateId,
        user_id: this.publicKey,
        template_params: {
          to_email: subscriber.email,
          to_name: subscriber.name || 'Gifteez lezer',
          subject: template.subject,
          html_content: personalizedHtml,
          text_content: personalizedText,
        },
      }

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      })

      return response.ok
    } catch (error) {
      console.error('Error sending email to:', subscriber.email, error)
      return false
    }
  }

  static async sendWelcomeEmail(subscriber: NewsletterSubscriber): Promise<boolean> {
    const template: EmailTemplate = {
      subject: 'Welkom bij Gifteez! 🎁',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%); padding: 30px; text-align: center; color: white; }
            .content { padding: 30px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎁 Welkom bij Gifteez!</h1>
            </div>
            <div class="content">
              <p>Hallo ${subscriber.name || 'daar'}!</p>
              <p>Bedankt voor je aanmelding bij Gifteez! We zijn blij dat je erbij bent.</p>
              <p>Je ontvangt nu de nieuwste cadeau-tips, blog posts en speciale aanbiedingen direct in je inbox.</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="https://gifteez.nl" class="cta-button">Ontdek Gifteez</a>
              </p>
              <p>Tot snel!<br>Het Gifteez Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `
Welkom bij Gifteez!

Hallo ${subscriber.name || 'daar'}!

Bedankt voor je aanmelding bij Gifteez! Je ontvangt nu de nieuwste cadeau-tips en blog posts in je inbox.

Bezoek ons: https://gifteez.nl

Het Gifteez Team
      `,
    }

    return this.sendEmail(subscriber, template)
  }

  static async subscribeToNewsletter(
    email: string,
    name?: string,
    preferences?: Partial<NewsletterSubscriber['preferences']>
  ): Promise<NewsletterSubscriber> {
    const subscriber: NewsletterSubscriber = {
      id: Date.now().toString(),
      email,
      name,
      subscribedAt: new Date().toISOString(),
      preferences: {
        frequency: 'weekly',
        categories: [],
        ...preferences,
      },
      isActive: true,
    }

    // Send welcome email
    await this.sendWelcomeEmail(subscriber)

    return subscriber
  }

  static async unsubscribe(email: string): Promise<boolean> {
    // This would update the subscriber's isActive status to false
    // In a real implementation, this would update the database
    console.log(`Unsubscribing ${email} from newsletter`)
    return true
  }

  static createWeeklyDigest(posts: BlogPost[]): EmailTemplate {
    const subject = 'Je wekelijkse cadeau-inspiratie van Gifteez 🎁'

    const postsHtml = posts
      .map(
        (post) => `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
        <img src="${post.imageUrl}" alt="${post.title}" style="width: 100%; height: 150px; object-fit: cover;">
        <div style="padding: 15px;">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">${post.title}</h3>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">${post.excerpt}</p>
          <a href="https://gifteez.nl/blog/${post.slug}" style="color: #e11d48; text-decoration: none; font-weight: bold;">Lees meer →</a>
        </div>
      </div>
    `
      )
      .join('')

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%); padding: 30px; text-align: center; color: white; }
          .content { padding: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎁 Je Wekelijkse Gifteez Update</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">De beste cadeau-ideeën van deze week</p>
          </div>
          <div class="content">
            <p>Hallo!</p>
            <p>Hier zijn de nieuwste blog posts van deze week om je te inspireren:</p>
            ${postsHtml}
            <p>Veel leesplezier!<br>Het Gifteez Team</p>
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
Je wekelijkse Gifteez update

Nieuwe blog posts deze week:

${posts
  .map(
    (post) => `
${post.title}
${post.excerpt}
Lees meer: https://gifteez.nl/blog/${post.slug}
---
`
  )
  .join('\n')}

Het Gifteez Team
    `

    return { subject, htmlContent, textContent }
  }
}

export default EmailNotificationService
