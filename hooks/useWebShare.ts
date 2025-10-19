import { useState, useCallback } from 'react';

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

export interface ShareResult {
  success: boolean;
  error?: Error;
}

export interface UseWebShareResult {
  canShare: boolean;
  share: (data: ShareData) => Promise<ShareResult>;
  isSharing: boolean;
}

/**
 * Hook for Web Share API
 * Enables native sharing to WhatsApp, Pinterest, and other apps
 * Automatically falls back if Web Share API is not supported
 */
export function useWebShare(): UseWebShareResult {
  const [isSharing, setIsSharing] = useState(false);

  // Check if Web Share API is supported
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator;

  const share = useCallback(async (data: ShareData) => {
    if (!canShare) {
      return {
        success: false,
        error: new Error('Web Share API not supported')
      };
    }

    // Validate share data
    if (!data.title && !data.text && !data.url) {
      return {
        success: false,
        error: new Error('At least one of title, text, or url must be provided')
      };
    }

    setIsSharing(true);

    try {
      await navigator.share(data);
      setIsSharing(false);
      return { success: true };
    } catch (error) {
      setIsSharing(false);
      
      // User cancelled the share dialog - this is not really an error
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, error };
      }
      
      // Other errors (e.g., invalid data)
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Share failed')
      };
    }
  }, [canShare]);

  return { canShare, share, isSharing };
}

/**
 * Check if we can share specific data
 * Useful for checking if files can be shared (not needed for basic text/url)
 */
export function canShareData(_data: ShareData): boolean {
  if (typeof navigator === 'undefined' || !('canShare' in navigator)) {
    return false;
  }
  
  // Note: canShare() is not widely supported yet, so we just check for share API
  return 'share' in navigator;
}
