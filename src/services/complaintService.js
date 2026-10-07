import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isLiveFirebaseConfigured } from '../config/firebase';
import { USER_ROLES } from '../constants/roles';
import { 
  TICKET_STATUS, 
  TICKET_PRIORITY, 
  PRIORITY_SLA, 
  DEFAULT_COST_ESTIMATES 
} from '../constants/status';
import { INITIAL_SEED_COMPLAINTS, INITIAL_SEED_USERS } from '../utils/seedData';

const LOCAL_COMPLAINTS_KEY = 'society_cms_complaints';
const localSubscribers = new Set();

/**
 * Normalizes complaint documents so both nested and legacy flat fields are always accessible
 */
export function normalizeComplaint(c) {
  if (!c) return null;
  const residentObj = c.resident || {
    uid: c.resident_id || '',
    name: c.resident_name || 'Resident',
    flatNo: c.resident_flat_no || c.location?.flatNo || 'Unit',
  };

  const technicianObj = c.technician || {
    uid: c.technician_id || null,
    seedUid: c.technician_seed_uid || null,
    name: c.technician_name || null,
    email: c.technician_email || null,
    assignedAt: c.assignedAt || null,
  };

  const locationObj = c.location || {
    tower: c.tower || (residentObj.flatNo?.startsWith('A') ? 'Tower A' : 'Tower B'),
    flatNo: residentObj.flatNo,
  };

  const priority = c.priority || TICKET_PRIORITY.P3_MODERATE;
  const slaHours = c.slaHours || PRIORITY_SLA[priority] || 24;
  const tokenNumber = c.tokenNumber || `TKN-${Math.abs(hashString(c.id || '')).toString().slice(0, 6).padEnd(6, '7')}`;
  const ticketId = c.ticketId || `CMS-${(c.id || '').toString().slice(-4).toUpperCase()}`;

  return {
    ...c,
    tokenNumber,
    ticketId,
    priority,
    slaHours,
    costEstimate: c.costEstimate || DEFAULT_COST_ESTIMATES[c.category] || 'Society Covered',
    location: locationObj,
    resident: residentObj,
    technician: technicianObj,
    // Backward compatibility aliases
    resident_id: residentObj.uid,
    resident_name: residentObj.name,
    resident_flat_no: residentObj.flatNo,
    technician_id: technicianObj.uid,
    technician_name: technicianObj.name,
    technician_email: technicianObj.email || c.technician_email || null,
    rating: c.rating || null,
    feedbackText: c.feedbackText || null,
  };
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash || 749201;
}

function getLocalComplaints() {
  const data = localStorage.getItem(LOCAL_COMPLAINTS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_COMPLAINTS_KEY, JSON.stringify(INITIAL_SEED_COMPLAINTS));
    return INITIAL_SEED_COMPLAINTS.map(normalizeComplaint);
  }
  try {
    const parsed = JSON.parse(data);
    return parsed.map(normalizeComplaint);
  } catch {
    return INITIAL_SEED_COMPLAINTS.map(normalizeComplaint);
  }
}

export function clearAllComplaints() {
  localStorage.setItem(LOCAL_COMPLAINTS_KEY, JSON.stringify([]));
  localSubscribers.forEach((sub) => sub.notify());
  return true;
}

function saveLocalComplaints(complaints) {
  localStorage.setItem(LOCAL_COMPLAINTS_KEY, JSON.stringify(complaints));
  localSubscribers.forEach((sub) => sub.notify());
}

/**
 * Create a new complaint ticket with enterprise schema
 */
