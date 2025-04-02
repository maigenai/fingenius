import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (e.g., from localStorage)
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    // This would normally call an API
    // For demo purposes, we'll just check for demo credentials
    if (email === 'demo@example.com' && password === 'password') {
      const user = {
        id: '1',
        email: 'demo@example.com',
        firstName: 'Demo',
        lastName: 'User'
      };
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } else {
      throw new Error('Invalid credentials');
    }
  };

  // Register function
  const register = async (userData) => {
    // This would normally call an API
    // For demo purposes, we'll just simulate a successful registration
    const user = {
      id: '2',
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName
    };
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  const value = {
    currentUser,
    isAuthenticated,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
