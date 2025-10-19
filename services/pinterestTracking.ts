// Pinterest Tracking Utility - MIGRATED TO GTM
// All events now push to dataLayer for GTM to handle
import DataLayerService from './dataLayerService'

declare global {
  interface Window {
    pintrk: any
  }
}

// Legacy pintrk function (kept for backwards compatibility)
export const pinterestTrack = (event: string, parameters?: any) => {
  if (typeof window !== 'undefined' && window.pintrk) {
    window.pintrk('track', event, parameters)
  }
}

// Page Visit - Now uses DataLayer
export const pinterestPageVisit = (pageType: string, eventId?: string) => {
  DataLayerService.customEvent('pinterest_pagevisit', {
    event_id: eventId || `pagevisit_${Date.now()}`,
    page_type: pageType,
  })
}

// Signup - Now uses DataLayer
export const pinterestSignup = (eventId?: string) => {
  DataLayerService.customEvent('pinterest_signup', {
    event_id: eventId || `signup_${Date.now()}`,
  })
}

// Lead - Now uses DataLayer
export const pinterestLead = (leadType: string, eventId?: string) => {
  DataLayerService.customEvent('pinterest_lead', {
    event_id: eventId || `lead_${Date.now()}`,
    lead_type: leadType,
  })
}

// Search - Now uses DataLayer
export const pinterestSearch = (searchQuery: string, eventId?: string) => {
  DataLayerService.customEvent('pinterest_search', {
    event_id: eventId || `search_${Date.now()}`,
    search_query: searchQuery,
  })
}
