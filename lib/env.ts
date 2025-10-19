/**
 * Environment Configuration & Validation
 * 
 * Features:
 * - Type-safe environment variables
 * - Validation on app startup
 * - Default values
 * - Helper functions
 */

import { logger } from './logger';

interface EnvironmentConfig {
  // General
  appName: string;
  appEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;

  // Firebase
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };

  // AI Services
  ai: {
    geminiApiKey?: string;
    openaiApiKey?: string;
  };

  // Affiliate Networks
  affiliates: {
    awin?: {
      publisherId: string;
      apiKey: string;
    };
    coolblue?: {
      affiliateId: string;
      apiKey: string;
    };
    amazon?: {
      associateTag: string;
      accessKey: string;
      secretKey: string;
    };
    slygad?: {
      affiliateId: string;
    };
  };

  // Analytics
  analytics: {
    gaId?: string;
    gtmId?: string;
    hotjarId?: string;
  };

  // Feature Flags
  features: {
    giftAI: boolean;
    advancedFilters: boolean;
    socialSharing: boolean;
    newsletter: boolean;
    affiliateDisclosure: boolean;
    blog: boolean;
    deals: boolean;
    quiz: boolean;
    adminDashboard: boolean;
    productRecommendations: boolean;
  };

  // Logging
  logging: {
    enableRemote: boolean;
    endpoint?: string;
    sentryDsn?: string;
    level: string;
  };

  // API Configuration
  api: {
    timeout: number;
    retries: number;
    rateLimit: number;
  };

  // Cache Configuration
  cache: {
    defaultTTL: number;
    backend: 'memory' | 'localStorage' | 'indexedDB';
    maxSize: number;
  };
}

class EnvironmentService {
  private config: EnvironmentConfig;

  constructor() {
    this.config = this.loadConfig();
    this.validate();
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfig(): EnvironmentConfig {
    return {
      // General
      appName: import.meta.env.VITE_APP_NAME || 'Gifteez',
      appEnv: import.meta.env.VITE_APP_ENV || 'local',
      isDevelopment: import.meta.env.DEV,
      isProduction: import.meta.env.PROD,

      // Firebase
      firebase: {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
      },

      // AI Services
      ai: {
        geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
        openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY
      },

      // Affiliates
      affiliates: {
        awin: import.meta.env.VITE_AWIN_PUBLISHER_ID ? {
          publisherId: import.meta.env.VITE_AWIN_PUBLISHER_ID,
          apiKey: import.meta.env.VITE_AWIN_API_KEY || ''
        } : undefined,
        coolblue: import.meta.env.VITE_COOLBLUE_AFFILIATE_ID ? {
          affiliateId: import.meta.env.VITE_COOLBLUE_AFFILIATE_ID,
          apiKey: import.meta.env.VITE_COOLBLUE_API_KEY || ''
        } : undefined,
        amazon: import.meta.env.VITE_AMAZON_ASSOCIATE_TAG ? {
          associateTag: import.meta.env.VITE_AMAZON_ASSOCIATE_TAG,
          accessKey: import.meta.env.VITE_AMAZON_ACCESS_KEY || '',
          secretKey: import.meta.env.VITE_AMAZON_SECRET_KEY || ''
        } : undefined,
        slygad: import.meta.env.VITE_SLYGAD_AFFILIATE_ID ? {
          affiliateId: import.meta.env.VITE_SLYGAD_AFFILIATE_ID
        } : undefined
      },

      // Analytics
      analytics: {
        gaId: import.meta.env.VITE_GA_MEASUREMENT_ID,
        gtmId: import.meta.env.VITE_GTM_ID,
        hotjarId: import.meta.env.VITE_HOTJAR_ID
      },

      // Feature Flags
      features: {
        giftAI: this.parseBoolean(import.meta.env.VITE_FEATURE_GIFT_AI, true),
        advancedFilters: this.parseBoolean(import.meta.env.VITE_FEATURE_ADVANCED_FILTERS, true),
        socialSharing: this.parseBoolean(import.meta.env.VITE_FEATURE_SOCIAL_SHARING, true),
        newsletter: this.parseBoolean(import.meta.env.VITE_FEATURE_NEWSLETTER, true),
        affiliateDisclosure: this.parseBoolean(import.meta.env.VITE_FEATURE_AFFILIATE_DISCLOSURE, true),
        blog: this.parseBoolean(import.meta.env.VITE_FEATURE_BLOG, true),
        deals: this.parseBoolean(import.meta.env.VITE_FEATURE_DEALS, true),
        quiz: this.parseBoolean(import.meta.env.VITE_FEATURE_QUIZ, true),
        adminDashboard: this.parseBoolean(import.meta.env.VITE_FEATURE_ADMIN_DASHBOARD, false),
        productRecommendations: this.parseBoolean(import.meta.env.VITE_FEATURE_PRODUCT_RECOMMENDATIONS, true)
      },

      // Logging
      logging: {
        enableRemote: this.parseBoolean(import.meta.env.VITE_ENABLE_REMOTE_LOGGING, false),
        endpoint: import.meta.env.VITE_LOGGING_ENDPOINT,
        sentryDsn: import.meta.env.VITE_SENTRY_DSN,
        level: import.meta.env.VITE_LOG_LEVEL || 'info'
      },

      // API Configuration
      api: {
        timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
        retries: parseInt(import.meta.env.VITE_API_RETRIES || '3'),
        rateLimit: parseInt(import.meta.env.VITE_API_RATE_LIMIT || '60')
      },

      // Cache Configuration
      cache: {
        defaultTTL: parseInt(import.meta.env.VITE_CACHE_DEFAULT_TTL || '3600000'),
        backend: (import.meta.env.VITE_CACHE_BACKEND as any) || 'memory',
        maxSize: parseInt(import.meta.env.VITE_CACHE_MAX_SIZE || '100')
      }
    };
  }

  /**
   * Parse boolean from string
   */
  private parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
    if (value === undefined) return defaultValue;
    return value === 'true' || value === '1';
  }

