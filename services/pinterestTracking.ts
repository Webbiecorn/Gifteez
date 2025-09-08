// Pinterest Tracking Utility
declare global {
  interface Window {
    pintrk: any;
  }
}

export const pinterestTrack = (event: string, parameters?: any) => {
  if (typeof window !== 'undefined' && window.pintrk) {
    window.pintrk('track', event, parameters);
  }
};

export const pinterestPageVisit = (pageType: string, eventId?: string) => {
  pinterestTrack('pagevisit', {
    event_id: eventId || `pagevisit_${Date.now()}`,
    page_type: pageType
  });
};

export const pinterestSignup = (eventId?: string) => {
  pinterestTrack('signup', {
    event_id: eventId || `signup_${Date.now()}`
  });
};

export const pinterestLead = (leadType: string, eventId?: string) => {
  pinterestTrack('lead', {
    event_id: eventId || `lead_${Date.now()}`,
    lead_type: leadType
  });
};

export const pinterestSearch = (searchQuery: string, eventId?: string) => {
  pinterestTrack('search', {
    event_id: eventId || `search_${Date.now()}`,
    search_query: searchQuery
  });
};
