import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RequireProfile from './components/RequireProfile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ResumeHub from './pages/ResumeHub';
import Applications from './pages/Applications';
import Settings from './pages/Settings';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/signup" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />} 
      />

      {/* Protected routes - wrapped with RequireProfile for onboarding */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <RequireProfile>
              <Dashboard />
            </RequireProfile>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/resumes" 
        element={
          <ProtectedRoute>
            <RequireProfile>
              <ResumeHub />
            </RequireProfile>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/applications" 
        element={
          <ProtectedRoute>
            <RequireProfile>
              <Applications />
            </RequireProfile>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <RequireProfile>
              <Settings />
            </RequireProfile>
          </ProtectedRoute>
        } 
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
