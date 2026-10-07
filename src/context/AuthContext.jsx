import React, { createContext, useState, useEffect } from 'react';
import { 
  loginWithEmail, 
  registerResident, 
  logoutUser, 
  subscribeAuthState 
} from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeAuthState((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    return await loginWithEmail(email, password);
  };

  const register = async (userData) => {
    return await registerResident(userData);
  };

  const logout = async () => {
    return await logoutUser();
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