export async function createComplaint(ticketData) {
  const allCurrent = getLocalComplaints();
  const counter = 1040 + allCurrent.length + 1;
  const tokenNumber = `TKN-${Math.floor(100000 + Math.random() * 900000)}`;
  const ticketId = `CMS-${counter}`;
  const priority = ticketData.priority || TICKET_PRIORITY.P3_MODERATE;
  const slaHours = PRIORITY_SLA[priority] || 24;
  const category = ticketData.category || 'Plumbing';
  const costEstimate = ticketData.costEstimate || DEFAULT_COST_ESTIMATES[category] || 'Society Covered';

  const flatNo = ticketData.resident_flat_no || ticketData.flatNo || 'A-101';
  const tower = ticketData.tower || (flatNo.startsWith('A') ? 'Tower A' : 'Tower B');

  const newTicket = {
    tokenNumber,
    ticketId,
    title: ticketData.title.trim(),
    description: ticketData.description.trim(),
    category,
    priority,
    status: TICKET_STATUS.PENDING,
    slaHours,
    costEstimate,
    location: {
      tower,
      flatNo,
    },
    resident: {
      uid: ticketData.resident_id || '',
      name: ticketData.resident_name || 'Resident',
      flatNo,
    },
    technician: {
      uid: null,
      name: null,
      assignedAt: null,
    },
    rating: null,
    feedbackText: null,
    createdAt: new Date().toISOString(),
    resolvedAt: null,
    // Compatibility fields
    resident_id: ticketData.resident_id,
    resident_name: ticketData.resident_name,
    resident_flat_no: flatNo,
    technician_id: null,
    technician_name: null,
  };

  if (isLiveFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, 'complaints'), {
        ...newTicket,
        createdAt: serverTimestamp(),
      });
      return normalizeComplaint({ id: docRef.id, ...newTicket });
    } catch (err) {
      console.warn('Live Firebase addDoc failed, writing locally:', err);
    }
  }

  // Local storage write
  const created = normalizeComplaint({
    ...newTicket,
    id: `ticket_${Date.now()}`,
  });
  allCurrent.unshift(created);
  saveLocalComplaints(allCurrent);
  return created;
}

/**
 * Helper to parse various timestamp formats
 */
function parseTimestamp(val) {
  if (!val) return 0;
  if (val.seconds) return val.seconds * 1000;
  if (typeof val === 'string') return new Date(val).getTime();
  if (val instanceof Date) return val.getTime();
  return 0;
}

export function matchesTechnician(c, { userId, userEmail, userName } = {}) {
  if (!c) return false;
  const techUid = c.technician?.uid || c.technician_id;
  const techSeedUid = c.technician?.seedUid;
  const techEmail = (c.technician?.email || c.technician_email || '').toLowerCase();
  const techName = (c.technician?.name || c.technician_name || '').toLowerCase();

  const cleanEmail = (userEmail || '').toLowerCase();
  const cleanName = (userName || '').toLowerCase();

  // 1. Direct UID match
  if (userId && (techUid === userId || techSeedUid === userId)) return true;

  // 2. Lookup seed user if user logged in with email/name
  const seedMatch = INITIAL_SEED_USERS.find(
    (u) => (cleanEmail && u.email.toLowerCase() === cleanEmail) || (cleanName && u.name.toLowerCase() === cleanName)
  );
  if (seedMatch) {
    if (techUid === seedMatch.uid || techSeedUid === seedMatch.uid) return true;
    if (techEmail && techEmail === seedMatch.email.toLowerCase()) return true;
    if (techName && techName === seedMatch.name.toLowerCase()) return true;
  }

  // 3. Email match
  if (cleanEmail && techEmail && techEmail === cleanEmail) return true;

  // 4. Name match
  if (cleanName && techName && techName === cleanName) return true;

  return false;
}

function filterLocalComplaints(role, filterParams = {}) {
  const { userId, userEmail, userName, flatNo } = typeof filterParams === 'object' ? filterParams : { userId: filterParams };
  const all = getLocalComplaints();
  let filtered = [];

  if (role === USER_ROLES.RESIDENT || role === 'resident') {
    filtered = all.filter((c) => {
      if (userId && (c.resident_id === userId || c.resident?.uid === userId)) return true;
      if (flatNo && (c.location?.flatNo === flatNo || c.resident?.flatNo === flatNo || c.resident_flat_no === flatNo)) return true;
      return false;
    });
  } else if (role === USER_ROLES.TECHNICIAN || role === 'technician') {
    filtered = all.filter((c) => matchesTechnician(c, { userId, userEmail, userName }));
  } else {
    filtered = [...all];
  }

  filtered.sort((a, b) => parseTimestamp(b.createdAt) - parseTimestamp(a.createdAt));
  return filtered.map(normalizeComplaint);
}

