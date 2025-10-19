// Coolblue Affiliate Service via Awin
// Coolblue werkt via het Awin affiliate netwerk

export interface AwinCoolblueConfig {
  publisherId: string // Your Awin Publisher ID
  advertiserId: string // Coolblue's Advertiser ID in Awin
  awinDomain: string // Usually awin1.com
  clickRef?: string // Optional click reference for tracking
}

export class CoolblueAffiliateService {
  private static config: AwinCoolblueConfig = {
    publisherId: '2566111', // Gifteez.nl Publisher ID from Awin
    advertiserId: '85161', // Coolblue's Awin Advertiser ID
    awinDomain: 'awin1.com',
    clickRef: 'gifteez', // Optional: for tracking campaigns
  }

  /**
   * Generate Awin affiliate link for Coolblue URLs
   */
  static generateAwinLink(targetUrl: string, clickRef?: string): string {
    try {
      const encodedUrl = encodeURIComponent(targetUrl)
      const ref = clickRef || this.config.clickRef || ''

      const awinLink = `https://www.${this.config.awinDomain}/cread.php?awinmid=${this.config.advertiserId}&awinaffid=${this.config.publisherId}&clickref=${ref}&p=${encodedUrl}`

      return awinLink
    } catch (error) {
      console.error('Error generating Awin link:', error)
      return targetUrl
    }
  }

  /**
   * Add affiliate tracking to Coolblue URLs via Awin
   */
  static addAffiliateTracking(url: string, clickRef?: string): string {
    try {
      // Only process Coolblue URLs
      if (!this.isCoolblueUrl(url)) {
        return url
      }

      return this.generateAwinLink(url, clickRef)
    } catch (error) {
      console.error('Error adding Coolblue affiliate tracking:', error)
      return url
    }
  }

  /**
   * Generate affiliate search URL for Coolblue via Awin
   */
  static generateSearchUrl(query: string, clickRef?: string): string {
    const searchUrl = `https://www.coolblue.nl/zoeken?query=${encodeURIComponent(query)}`
    return this.generateAwinLink(searchUrl, clickRef)
  }

  /**
   * Generate affiliate product URL for Coolblue via Awin
   */
  static generateProductUrl(productId: string, clickRef?: string): string {
    const productUrl = `https://www.coolblue.nl/product/${productId}`
    return this.generateAwinLink(productUrl, clickRef)
  }

  /**
   * Update Awin configuration
   */
  static updateConfig(config: Partial<AwinCoolblueConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current configuration
   */
  static getConfig(): AwinCoolblueConfig {
    return { ...this.config }
  }

  /**
   * Check if URL is a Coolblue URL
   */
  static isCoolblueUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.includes('coolblue.nl')
    } catch {
      return false
    }
  }

  /**
   * Check if URL is already an Awin affiliate link
   */
  static isAwinLink(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.includes('awin') && urlObj.pathname.includes('cread.php')
    } catch {
      return false
    }
  }

  /**
   * Extract product ID from Coolblue URL
   */
  static extractProductId(url: string): string | null {
    try {
      const urlObj = new URL(url)
      const pathMatch = urlObj.pathname.match(/\/product\/(\d+)/)
      return pathMatch ? pathMatch[1] : null
    } catch {
      return null
    }
  }

  /**
   * Extract original URL from Awin link
   */
  static extractOriginalUrl(awinUrl: string): string | null {
    try {
      const urlObj = new URL(awinUrl)
      const pParam = urlObj.searchParams.get('p')
      return pParam ? decodeURIComponent(pParam) : null
    } catch {
      return null
    }
  }

  /**
   * Generate tracking URL with custom campaign reference
   */
  static generateCampaignUrl(targetUrl: string, campaign: string): string {
    return this.generateAwinLink(targetUrl, `gifteez-${campaign}`)
  }
}

export default CoolblueAffiliateService
