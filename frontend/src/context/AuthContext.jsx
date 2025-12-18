import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        setUser(JSON.parse(storedUser));
      } else {
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    console.log('Login response:', response);
    
    // Handle different response structures
    const responseData = response.data?.data || response.data;
    const userData = responseData?.user || responseData;
    const accessToken = responseData?.accessToken;
    
    console.log('User data:', userData);
    console.log('Access token:', accessToken);
    
    if (userData) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
    }
    
    return response.data;
  };

  const register = async (userData) => {
    const { data } = await authAPI.register(userData);
    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    }
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