  /**
   * Validate required environment variables
   */
  private validate(): void {
    const errors: string[] = [];

    // Check Firebase config (required)
    if (!this.config.firebase.apiKey) {
      errors.push('VITE_FIREBASE_API_KEY is required');
    }
    if (!this.config.firebase.projectId) {
      errors.push('VITE_FIREBASE_PROJECT_ID is required');
    }

    // Log warnings for optional but recommended configs
    if (!this.config.ai.geminiApiKey && this.config.features.giftAI) {
      logger.warn('VITE_GEMINI_API_KEY not set - AI features will be limited');
    }

    if (errors.length > 0) {
      const errorMessage = `Environment validation failed:\n${errors.join('\n')}`;
      logger.error(errorMessage);
      
      if (this.config.isProduction) {
        throw new Error(errorMessage);
      }
    } else {
      logger.info('Environment configuration loaded successfully', {
        env: this.config.appEnv,
        featuresEnabled: Object.entries(this.config.features)
          .filter(([, enabled]) => enabled)
          .map(([feature]) => feature)
      });
    }
  }

  /**
   * Get full config
   */
  getConfig(): EnvironmentConfig {
    return this.config;
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature: keyof EnvironmentConfig['features']): boolean {
    return this.config.features[feature];
  }

  /**
   * Get API config
   */
  getApiConfig() {
    return this.config.api;
  }

  /**
   * Get cache config
   */
  getCacheConfig() {
    return this.config.cache;
  }

  /**
   * Get logging config
   */
  getLoggingConfig() {
    return this.config.logging;
  }

  /**
   * Get affiliate config
   */
  getAffiliateConfig(network: keyof EnvironmentConfig['affiliates']) {
    return this.config.affiliates[network];
  }
}

// Export singleton instance
export const env = new EnvironmentService();

// Export types
export type { EnvironmentConfig };
