import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db, isLiveFirebaseConfigured } from '../config/firebase';
import { USER_ROLES } from '../constants/roles';
import { INITIAL_SEED_USERS } from '../utils/seedData';

// Local storage key for fallback persistence
const LOCAL_USERS_KEY = 'society_cms_users';

function getLocalUsers() {
  const data = localStorage.getItem(LOCAL_USERS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(INITIAL_SEED_USERS));
    return INITIAL_SEED_USERS;
  }
  try {
    const existing = JSON.parse(data);
    INITIAL_SEED_USERS.forEach((seed) => {
      const idx = existing.findIndex((u) => u.email.toLowerCase() === seed.email.toLowerCase());
      if (idx >= 0) {
        existing[idx] = { ...existing[idx], ...seed };
      } else {
        existing.push(seed);
      }
    });
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(existing));
    return existing;
  } catch {
    return INITIAL_SEED_USERS;
  }
}

/**
 * Fetch a user profile by UID
 */
export async function fetchUserProfile(uid) {
  if (isLiveFirebaseConfigured && db) {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return { uid, ...userSnap.data() };
      }
    } catch (err) {
      console.warn('Error fetching Firestore user profile, checking local fallback:', err);
    }
  }

  // Fallback lookup
  const localUsers = getLocalUsers();
  const found = localUsers.find((u) => u.uid === uid);
  return found || null;
}

/**
 * Fetch list of all registered technicians (Admin workflow)
 * Always merges full seed technicians pool so all specialties are available.
 */
export async function getTechniciansList() {
  const seedTechs = INITIAL_SEED_USERS.filter((u) => u.role === USER_ROLES.TECHNICIAN);

  if (isLiveFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', USER_ROLES.TECHNICIAN)
      );
      const snap = await getDocs(q);
      const firestoreTechs = [];
      snap.forEach((d) => {
        firestoreTechs.push({ uid: d.id, ...d.data() });
      });

      const techMap = new Map();
      seedTechs.forEach((t) => techMap.set(t.email.toLowerCase(), t));
      firestoreTechs.forEach((t) => {
        techMap.set(t.email.toLowerCase(), { ...techMap.get(t.email.toLowerCase()), ...t });
      });

      // Background sync: write missing seed technicians to Firestore
      for (const t of seedTechs) {
        if (!firestoreTechs.some((ft) => ft.email.toLowerCase() === t.email.toLowerCase())) {
          try {
            await setDoc(doc(db, 'users', t.uid), {
              uid: t.uid,
              name: t.name,
              email: t.email,
              role: t.role,
              specialty: t.specialty,
              createdAt: new Date().toISOString()
            }, { merge: true });
          } catch {
            // Ignore background firestore write errors
          }
        }
      }

      return Array.from(techMap.values());
    } catch (err) {
      console.warn('Error querying Firestore technicians, falling back to local list:', err);
    }
  }

  // Fallback lookup
  const localUsers = getLocalUsers();
  const localTechs = localUsers.filter((u) => u.role === USER_ROLES.TECHNICIAN);
  const techMap = new Map();
  seedTechs.forEach((t) => techMap.set(t.email.toLowerCase(), t));
  localTechs.forEach((t) => {
    techMap.set(t.email.toLowerCase(), { ...techMap.get(t.email.toLowerCase()), ...t });
  });

  return Array.from(techMap.values());
}
