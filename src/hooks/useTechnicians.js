import { useState, useEffect } from 'react';
import { getTechniciansList } from '../services/userService';

/**
 * View-Model Hook: Fetches available technicians list for Admin allocation
 */
export function useTechnicians() {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTechs = async () => {
    setLoading(true);
    try {
      const list = await getTechniciansList();
      setTechnicians(list || []);
    } catch (err) {
      console.error('Failed to load technicians:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechs();
  }, []);

  return { technicians, loading, refetch: fetchTechs };
}
