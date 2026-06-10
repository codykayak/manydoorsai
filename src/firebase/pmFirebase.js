/**
 * Isolated Firebase init for the Property Management module.
 *
 * This uses a SEPARATE Firebase project from the host site, wired
 * through `VITE_PM_FIREBASE_*` env vars, so client/resident data is never
 * mingled with the host's data. If no PM Firebase config is present, the
 * module runs fully on the local store (localStorage) — so it works the
 * instant you load it, before the new Firebase project is set up.
 *
 * We create a NAMED Firebase app ('pm') so initializing here cannot collide
 * with the host site's default Firebase app.
 *
 * Firestore: this project's database is named `property-managment` (a named
 * Cloud Firestore database, not the "(default)" one). Set the exact name in
 * `VITE_PM_FIRESTORE_DB`. Leave it blank only if you used the "(default)"
 * database.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { PM_FIREBASE_PUBLIC_DEFAULTS } from '../config/firebasePublic.js';

const env = import.meta.env ?? {};
const defaults = PM_FIREBASE_PUBLIC_DEFAULTS;

const pmConfig = {
  apiKey: env.VITE_PM_FIREBASE_API_KEY || defaults.apiKey,
  authDomain: env.VITE_PM_FIREBASE_AUTH_DOMAIN || defaults.authDomain,
  projectId: env.VITE_PM_FIREBASE_PROJECT_ID || defaults.projectId,
  storageBucket: env.VITE_PM_FIREBASE_STORAGE_BUCKET || defaults.storageBucket,
  messagingSenderId: env.VITE_PM_FIREBASE_MESSAGING_SENDER_ID || defaults.messagingSenderId,
  appId: env.VITE_PM_FIREBASE_APP_ID || defaults.appId,
};

/** Name of the Cloud Firestore database to use (named database support). */
export const PM_FIRESTORE_DB = env.VITE_PM_FIRESTORE_DB || defaults.firestoreDatabase;

export const isPmFirebaseConfigured = Boolean(
  pmConfig.apiKey && pmConfig.projectId && pmConfig.appId,
);

const PM_APP_NAME = 'pm';

let pmApp = null;
let pmDb = null;
let pmAuth = null;

export function getPmApp() {
  if (!isPmFirebaseConfigured) return null;
  if (pmApp) return pmApp;
  const existing = getApps().find((a) => a.name === PM_APP_NAME);
  pmApp = existing || initializeApp(pmConfig, PM_APP_NAME);
  return pmApp;
}

/** Firestore handle for the (possibly named) PM database, or null if unconfigured. */
export function getPmDb() {
  const app = getPmApp();
  if (!app) return null;
  if (pmDb) return pmDb;
  pmDb = PM_FIRESTORE_DB && PM_FIRESTORE_DB !== '(default)'
    ? getFirestore(app, PM_FIRESTORE_DB)
    : getFirestore(app);
  return pmDb;
}

/** Auth handle for the PM project, or null if unconfigured. */
export function getPmAuth() {
  const app = getPmApp();
  if (!app) return null;
  if (pmAuth) return pmAuth;
  pmAuth = getAuth(app);
  return pmAuth;
}

export function getPmGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

export { pmConfig };
export default getPmApp;
