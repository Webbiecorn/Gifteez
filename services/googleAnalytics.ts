// Google Analytics Utility - MIGRATED TO GTM
// All events now push to dataLayer for GTM to handle
import DataLayerService from './dataLayerService'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer: any[]
  }
}

// Legacy gtag function (kept for backwards compatibility)
export const sendGtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args)
  }
}

// Page View - Now uses DataLayer
export const gaPageView = (pagePath: string, pageTitle?: string) => {
  DataLayerService.pageView(pagePath, pageTitle || 'Unknown')
}

// Generic Event - Now uses DataLayer
export const gaEvent = (eventName: string, parameters?: any) => {
  DataLayerService.customEvent(eventName, parameters)
}

// Search - Now uses DataLayer
export const gaSearch = (searchTerm: string) => {
  DataLayerService.search(searchTerm)
}

// Signup - Now uses DataLayer
export const gaSignup = (method: string = 'form') => {
  DataLayerService.signup(method)
}

// Lead - Now uses DataLayer
export const gaLead = (leadType: string) => {
  DataLayerService.lead(leadType)
}

// Purchase - Uses custom event
export const gaPurchase = (transactionId: string, value: number, currency: string = 'EUR') => {
  DataLayerService.customEvent('purchase', {
    transaction_id: transactionId,
    value: value,
    currency: currency,
  })
}

interface DownloadMetadata {
  label?: string
  slug?: string
  title?: string
}

// Download Resource - Uses custom event
export const gaDownloadResource = (resourcePath: string, metadata?: DownloadMetadata) => {
  if (!resourcePath) {
    return
  }

  const params: Record<string, string> = {
    resource_path: resourcePath,
  }

  if (metadata?.label) {
    params.resource_label = metadata.label
  }
  if (metadata?.slug) {
    params.page_slug = metadata.slug
  }
  if (metadata?.title) {
    params.page_title = metadata.title
  }

  DataLayerService.customEvent('download_resource', params)
}
