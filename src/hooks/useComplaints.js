import { useState, useEffect } from 'react';
import { subscribeComplaintsByRole } from '../services/complaintService';

/**
 * View-Model Hook: Encapsulates the real-time complaints subscription lifecycle
 */
export function useComplaints(user) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setComplaints([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeComplaintsByRole(
      { 
        role: user.role, 
        userId: user.uid,
        userEmail: user.email,
        userName: user.name,
        flatNo: user.flat_no,
      },
      (data) => {
        setComplaints(data || []);
        setLoading(false); // ALWAYS set to false when data arrives
      },
      (error) => {
        console.error("Subscription failed:", error);
        setLoading(false); // ALWAYS set to false on failure
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [user?.role, user?.uid, user?.email, user?.name]);

  return { complaints, loading };
}
