import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('auth');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (auth?.token) {
        try {
          const res = await authApi.getMe();
          if (res.success) {
            setAuth(prev => ({ ...prev, user: res.user }));
          }
        } catch (err) {
          console.error('Token verification failed', err);
          logout();
        }
      }
    };
    verifyToken();
  }, []);

  const login = useCallback(async (email, password, role) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password, role);
      if (res.success) {
        const authData = { 
          token: res.token, 
          user: res.user,
          name: res.user.name,
          role: res.user.role === 'admin' ? 'Administrator' : 'Sales Person',
          roleKey: res.user.role 
        };
        setAuth(authData);
        localStorage.setItem('auth', JSON.stringify(authData));
        return { success: true };
      }
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setAuth(null);
    localStorage.removeItem('auth');
  }, []);

  return (
    <AuthContext.Provider value={{ 
      auth, 
      login, 
      logout, 
      loading,
      isAuthenticated: !!auth && !!auth.token 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
