import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await api.get('users/me/');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error("Erreur lors de la récupération du profil", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (token) {
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setLoading(false);
        // Rafraîchir en tâche de fond
        fetchProfile();
      } else {
        fetchProfile();
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('token/', { username, password });
      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Récupérer le vrai profil immédiatement après le login
      const profileRes = await api.get('users/me/');
      const userData = profileRes.data;
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true, role: userData.role };
    } catch (error) {
      console.error('Erreur de connexion', error);
      return { success: false, error: 'Identifiants incorrects' };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
