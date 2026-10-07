import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, isLiveFirebaseConfigured } from '../config/firebase';
import { USER_ROLES } from '../constants/roles';
import { INITIAL_SEED_USERS } from '../utils/seedData';
import { fetchUserProfile } from './userService';

const LOCAL_USERS_KEY = 'society_cms_users';
const LOCAL_SESSION_KEY = 'society_cms_session';

function getLocalUsers() {
  const data = localStorage.getItem(LOCAL_USERS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(INITIAL_SEED_USERS));
    return INITIAL_SEED_USERS;
  }
  try {
    const existing = JSON.parse(data);
    const existingEmails = new Set(existing.map((u) => u.email.toLowerCase()));
    let updated = false;
    INITIAL_SEED_USERS.forEach((seed) => {
      if (!existingEmails.has(seed.email.toLowerCase())) {
        existing.push(seed);
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(existing));
    }
    return existing;
  } catch {
    return INITIAL_SEED_USERS;
  }
}

function saveLocalUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

const authListeners = new Set();
function notifyAuthListeners(user) {
  authListeners.forEach((fn) => fn(user));
}

/**
 * Sign in with email and password
 * Automatically provisions initial seed accounts in Firebase if not yet created.
 */
export async function loginWithEmail(email, password) {
  const cleanEmail = email.trim().toLowerCase();

  if (isLiveFirebaseConfigured && auth) {
    try {
      // 1. Try standard Firebase sign in
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const profile = await fetchUserProfile(cred.user.uid);
      const userObj = profile || { uid: cred.user.uid, email: cleanEmail, role: USER_ROLES.RESIDENT };
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(userObj));
      notifyAuthListeners(userObj);
      return { success: true, user: userObj };
    } catch (err) {
      // 2. If user doesn't exist in live Firebase yet, check if it's one of the seed accounts
      const seedMatch = INITIAL_SEED_USERS.find(
        (u) => u.email.toLowerCase() === cleanEmail && u.password === password
      );

      if (seedMatch && (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential')) {
        try {
          const newCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
          const newProfile = {
            uid: newCred.user.uid,
            name: seedMatch.name,
            email: cleanEmail,
            role: seedMatch.role,
            flat_no: seedMatch.flat_no || null,
            specialty: seedMatch.specialty || null,
            createdAt: new Date().toISOString(),
          };

          if (db) {
            await setDoc(doc(db, 'users', newCred.user.uid), newProfile);
          }

          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(newProfile));
          notifyAuthListeners(newProfile);
          return { success: true, user: newProfile };
        } catch (createErr) {
          console.warn("Could not auto-create seed user in live Firebase:", createErr.message);
        }
      }

      console.warn("Live Firebase Auth error, checking local store:", err.message);
    }
  }

  // Fallback to local user store
  const localUsers = getLocalUsers();
  const matched = localUsers.find(
    (u) => u.email.toLowerCase() === cleanEmail && u.password === password
  );

  if (!matched) {
    throw new Error('Invalid email or password. Please verify your credentials.');
  }

  const { password: _, ...userProfile } = matched;
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(userProfile));
  notifyAuthListeners(userProfile);
  return { success: true, user: userProfile };
}

/**
 * Register a new resident user (Public sign-up)
 */
export async function registerResident({ name, email, password, flat_no }) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanFlat = flat_no.trim().toUpperCase();

  if (isLiveFirebaseConfigured && auth && db) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const newProfile = {
        uid: cred.user.uid,
        name: name.trim(),
        email: cleanEmail,
        role: USER_ROLES.RESIDENT,
        flat_no: cleanFlat,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(newProfile));
      notifyAuthListeners(newProfile);
      return { success: true, user: newProfile };
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        throw new Error('This email address is already registered in Firebase.');
      }
      console.warn("Live Firebase registration error, checking local store:", err.message);
    }
  }

  // Local fallback registration
  const localUsers = getLocalUsers();
  if (localUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
    throw new Error('An account with this email address already exists.');
  }

  const newLocalUser = {
    uid: `res_${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    password,
    role: USER_ROLES.RESIDENT,
    flat_no: cleanFlat,
    createdAt: new Date().toISOString(),
  };

  localUsers.push(newLocalUser);
  saveLocalUsers(localUsers);

  const { password: _, ...userProfile } = newLocalUser;
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(userProfile));
  notifyAuthListeners(userProfile);
  return { success: true, user: userProfile };
}

/**
 * Sign out current authenticated user
 */
export async function logoutUser() {
  if (isLiveFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Sign out error:", err);
    }
  }
  localStorage.removeItem(LOCAL_SESSION_KEY);
  notifyAuthListeners(null);
  return { success: true };
}

/**
 * Subscribe to authentication state changes
 */
export function subscribeAuthState(callback) {
  authListeners.add(callback);

  let fbUnsubscribe = null;
  if (isLiveFirebaseConfigured && auth) {
    fbUnsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profile = await fetchUserProfile(fbUser.uid);
        callback(profile || { uid: fbUser.uid, email: fbUser.email, role: USER_ROLES.RESIDENT });
      } else {
        const saved = localStorage.getItem(LOCAL_SESSION_KEY);
        callback(saved ? JSON.parse(saved) : null);
      }
    });
  } else {
    const saved = localStorage.getItem(LOCAL_SESSION_KEY);
    callback(saved ? JSON.parse(saved) : null);
  }

  return () => {
    authListeners.delete(callback);
    if (fbUnsubscribe) fbUnsubscribe();
  };
}
