// Google Analytics Utility
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const sendGtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
};

export const gaPageView = (pagePath: string, pageTitle?: string) => {
  sendGtag('config', 'G-Y697MJEN2H', {
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

interface DownloadMetadata {
  label?: string;
  slug?: string;
  title?: string;
}

export const gaDownloadResource = (resourcePath: string, metadata?: DownloadMetadata) => {
  if (!resourcePath) {
    return;
  }

  const params: Record<string, string> = {
    resource_path: resourcePath
  };

  if (metadata?.label) {
    params.resource_label = metadata.label;
  }
  if (metadata?.slug) {
    params.page_slug = metadata.slug;
  }
  if (metadata?.title) {
    params.page_title = metadata.title;
  }

  gaEvent('download_resource', params);
};
