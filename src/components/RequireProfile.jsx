import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { candidateProfileService } from '../api/services';
import OnboardingModal from './OnboardingModal';

/**
 * RequireProfile - Wrapper component that ensures user has a CandidateProfile
 * 
 * Flow:
 * 1. Check if candidateId exists in context
 * 2. If not, attempt to fetch profile by finding user's email in all candidates
 * 3. If profile not found (404/null), show onboarding modal
 * 4. Once profile is created, dismiss modal and render children
 */
export default function RequireProfile({ children }) {
  const { 
    user, 
    candidateId, 
    updateCandidateProfile, 
    isAuthenticated 
  } = useAuth();
  
  const [isChecking, setIsChecking] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsChecking(false);
      return;
    }

    checkForProfile();
  }, [isAuthenticated, candidateId, user?.email]);

  const checkForProfile = async () => {
    // If we already have a candidateId, verify it's valid
    if (candidateId) {
      try {
        const profile = await candidateProfileService.getProfile(candidateId);
        if (profile) {
          updateCandidateProfile(profile);
          setShowOnboarding(false);
          setIsChecking(false);
          return;
        }
      } catch (error) {
        // Profile might have been deleted or 404, clear the stored ID
        console.error('Failed to fetch profile by ID:', error);
        localStorage.removeItem('candidateId');
      }
    }

    // No candidateId or failed to fetch - try to find by email
    if (user?.email) {
      try {
        const allCandidates = await candidateProfileService.getAllCandidates();
        const candidates = Array.isArray(allCandidates) ? allCandidates : [];
        const existingProfile = candidates.find(
          c => c.email?.toLowerCase() === user.email.toLowerCase()
        );
        
        if (existingProfile) {
          // Found existing profile - store it
          updateCandidateProfile(existingProfile);
          setShowOnboarding(false);
          setIsChecking(false);
          return;
        }
      } catch (error) {
        // API might return 404 or error if no candidates exist
        console.error('Failed to fetch candidates:', error);
      }
    }

    // No profile found - show onboarding
    setShowOnboarding(true);
    setIsChecking(false);
  };

  const handleProfileCreated = (newProfile) => {
    updateCandidateProfile(newProfile);
    setShowOnboarding(false);
  };

  const handleDismiss = () => {
    // Allow dismissing, but profile won't be set
    // User can still browse but some features may not work
    setShowOnboarding(false);
  };

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Setting up your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      {showOnboarding && (
        <OnboardingModal
          userEmail={user?.email}
          onProfileCreated={handleProfileCreated}
          onDismiss={handleDismiss}
        />
      )}
    </>
  );
}
