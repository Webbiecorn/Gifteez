// Firebase client initialization
// Uses VITE_ env vars; add them in a .env file (not committed)
// Lazy Firebase loader: geen zware Firebase code in initiale bundle.
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { Analytics } from 'firebase/analytics';

interface FirebaseBundle {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  analytics: Analytics | null;
  enabled: boolean;
}

let bundle: FirebaseBundle | null = null;
let loadingPromise: Promise<FirebaseBundle> | null = null;

export function getFirebaseSync(): FirebaseBundle | null {
  return bundle;
}

export async function loadFirebase(): Promise<FirebaseBundle> {
  if (bundle) return bundle;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const cfg = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    } as const;
    const enabled = Boolean(cfg.apiKey && cfg.projectId);
    if (!enabled) {
      bundle = { app: null, auth: null, db: null, analytics: null, enabled };
      return bundle;
    }

    // Load only core modules up front; analytics deferred so het niet in de eerste firebase chunk zit.
    const [{ initializeApp, getApps, getApp }, { getAuth }, { getFirestore }] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('firebase/firestore')
    ]);

    const app = getApps().length ? getApp() : initializeApp(cfg);
    const auth = getAuth(app);
    const db = getFirestore(app);
    let analytics: Analytics | null = null;
    if (cfg.measurementId && typeof window !== 'undefined') {
      // Dynamically import analytics only if needed & supported (saves ~30-40KB)
      try {
        const { getAnalytics, isSupported } = await import('firebase/analytics');
        if (await isSupported()) {
          try { analytics = getAnalytics(app); } catch { /* ignore */ }
        }
      } catch { /* ignore */ }
    }
    bundle = { app, auth, db, analytics, enabled };
    return bundle;
  })();

  return loadingPromise;
}

// Convenience async getters (avoid rewriting existing code too much if needed later)
export async function ensureAuth() { return (await loadFirebase()).auth; }
export async function ensureDb() { return (await loadFirebase()).db; }
export async function firebaseIsEnabled() { return (await loadFirebase()).enabled; }
