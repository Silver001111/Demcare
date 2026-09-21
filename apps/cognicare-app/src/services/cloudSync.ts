import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import type { GameSession, AshaObservation, PatientProfile } from '../types';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDxaT38-LXsrlZlls_RELyzuEAwUdlXA1s",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demcare-95abc.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demcare-95abc",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demcare-95abc.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "497656119731",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:497656119731:web:dfb1692fb5a46370768bc6"
};

// Initialize Firebase (singleton pattern prevents re-init on Vite HMR)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Clean object helper: Firestore rejects `undefined` values
function sanitizeForFirestore<T>(data: T): Record<string, unknown> {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Save a cognitive game session to Cloud Firestore.
 * If offline or write fails, falls back gracefully to offline mode.
 */
export const saveSessionToCloud = async (
  sessionData: GameSession | unknown
): Promise<{ success: boolean; mode: 'cloud' | 'offline-fallback'; error?: string }> => {
  try {
    const session = sessionData as GameSession;
    const docId = session.id || `session_${Date.now()}`;
    const cleanData = sanitizeForFirestore({
      ...session,
      synced: true,
      syncedAt: new Date().toISOString(),
    });

    await setDoc(doc(db, 'sessions', docId), cleanData, { merge: true });
    console.log(`[CogniCare Firebase] ✅ Session ${docId} synced to Cloud Firestore (demcare-95abc)`);
    return { success: true, mode: 'cloud' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('[CogniCare Firebase] ⚠️ Cloud sync deferred (offline-first fallback):', errorMsg);
    return { success: false, mode: 'offline-fallback', error: errorMsg };
  }
};

/**
 * Save an ASHA screening observation to Cloud Firestore.
 */
export const saveObservationToCloud = async (
  obsData: AshaObservation
): Promise<{ success: boolean; mode: 'cloud' | 'offline-fallback'; error?: string }> => {
  try {
    const docId = obsData.id || `obs_${Date.now()}`;
    const cleanData = sanitizeForFirestore({
      ...obsData,
      synced: true,
      syncedAt: new Date().toISOString(),
    });

    await setDoc(doc(db, 'observations', docId), cleanData, { merge: true });
    console.log(`[CogniCare Firebase] ✅ ASHA observation ${docId} synced to Cloud Firestore`);
    return { success: true, mode: 'cloud' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('[CogniCare Firebase] ⚠️ ASHA observation cloud sync deferred:', errorMsg);
    return { success: false, mode: 'offline-fallback', error: errorMsg };
  }
};

/**
 * Save or update patient profile in Cloud Firestore.
 */
export const savePatientProfileToCloud = async (
  patient: PatientProfile
): Promise<{ success: boolean; mode: 'cloud' | 'offline-fallback'; error?: string }> => {
  try {
    const cleanData = sanitizeForFirestore({
      ...patient,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'patients', patient.id), cleanData, { merge: true });
    console.log(`[CogniCare Firebase] ✅ Patient profile ${patient.id} synced to Cloud Firestore`);
    return { success: true, mode: 'cloud' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('[CogniCare Firebase] ⚠️ Patient profile sync deferred:', errorMsg);
    return { success: false, mode: 'offline-fallback', error: errorMsg };
  }
};

/**
 * Sync all pending offline records (sessions & observations) to Firestore in a batch.
 */
export const syncAllToCloud = async (
  sessions: GameSession[],
  observations: AshaObservation[]
): Promise<{ success: boolean; syncedSessions: number; syncedObservations: number }> => {
  try {
    const batch = writeBatch(db);
    let sessionCount = 0;
    let obsCount = 0;

    const unsyncedSessions = sessions.filter((s) => !s.synced);
    for (const s of unsyncedSessions) {
      const docRef = doc(db, 'sessions', s.id);
      batch.set(docRef, sanitizeForFirestore({ ...s, synced: true, syncedAt: new Date().toISOString() }), { merge: true });
      sessionCount++;
    }

    const unsyncedObs = observations.filter((o) => !o.synced);
    for (const o of unsyncedObs) {
      const docRef = doc(db, 'observations', o.id);
      batch.set(docRef, sanitizeForFirestore({ ...o, synced: true, syncedAt: new Date().toISOString() }), { merge: true });
      obsCount++;
    }

    if (sessionCount > 0 || obsCount > 0) {
      await batch.commit();
      console.log(`[CogniCare Firebase] 🚀 Batch sync complete: ${sessionCount} sessions, ${obsCount} observations pushed to Firestore.`);
    }

    return { success: true, syncedSessions: sessionCount, syncedObservations: obsCount };
  } catch (err) {
    console.warn('[CogniCare Firebase] Batch sync encountered an error:', err);
    return { success: false, syncedSessions: 0, syncedObservations: 0 };
  }
};

/**
 * Save Thompson Sampling Bayesian priors to Cloud Firestore.
 */
export const syncPriorsWithCloud = async (
  localPriors: unknown
): Promise<{ success: boolean; mode: string }> => {
  try {
    const cleanData = sanitizeForFirestore({
      priors: localPriors,
      lastUpdated: new Date().toISOString(),
    });
    await setDoc(doc(db, 'ml_priors', 'thompson_sampling'), cleanData, { merge: true });
    return { success: true, mode: 'cloud' };
  } catch (e) {
    console.log('[CogniCare Firebase] Prior sync retained locally (offline):', e);
    return { success: true, mode: 'offline-first' };
  }
};

/**
 * Google Sign-In for Caregivers & ASHA workers.
 */
export const signInWithGoogle = async (): Promise<{
  success: boolean;
  user?: User;
  error?: string;
  code?: string;
}> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('[CogniCare Firebase] 🔑 User authenticated with Google:', result.user.displayName, result.user.email);
    return { success: true, user: result.user };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const errorCode = (err as { code?: string })?.code;
    console.warn('[CogniCare Firebase] Google Sign-In error:', errorCode, errorMsg);
    return { success: false, error: errorMsg, code: errorCode };
  }
};

/**
 * Sign out current authenticated user.
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('[CogniCare Firebase] 🔒 User signed out');
  } catch (err) {
    console.error('[CogniCare Firebase] Sign out error:', err);
  }
};

/**
 * Listen to auth state changes.
 */
export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
