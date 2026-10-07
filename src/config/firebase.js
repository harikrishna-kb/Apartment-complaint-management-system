import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * --------------------------------------------------------------------------
 * Live Firebase Project Configuration
 * --------------------------------------------------------------------------
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyADXx0iR9n4D4FZBcCNh3zdofMuv5IMR44",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "society-complaint-system.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "society-complaint-system",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "society-complaint-system.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "814480373267",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:814480373267:web:2769b34d38c63ebf3371e6",
};

export const isLiveFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.startsWith("AIzaSy")
);

let app = null;
let auth = null;
let db = null;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("🔥 Connected to Live Firebase Project:", firebaseConfig.projectId);
} catch (err) {
  console.warn("Firebase initialization encountered an issue:", err);
}

export { app, auth, db };
