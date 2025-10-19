/**
 * Service Worker Registration
 * Registers the PWA service worker with lifecycle management
 */

export interface SWRegistrationCallbacks {
  onSuccess?: () => void;
  onUpdate?: () => void;
  onError?: (_error: Error) => void;
}

/**
 * Register the service worker
 */
export async function registerServiceWorker(callbacks: SWRegistrationCallbacks = {}): Promise<void> {
  // Only register in production and if service workers are supported
  if (process.env.NODE_ENV === 'development') {
    console.log('[SW] Skipping registration in development mode');
    return;
  }

  if (!('serviceWorker' in navigator)) {
    console.warn('[SW] Service workers not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('[SW] Service worker registered:', registration.scope);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[SW] New service worker available');
          }
          callbacks.onUpdate?.();
        }
      });
    });

    // Check for updates every hour
    setInterval(() => {
      registration.update().catch(err => {
        console.warn('[SW] Update check failed:', err);
      });
    }, 60 * 60 * 1000);

    callbacks.onSuccess?.();
  } catch (error) {
    console.error('[SW] Registration failed:', error);
    callbacks.onError?.(error instanceof Error ? error : new Error('Registration failed'));
  }
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const success = await registration.unregister();
    console.log('[SW] Unregistered:', success);
    return success;
  } catch (error) {
    console.error('[SW] Unregistration failed:', error);
    return false;
  }
}

/**
 * Tell the service worker to skip waiting
 * Useful when you want to activate a new service worker immediately
 */
export function skipWaiting(): void {
  navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
}

/**
 * Clear all service worker caches
 */
export function clearCaches(): void {
  navigator.serviceWorker.controller?.postMessage({ type: 'CLEAR_CACHE' });
}

/**
 * Listen for service worker messages
 */
export function onSWMessage(callback: (_data: unknown) => void): () => void {
  const handler = (event: MessageEvent) => {
    callback(event.data);
  };

  navigator.serviceWorker.addEventListener('message', handler);

  // Return cleanup function
  return () => {
    navigator.serviceWorker.removeEventListener('message', handler);
  };
}

/**
 * Check if the app is running in standalone mode (installed PWA)
 */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true) ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Show update notification
 * Call this when a new service worker is available
 */
export function showUpdateNotification(): void {
  // Create a simple toast notification
  const toast = document.createElement('div');
  toast.id = 'sw-update-toast';
  toast.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #1f2937;
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 16px;
      animation: slideUp 0.3s ease-out;
    ">
      <span>Er is een nieuwe versie beschikbaar!</span>
      <button onclick="window.location.reload()" style="
        background: #9333ea;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      ">
        Vernieuwen
      </button>
      <button onclick="document.getElementById('sw-update-toast').remove()" style="
        background: transparent;
        color: #9ca3af;
        border: none;
        padding: 8px;
        cursor: pointer;
        font-size: 18px;
      ">
        ×
      </button>
    </div>
  `;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from { transform: translate(-50%, 100px); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(toast);

  // Auto-remove after 10 seconds
  setTimeout(() => {
    toast.remove();
  }, 10000);
}
