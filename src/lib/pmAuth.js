/**
 * Firebase Auth for the PM module — Google sign-in, tenant-scoped access.
 */

import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getPmAuth, getPmDb, getPmGoogleProvider, isPmFirebaseConfigured } from '../firebase/pmFirebase';

export { isPmFirebaseConfigured };

export function getAuth() {
  return getPmAuth();
}

export function signInWithGoogle() {
  const auth = getPmAuth();
  if (!auth) throw new Error('Firebase is not configured for this deployment.');
  return signInWithPopup(auth, getPmGoogleProvider());
}

export function signOutPm() {
  const auth = getPmAuth();
  return auth ? signOut(auth) : Promise.resolve();
}

export function watchAuth(callback) {
  const auth = getPmAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function getIdToken() {
  const auth = getPmAuth();
  const user = auth?.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

/** Resolve tenant id for the signed-in user (userTenants index). */
export async function resolveTenantId(fallback = 'demo') {
  const auth = getPmAuth();
  const db = getPmDb();
  const uid = auth?.currentUser?.uid;
  if (!db || !uid) return fallback;
  const snap = await getDoc(doc(db, 'userTenants', uid));
  if (!snap.exists()) return fallback;
  return snap.data()?.tenantId || snap.data()?.defaultTenantId || fallback;
}

/** @typedef {{ exportFolder: string, scheduleTime: string, enabled: boolean, updatedAt?: number }} SyncConfig */

export async function loadSyncConfig(tenantId) {
  const db = getPmDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, 'tenants', tenantId));
  if (!snap.exists()) return null;
  return snap.data()?.syncConfig || null;
}

export async function saveSyncConfig(tenantId, config) {
  const db = getPmDb();
  if (!db) throw new Error('Firestore is not available.');
  const ref = doc(db, 'tenants', tenantId);
  const next = {
    ...config,
    updatedAt: Date.now(),
  };
  await setDoc(ref, { syncConfig: next }, { merge: true });
  return next;
}

export async function loadPortfolioFromFirestore(tenantId) {
  const db = getPmDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, 'tenants', tenantId, 'portfolio', 'current'));
  return snap.exists() ? snap.data() : null;
}
