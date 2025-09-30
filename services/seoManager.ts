interface SEOData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  structuredData?: any;
}

interface SEOAnalysis {
  score: number;
  issues: string[];
  suggestions: string[];
  warnings: string[];
}

class SEOManager {
  private static instance: SEOManager;
  
  public static getInstance(): SEOManager {
    if (!SEOManager.instance) {
      SEOManager.instance = new SEOManager();
    }
    return SEOManager.instance;
  }

  // Generate SEO data from blog post content
  generateSEOData(title: string, content: string, excerpt: string, imageUrl?: string, slug?: string): SEOData {
    const cleanContent = this.stripHtml(content);
    const keywords = this.extractKeywords(cleanContent);
    const description = excerpt || this.generateDescription(cleanContent);
    
    const baseUrl = 'https://gifteez-7533b.web.app';
    const canonicalUrl = slug ? `${baseUrl}/blog/${slug}` : undefined;
    
    return {
      metaTitle: this.optimizeTitle(title),
      metaDescription: this.optimizeDescription(description),
      keywords: keywords.slice(0, 10), // Top 10 keywords
      ogTitle: title,
      ogDescription: description,
      ogImage: imageUrl || `${baseUrl}/og-default.jpg`,
      ogType: 'article',
      twitterCard: 'summary_large_image',
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: imageUrl || `${baseUrl}/og-default.jpg`,
      canonicalUrl,
      structuredData: this.generateStructuredData(title, description, imageUrl, canonicalUrl)
    };
  }

  // Analyze SEO quality
  analyzeSEO(seoData: SEOData, content: string): SEOAnalysis {
    const issues: string[] = [];
    const suggestions: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Title analysis
    if (!seoData.metaTitle) {
      issues.push('Geen meta titel ingesteld');
      score -= 20;
    } else {
      if (seoData.metaTitle.length < 30) {
        suggestions.push('Meta titel kan langer (30-60 karakters optimaal)');
        score -= 5;
      }
      if (seoData.metaTitle.length > 60) {
        warnings.push('Meta titel te lang (kan worden afgekort in zoekresultaten)');
        score -= 10;
      }
    }

    // Description analysis
    if (!seoData.metaDescription) {
      issues.push('Geen meta beschrijving ingesteld');
      score -= 15;
    } else {
      if (seoData.metaDescription.length < 120) {
        suggestions.push('Meta beschrijving kan langer (120-160 karakters optimaal)');
        score -= 5;
      }
      if (seoData.metaDescription.length > 160) {
        warnings.push('Meta beschrijving te lang (kan worden afgekort)');
        score -= 10;
      }
    }

    // Keywords analysis
    if (!seoData.keywords || seoData.keywords.length === 0) {
      suggestions.push('Voeg relevante keywords toe');
      score -= 5;
    }

    // Image analysis
    if (!seoData.ogImage) {
      suggestions.push('Voeg een hoofdafbeelding toe voor betere social media weergave');
      score -= 5;
    }

    // Content analysis
    const wordCount = this.stripHtml(content).split(/\s+/).length;
    if (wordCount < 300) {
      suggestions.push('Content kan uitgebreider (300+ woorden aanbevolen)');
      score -= 5;
    }

    return {
      score: Math.max(0, score),
      issues,
      suggestions,
      warnings
    };
  }

  // Generate structured data for blog posts
  private generateStructuredData(title: string, description: string, imageUrl?: string, url?: string) {
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": title,
      "description": description,
      "image": imageUrl ? [imageUrl] : undefined,
      "url": url,
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "author": {
        "@type": "Organization",
        "name": "Gifteez",
        "url": "https://gifteez-7533b.web.app"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Gifteez",
        "logo": {
          "@type": "ImageObject",
          "url": "https://gifteez-7533b.web.app/logo.png"
        }
      }
    };
  }

  // Helper methods
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  private extractKeywords(text: string): string[] {
    const commonWords = ['de', 'het', 'een', 'en', 'van', 'te', 'dat', 'die', 'in', 'voor', 'op', 'met', 'als', 'is', 'was', 'zijn', 'heeft', 'had', 'maar', 'om', 'hij', 'zij', 'ze', 'haar', 'hem', 'ook', 'aan', 'bij', 'uit', 'over', 'door', 'naar', 'tot', 'tegen', 'onder', 'tussen'];
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !commonWords.includes(word));

    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .map(([word]) => word);
  }

  private optimizeTitle(title: string): string {
    if (title.length <= 60) return title;
    return title.substring(0, 57) + '...';
  }

  private optimizeDescription(description: string): string {
    if (description.length <= 160) return description;
    return description.substring(0, 157) + '...';
  }

  private generateDescription(content: string): string {
    const text = this.stripHtml(content);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let description = sentences[0] || '';
    let currentLength = description.length;
    
    for (let i = 1; i < sentences.length && currentLength < 120; i++) {
      const nextSentence = sentences[i].trim();
      if (currentLength + nextSentence.length + 2 <= 160) {
        description += '. ' + nextSentence;
        currentLength = description.length;
      } else {
        break;
      }
    }
    
    return description.trim();
  }

  // Generate meta tags HTML
  generateMetaTags(seoData: SEOData): string {
    const tags = [
      `<title>${seoData.metaTitle}</title>`,
      `<meta name="description" content="${seoData.metaDescription}" />`,
      `<meta name="keywords" content="${seoData.keywords.join(', ')}" />`,
    ];

    if (seoData.canonicalUrl) {
      tags.push(`<link rel="canonical" href="${seoData.canonicalUrl}" />`);
    }

    // Open Graph tags
    if (seoData.ogTitle) {
      tags.push(`<meta property="og:title" content="${seoData.ogTitle}" />`);
    }
    if (seoData.ogDescription) {
      tags.push(`<meta property="og:description" content="${seoData.ogDescription}" />`);
    }
    if (seoData.ogImage) {
      tags.push(`<meta property="og:image" content="${seoData.ogImage}" />`);
    }
    if (seoData.ogType) {
      tags.push(`<meta property="og:type" content="${seoData.ogType}" />`);
    }

    // Twitter tags
    if (seoData.twitterCard) {
      tags.push(`<meta name="twitter:card" content="${seoData.twitterCard}" />`);
    }
    if (seoData.twitterTitle) {
      tags.push(`<meta name="twitter:title" content="${seoData.twitterTitle}" />`);
    }
    if (seoData.twitterDescription) {
      tags.push(`<meta name="twitter:description" content="${seoData.twitterDescription}" />`);
    }
    if (seoData.twitterImage) {
      tags.push(`<meta name="twitter:image" content="${seoData.twitterImage}" />`);
    }

    // Structured data
    if (seoData.structuredData) {
      tags.push(`<script type="application/ld+json">${JSON.stringify(seoData.structuredData, null, 2)}</script>`);
    }

    return tags.join('\n');
  }
}

export default SEOManager;
export type { SEOData, SEOAnalysis };
