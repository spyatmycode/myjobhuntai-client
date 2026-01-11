import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, candidateProfileService } from '../api/services';

const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Invalid token:', e);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [candidateId, setCandidateId] = useState(null);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setCandidateId(null);
    setCandidateProfile(null);
    setIsAuthenticated(false);
  }, []);

  const fetchAndSetCandidateProfile = useCallback(async (id) => {
    try {
      const profile = await candidateProfileService.getProfile(id);
      if (profile) {
        setCandidateProfile(profile);
        setCandidateId(profile.id);
        localStorage.setItem('candidateId', profile.id.toString());
      }
      return profile;
    } catch (error) {
      console.error('Failed to fetch candidate profile:', error);
      if (error.message.includes('404')) {
        setCandidateProfile(null);
        localStorage.removeItem('candidateId');
      }
      return null;
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = decodeJwt(token);
      if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
        setIsAuthenticated(true);
        const userData = { email: decodedToken.sub };
        setUser(userData);
        
        const storedCandidateId = localStorage.getItem('candidateId');
        if (storedCandidateId) {
          await fetchAndSetCandidateProfile(parseInt(storedCandidateId, 10));
        }
      } else {
        logout();
      }
    }
    setIsLoading(false);
  }, [logout, fetchAndSetCandidateProfile]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email, password) => {
    try {
      // Login returns { token, data } where data is the candidate profile
      const result = await authService.login(email, password);
      
      const token = result.token;
      if (!token) throw new Error('No token received');
      
      localStorage.setItem('token', token);
      
      const decodedToken = decodeJwt(token);
      if (!decodedToken) throw new Error('Invalid token');

      setIsAuthenticated(true);
      const userData = { email: decodedToken.sub };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // The login response from the old API included the profile.
      // The new one is void. So we must fetch the profile manually.
      // Let's assume the candidateId is now in the token.
      if (decodedToken.candidateId) {
        await fetchAndSetCandidateProfile(decodedToken.candidateId);
      } else {
         // Fallback for old token format or if candidateId is not in token
         const storedCandidateId = localStorage.getItem('candidateId');
         if(storedCandidateId) {
           await fetchAndSetCandidateProfile(parseInt(storedCandidateId, 10));
         }
      }

      return { success: true };
    } catch (error) {
      logout();
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
    updateCandidateProfile,
    fetchAndSetCandidateProfile
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
