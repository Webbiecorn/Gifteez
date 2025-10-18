// Firebase client initialization
// Uses VITE_ env vars; add them in a .env file (not committed)
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import type { Analytics } from 'firebase/analytics';

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
let storageInst: FirebaseStorage | null = null;
let analyticsInst: Analytics | null = null;

if (hasRequired) {
  app = getApps().length ? getApp() : initializeApp(cfg);
  authInst = getAuth(app);
  dbInst = getFirestore(app);
  storageInst = getStorage(app);
}

// Function to initialize analytics with consent
export const initializeAnalyticsWithConsent = async (): Promise<void> => {
  if (!cfg.measurementId || typeof window === 'undefined' || analyticsInst) {
    return;
  }

  try {
    const { isSupported, getAnalytics } = await import('firebase/analytics');
    const ok = await isSupported();
    if (ok && app) {
      analyticsInst = getAnalytics(app);
      console.log('Firebase Analytics initialized with user consent');
    }
  } catch (error) {
    console.warn('Failed to initialize Firebase Analytics:', error);
  }
};

// Check if analytics should be initialized based on stored consent
const checkStoredConsent = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const storedConsent = localStorage.getItem('gifteez_cookie_consent');
    if (storedConsent) {
      const consentData = JSON.parse(storedConsent);
      return consentData.preferences?.analytics === true;
    }
  } catch (error) {
    console.error('Error checking stored cookie consent:', error);
  }
  return false;
};

// Initialize analytics if consent was previously given
if (hasRequired && checkStoredConsent()) {
  initializeAnalyticsWithConsent();
}

export const auth = authInst;
export const db = dbInst;
export const storage = storageInst;
export const firebaseEnabled = hasRequired;
export const analytics = analyticsInst;