/**
 * Real-time subscription to complaints filtered by user role
 * Queries without composite index requirement to prevent missing index rejections in Firestore.
 */
export function subscribeComplaintsByRole(params = {}, onData, onError) {
  const role = params?.role;
  const userId = params?.userId;
  const userEmail = params?.userEmail;
  const userName = params?.userName;
  const flatNo = params?.flatNo;
  const filterParams = { userId, userEmail, userName, flatNo };

  // 1. Instantly provide current local data so UI loads with 0ms delay
  const initialLocal = filterLocalComplaints(role, filterParams);
  onData(initialLocal);

  // 2. Register local observer to guarantee instant updates on ticket assignment, creation, or status changes
  const localSubscriber = {
    notify: () => {
      const freshLocal = filterLocalComplaints(role, filterParams);
      onData(freshLocal);
    },
  };
  localSubscribers.add(localSubscriber);

  let firestoreUnsubscribe = null;

  if (isLiveFirebaseConfigured && db) {
    try {
      const complaintsRef = collection(db, 'complaints');
      let q;

      if ((role === USER_ROLES.RESIDENT || role === 'resident') && userId) {
        q = query(complaintsRef, where('resident.uid', '==', userId));
      } else {
        // Query all complaints and let in-memory filter isolate technician records reliably
        q = query(complaintsRef);
      }

      firestoreUnsubscribe = onSnapshot(
        q,
        (snapshot) => {
          let items = snapshot.docs.map((doc) =>
            normalizeComplaint({
              id: doc.id,
              ...doc.data(),
            })
          );
          if (role === USER_ROLES.TECHNICIAN || role === 'technician') {
            items = items.filter((c) => matchesTechnician(c, filterParams));
          } else if (role === USER_ROLES.RESIDENT || role === 'resident') {
            if (userId) {
              items = items.filter((c) => c.resident_id === userId || c.resident?.uid === userId);
            }
          }

          // Merge Firestore records with local store so seed records & offline edits remain intact
          const currentLocal = filterLocalComplaints(role, filterParams);
          const mergedMap = new Map();
          currentLocal.forEach((c) => mergedMap.set(c.id, c));
          items.forEach((c) => mergedMap.set(c.id, c));

          const merged = Array.from(mergedMap.values());
          merged.sort((a, b) => parseTimestamp(b.createdAt) - parseTimestamp(a.createdAt));
          onData(merged);
        },
        (err) => {
          console.warn("Firestore subscription notice (using local store):", err?.message);
          if (onError) onError(err);
          const fallback = filterLocalComplaints(role, filterParams);
          onData(fallback);
        }
      );
    } catch (err) {
      console.warn("Setting up Firestore query notice (using local store):", err?.message);
      if (onError) onError(err);
      const fallback = filterLocalComplaints(role, filterParams);
      onData(fallback);
    }
  }

  return () => {
    localSubscribers.delete(localSubscriber);
    if (typeof firestoreUnsubscribe === 'function') {
      firestoreUnsubscribe();
    }
  };
}

/**
 * Seed realistic sample incident cards for a specific resident (e.g., Rohit, Unit A-104)
 */
