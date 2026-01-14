import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import OnboardingModal from './OnboardingModal';

export default function RequireProfile({ children }) {
  const { 
    user, 
    candidateProfile, 
    isLoading,
    createProfile 
  } = useAuth();
  
  const [isDismissed, setIsDismissed] = useState(false);
  
  const showOnboarding = !isLoading && !candidateProfile && !isDismissed;

  const handleProfileCreated = (newProfile) => {
    createProfile(newProfile);
    setIsDismissed(false); // Reset dismiss state on profile creation
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (isLoading) {
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

