// Firebase client initialization
// Uses VITE_ env vars; add them in a .env file (not committed)
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const hasRequired = Boolean(cfg.apiKey && cfg.projectId);

let app: FirebaseApp | null = null;
let authInst: Auth | null = null;
let dbInst: Firestore | null = null;
let analyticsInst: Analytics | null = null;

if (hasRequired) {
  app = getApps().length ? getApp() : initializeApp(cfg);
  authInst = getAuth(app);
  dbInst = getFirestore(app);
  // Analytics is optional; only init if supported and measurementId is present (web only)
  if (cfg.measurementId && typeof window !== 'undefined') {
    isSupported().then((ok) => {
      if (ok && app) {
        try { analyticsInst = getAnalytics(app); } catch { /* ignore */ }
      }
    }).catch(() => {});
  }
}

export const auth = authInst;
export const db = dbInst;
export const firebaseEnabled = hasRequired;
export const analytics = analyticsInst;