export async function seedSampleIncidentCards(user) {
  const uid = user?.uid || 'res_user_rohit';
  const name = user?.name || 'Rohit';
  const flatNo = user?.flat_no || 'A-104';
  const tower = user?.tower || 'Tower A';

  const sampleTickets = [
    {
      tokenNumber: 'TKN-749201',
      ticketId: 'CMS-1042',
      title: 'Severe PVC drain pipe burst under kitchen sink',
      description: 'Main PVC drain pipe under the sink fractured and is causing active water pooling into the lower modular cabinet. Needs immediate valve inspection and joint replacement.',
      category: 'Plumbing',
      priority: TICKET_PRIORITY.P1_CRITICAL,
      status: TICKET_STATUS.PENDING,
      slaHours: 4,
      costEstimate: '₹350 (Parts/Labor)',
      location: { tower, flatNo },
      resident: { uid, name, flatNo },
      technician: { uid: null, name: null, assignedAt: null },
      resident_id: uid,
      resident_name: name,
      resident_flat_no: flatNo,
      technician_id: null,
      technician_name: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      tokenNumber: 'TKN-812049',
      ticketId: 'CMS-1043',
      title: 'Intermittent master bedroom MCB circuit breaker tripping',
      description: 'The 16A miniature circuit breaker trips repeatedly when the air conditioner compressor kicks on. Suspected faulty MCB switch or phase imbalance.',
      category: 'Electrical',
      priority: TICKET_PRIORITY.P2_HIGH,
      status: TICKET_STATUS.ASSIGNED,
      slaHours: 12,
      costEstimate: 'Society Covered',
      location: { tower, flatNo },
      resident: { uid, name, flatNo },
      technician: { uid: 'tech_user_001', name: 'Ramesh Kumar', assignedAt: new Date(Date.now() - 3600000).toISOString() },
      resident_id: uid,
      resident_name: name,
      resident_flat_no: flatNo,
      technician_id: 'tech_user_001',
      technician_name: 'Ramesh Kumar',
      assignedAt: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      tokenNumber: 'TKN-394812',
      ticketId: 'CMS-1039',
      title: 'Main entrance door smart lock latch alignment issue',
      description: 'The motorized bolt jams against the strike plate on closing, draining battery rapidly and triggering warning chime.',
      category: 'Security',
      priority: TICKET_PRIORITY.P3_MODERATE,
      status: TICKET_STATUS.RESOLVED,
      slaHours: 24,
      costEstimate: 'Society Covered',
      location: { tower, flatNo },
      resident: { uid, name, flatNo },
      technician: { uid: 'tech_user_004', name: 'Anil Sharma', assignedAt: new Date(Date.now() - 86400000).toISOString() },
      resident_id: uid,
      resident_name: name,
      resident_flat_no: flatNo,
      technician_id: 'tech_user_004',
      technician_name: 'Anil Sharma',
      assignedAt: new Date(Date.now() - 86400000).toISOString(),
      resolvedAt: new Date(Date.now() - 43200000).toISOString(),
      rating: 5,
      feedbackText: 'Great service! Anil fixed the latch within 2 hours of dispatch.',
      createdAt: new Date(Date.now() - 90000000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  if (isLiveFirebaseConfigured && db) {
    try {
      for (const t of sampleTickets) {
        await addDoc(collection(db, 'complaints'), {
          ...t,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn('Writing sample cards to live Firestore failed, saving locally:', err);
    }
  }

  // Also write to local storage
  const current = getLocalComplaints();
  const normalizedSamples = sampleTickets.map((t, idx) =>
    normalizeComplaint({ ...t, id: `seed_rohit_${Date.now()}_${idx}` })
  );
  saveLocalComplaints([...normalizedSamples, ...current]);
  return normalizedSamples;
}

/**
 * Assign a technician to a complaint
 */
export async function assignTechnicianToComplaint(complaintId, { techId, techName, techEmail, costEstimate }) {
  const assignedAt = new Date().toISOString();

  const foundSeed = INITIAL_SEED_USERS.find(
    (u) => u.uid === techId || (techEmail && u.email?.toLowerCase() === techEmail.toLowerCase()) || u.name === techName
  );
  const finalEmail = techEmail || foundSeed?.email || null;
  const finalSeedUid = foundSeed?.uid || techId;

  if (isLiveFirebaseConfigured && db) {
    try {
      const complaintRef = doc(db, 'complaints', complaintId);
      const updatePayload = {
        technician: {
          uid: techId,
          seedUid: finalSeedUid,
          name: techName,
          email: finalEmail,
          assignedAt: serverTimestamp(),
        },
        technician_id: techId,
        technician_name: techName,
        technician_email: finalEmail,
        status: TICKET_STATUS.ASSIGNED,
        assignedAt: serverTimestamp(),
      };
      if (costEstimate) updatePayload.costEstimate = costEstimate;
      await updateDoc(complaintRef, updatePayload);
      return { success: true };
    } catch (err) {
      console.warn('Live Firebase update failed, writing locally:', err);
    }
  }

  const complaints = getLocalComplaints();
  const updated = complaints.map((c) => {
    if (c.id === complaintId) {
      return normalizeComplaint({
        ...c,
        technician_id: techId,
        technician_name: techName,
        technician_email: finalEmail,
        technician: {
          uid: techId,
          seedUid: finalSeedUid,
          name: techName,
          email: finalEmail,
          assignedAt,
        },
        costEstimate: costEstimate || c.costEstimate,
        status: TICKET_STATUS.ASSIGNED,
        assignedAt,
      });
    }
    return c;
  });
  saveLocalComplaints(updated);
  return { success: true };
}

/**
 * Update complaint status with arbitrary valid transition (Admin / Technician)
 */
export async function updateComplaintStatus(complaintId, status) {
  const updatedAt = new Date().toISOString();

  if (isLiveFirebaseConfigured && db) {
    try {
      const complaintRef = doc(db, 'complaints', complaintId);
      const payload = {
        status,
        updatedAt: serverTimestamp(),
      };
      if (status === TICKET_STATUS.RESOLVED || status === 'Resolved') {
        payload.resolvedAt = serverTimestamp();
      }
      await updateDoc(complaintRef, payload);
      return { success: true };
    } catch (err) {
      console.warn('Live Firebase status update failed, writing locally:', err);
    }
  }

  const complaints = getLocalComplaints();
  const updated = complaints.map((c) => {
    if (c.id === complaintId) {
      const item = {
        ...c,
        status,
        updatedAt,
      };
      if (status === TICKET_STATUS.RESOLVED || status === 'Resolved') {
        item.resolvedAt = updatedAt;
      }
      return normalizeComplaint(item);
    }
    return c;
  });
  saveLocalComplaints(updated);
  return { success: true };
}

/**
 * Cancel / Delete a complaint within the allowed cancellation window
 */
export async function cancelComplaint(complaintId) {
  if (isLiveFirebaseConfigured && db) {
    try {
      const complaintRef = doc(db, 'complaints', complaintId);
      await deleteDoc(complaintRef);
      return { success: true };
    } catch (err) {
      console.warn('Live Firebase deleteDoc failed, trying local delete:', err);
    }
  }

  const complaints = getLocalComplaints();
  const filtered = complaints.filter((c) => c.id !== complaintId);
  saveLocalComplaints(filtered);
  return { success: true };
}

/**
 * Mark a complaint as resolved
 */
export async function markComplaintResolved(complaintId) {
  return updateComplaintStatus(complaintId, TICKET_STATUS.RESOLVED);
}

/**
 * Submit star rating and feedback review for a resolved ticket
 */
export async function submitComplaintRating(complaintId, { rating, feedbackText }) {
  if (isLiveFirebaseConfigured && db) {
    try {
      const complaintRef = doc(db, 'complaints', complaintId);
      await updateDoc(complaintRef, {
        rating: Number(rating),
        feedbackText: feedbackText.trim(),
        reviewedAt: serverTimestamp(),
      });
      return { success: true };
    } catch (err) {
      console.warn('Live Firebase rating update failed, writing locally:', err);
    }
  }

  const complaints = getLocalComplaints();
  const updated = complaints.map((c) => {
    if (c.id === complaintId) {
      return normalizeComplaint({
        ...c,
        rating: Number(rating),
        feedbackText: feedbackText.trim(),
        reviewedAt: new Date().toISOString(),
      });
    }
    return c;
  });
  saveLocalComplaints(updated);
  return { success: true };
}

/**
 * Utility helper to reset complaints back to realistic telemetry samples
 */
export function resetComplaintsToSeed() {
  localStorage.setItem(LOCAL_COMPLAINTS_KEY, JSON.stringify(INITIAL_SEED_COMPLAINTS));
  localSubscribers.forEach((sub) => sub.notify());
}
