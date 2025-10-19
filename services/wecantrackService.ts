/**
 * Wecantrack Service
 * 
 * Integrates with AWIN's wecantrack platform for consolidated affiliate analytics
 * across multiple networks (AWIN, Coolblue, Amazon, etc.)
 * 
 * Features:
 * - Automatic tracking via AWIN MasterTag
 * - Click and conversion tracking
 * - User action logging
 * - Integration with existing logger infrastructure
 * 
 * The AWIN MasterTag (pub.256611.min.js) must be loaded in index.html
 * This enables:
 * - wecantrack: Consolidated analytics from 350+ networks
 * - adMission: Automatic affiliate disclosure
 * - TRENDii: Instant shopping tags
 */

import { logger } from '../lib/logger';

export interface WecantrackWindow extends Window {
  wecantrack?: any;
  adMission?: any;
  TRENDii?: any;
}

declare const window: WecantrackWindow;

class WecantrackService {
  /**
   * Check if AWIN MasterTag is loaded
   */
  isLoaded(): boolean {
    return typeof window !== 'undefined' && 
           (window.wecantrack !== undefined || 
            window.adMission !== undefined ||
            window.TRENDii !== undefined);
  }

  /**
   * Check if specific plugin is active
   */
  isPluginActive(plugin: 'wecantrack' | 'adMission' | 'TRENDii'): boolean {
    return typeof window !== 'undefined' && window[plugin] !== undefined;
  }

  /**
   * Track affiliate click
   * Logs the click for analytics and lets AWIN MasterTag handle the actual tracking
   */
  trackClick(params: {
    productId: string;
    productName: string;
    retailer: string;
    price?: number;
    category?: string;
    url: string;
  }): void {
    logger.logUserAction('affiliate_click', {
      productId: params.productId,
      productName: params.productName,
      retailer: params.retailer,
      price: params.price,
      category: params.category,
      url: params.url,
      timestamp: Date.now(),
      wecantrackActive: this.isPluginActive('wecantrack')
    });

    // Log for debugging
    logger.info('Tracking affiliate click', {
      productId: params.productId,
      retailer: params.retailer,
      masterTagLoaded: this.isLoaded()
    });
  }

  /**
   * Track page view with product context
   * Useful for product detail pages
   */
  trackProductView(params: {
    productId: string;
    productName: string;
    category?: string;
    price?: number;
  }): void {
    logger.logUserAction('product_view', {
      productId: params.productId,
      productName: params.productName,
      category: params.category,
      price: params.price,
      timestamp: Date.now()
    });
  }

  /**
   * Get MasterTag status for debugging
   */
  getStatus(): {
    masterTagLoaded: boolean;
    plugins: {
      wecantrack: boolean;
      adMission: boolean;
      TRENDii: boolean;
    };
  } {
    const status = {
      masterTagLoaded: this.isLoaded(),
      plugins: {
        wecantrack: this.isPluginActive('wecantrack'),
        adMission: this.isPluginActive('adMission'),
        TRENDii: this.isPluginActive('TRENDii')
      }
    };

    logger.debug('Wecantrack status', status);
    return status;
  }

  /**
   * Initialize wecantrack (call this on app start)
   */
  initialize(): void {
    if (typeof window === 'undefined') {
      logger.warn('Wecantrack: Window not available (SSR)');
      return;
    }

    // Wait for MasterTag to load
    const checkInterval = setInterval(() => {
      if (this.isLoaded()) {
        clearInterval(checkInterval);
        
        const status = this.getStatus();
        logger.info('AWIN MasterTag loaded successfully', status);

        // Check which plugins are active
        if (status.plugins.wecantrack) {
          logger.info('✓ wecantrack plugin active - Consolidated analytics enabled');
        }
        if (status.plugins.adMission) {
          logger.info('✓ adMission plugin active - Automatic disclosure enabled');
        }
        if (status.plugins.TRENDii) {
          logger.info('✓ TRENDii plugin active - Instant shopping tags enabled');
        }
      }
    }, 500);

    // Stop checking after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!this.isLoaded()) {
        logger.warn('AWIN MasterTag did not load within 10 seconds');
      }
    }, 10000);
  }
}

// Export singleton instance
export const wecantrackService = new WecantrackService();

// Export for testing
export { WecantrackService };
