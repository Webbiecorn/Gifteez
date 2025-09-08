// Google Analytics Utility
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const sendGtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
};

export const gaPageView = (pagePath: string, pageTitle?: string) => {
  sendGtag('config', 'GA_MEASUREMENT_ID', {
    page_path: pagePath,
    page_title: pageTitle
  });
};

export const gaEvent = (eventName: string, parameters?: any) => {
  sendGtag('event', eventName, parameters);
};

export const gaSearch = (searchTerm: string) => {
  gaEvent('search', {
    search_term: searchTerm
  });
};

export const gaSignup = (method: string = 'form') => {
  gaEvent('sign_up', {
    method: method
  });
};

export const gaLead = (leadType: string) => {
  gaEvent('generate_lead', {
    lead_type: leadType
  });
};

export const gaPurchase = (transactionId: string, value: number, currency: string = 'EUR') => {
  gaEvent('purchase', {
    transaction_id: transactionId,
    value: value,
    currency: currency
  });
};
