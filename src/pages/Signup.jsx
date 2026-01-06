import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup, login } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    const result = await signup(email, password);
    
    if (result.success) {
      // Auto-login after signup, then redirect to dashboard
      // The RequireProfile wrapper will show the onboarding modal
      const loginResult = await login(email, password);
      if (loginResult.success) {
        navigate('/dashboard');
      } else {
        setError('Account created. Please login.');
        navigate('/login');
      }
    } else {
      setError(result.error || 'Failed to create account');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-secondary/20 via-dark-900 to-accent-primary/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="animate-slide-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary 
                            flex items-center justify-center shadow-lg shadow-accent-primary/25">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-display text-3xl font-bold">MyJobHuntAI</h1>
            </div>
            
            <h2 className="text-4xl font-display font-bold mb-4 leading-tight">
              Start Your<br />
              <span className="text-gradient">Job Hunt Journey</span>
            </h2>
            
            <p className="text-gray-400 text-lg max-w-md">
              Join thousands of job seekers using AI to accelerate their career.
            </p>
          </div>
          
          {/* Steps indicator */}
          <div className="mt-12 space-y-4 animate-slide-up animate-delay-200">
            {[
              { num: 1, label: 'Create your account', active: true },
              { num: 2, label: 'Set up your profile', active: false },
              { num: 3, label: 'Upload your resume', active: false },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                              ${s.active 
                                ? 'bg-accent-primary text-white' 
                                : 'bg-dark-600 text-gray-400'}`}
                >
                  {s.num}
                </div>
                <span className={s.active ? 'text-white' : 'text-gray-500'}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary 
                          flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold">MyJobHuntAI</h1>
          </div>

          <div className="card p-8">
            <h2 className="text-2xl font-display font-bold mb-2">Create Account</h2>
            <p className="text-gray-400 mb-8">Start your journey to your dream job</p>

            {error && (
              <div className="mb-6 p-4 bg-accent-danger/10 border border-accent-danger/30 rounded-xl">
                <p className="text-accent-danger text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-primary hover:text-accent-secondary transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
