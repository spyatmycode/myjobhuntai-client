import { createContext, useContext, useState, useEffect } from 'react';
import { authService, candidateProfileService } from '../api/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [candidateId, setCandidateId] = useState(null);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedCandidateId = localStorage.getItem('candidateId');
    
    if (token) {
      setIsAuthenticated(true);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse stored user:', e);
        }
      }
      if (storedCandidateId) {
        setCandidateId(parseInt(storedCandidateId, 10));
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      setIsAuthenticated(true);
      
      const userData = { email };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // If candidate data is returned, store it
      if (result.data?.id) {
        setCandidateId(result.data.id);
        localStorage.setItem('candidateId', result.data.id.toString());
        setCandidateProfile(result.data);
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password) => {
    try {
      await authService.signup(email, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const createProfile = async (profileData) => {
    try {
      const profile = await candidateProfileService.createProfile(profileData);
      if (profile?.id) {
        setCandidateId(profile.id);
        localStorage.setItem('candidateId', profile.id.toString());
        setCandidateProfile(profile);
      }
      return { success: true, data: profile };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateCandidateProfile = (profile) => {
    setCandidateProfile(profile);
    if (profile?.id) {
      setCandidateId(profile.id);
      localStorage.setItem('candidateId', profile.id.toString());
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setCandidateId(null);
    setCandidateProfile(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    candidateId,
    candidateProfile,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    createProfile,
    setCandidateId,
    updateCandidateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
