import { CoolblueAffiliateService } from './coolblueAffiliateService'

/**
 * Campaign tracking utilities for Awin/Coolblue affiliate links
 */
export class AwinCampaignTracker {
  /**
   * Generate affiliate link for Gift Finder results
   */
  static forGiftFinder(url: string): string {
    return CoolblueAffiliateService.generateCampaignUrl(url, 'giftfinder')
  }

  /**
   * Generate affiliate link for Deal pages
   */
  static forDeals(url: string): string {
    return CoolblueAffiliateService.generateCampaignUrl(url, 'deals')
  }

  /**
   * Generate affiliate link for Blog recommendations
   */
  static forBlog(url: string, postSlug?: string): string {
    const campaign = postSlug ? `blog-${postSlug}` : 'blog'
    return CoolblueAffiliateService.generateCampaignUrl(url, campaign)
  }

  /**
   * Generate affiliate link for Homepage featured products
   */
  static forHomepage(url: string): string {
    return CoolblueAffiliateService.generateCampaignUrl(url, 'homepage')
  }

  /**
   * Generate affiliate link for Quiz results
   */
  static forQuiz(url: string): string {
    return CoolblueAffiliateService.generateCampaignUrl(url, 'quiz')
  }

  /**
   * Generate affiliate link for Social sharing
   */
  static forSocialShare(url: string, platform: string): string {
    return CoolblueAffiliateService.generateCampaignUrl(url, `social-${platform.toLowerCase()}`)
  }

  /**
   * Generate affiliate link for Email campaigns
   */
  static forEmail(url: string, campaignName?: string): string {
    const campaign = campaignName ? `email-${campaignName}` : 'email'
    return CoolblueAffiliateService.generateCampaignUrl(url, campaign)
  }

  /**
   * Generate affiliate link for specific product categories
   */
  static forCategory(url: string, category: string): string {
    const cleanCategory = category.toLowerCase().replace(/\s+/g, '-')
    return CoolblueAffiliateService.generateCampaignUrl(url, `cat-${cleanCategory}`)
  }
}

export default AwinCampaignTracker
