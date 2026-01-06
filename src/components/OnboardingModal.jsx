import { useState } from 'react';
import { 
  X, 
  Loader2, 
  User, 
  Sparkles, 
  CheckCircle,
  Briefcase,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { candidateProfileService } from '../api/services';

const COUNTRY_CODES = [
  { code: '+1', country: 'US/CA' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'IN' },
  { code: '+234', country: 'NG' },
  { code: '+86', country: 'CN' },
  { code: '+81', country: 'JP' },
  { code: '+49', country: 'DE' },
  { code: '+33', country: 'FR' },
  { code: '+61', country: 'AU' },
  { code: '+55', country: 'BR' },
];

export default function OnboardingModal({ userEmail, onProfileCreated, onDismiss }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: userEmail || '',
    preferredRole: '',
    phoneNumber: '',
    countryPhoneCode: '+1',
    dateOfBirth: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1 = welcome, 2 = form

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!formData.preferredRole.trim()) {
      setError('Preferred role is required');
      return;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare the profile data matching NewCandidateProfileDTO
      const profilePayload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        preferredRole: formData.preferredRole.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        countryPhoneCode: formData.countryPhoneCode,
      };

      // Only include dateOfBirth if provided (optional field)
      if (formData.dateOfBirth) {
        profilePayload.dateOfBirth = formData.dateOfBirth;
      }

      const newProfile = await candidateProfileService.createProfile(profilePayload);
      onProfileCreated(newProfile);
    } catch (err) {
      setError(err.message || 'Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-dark-900/80 backdrop-blur-md"
        onClick={onDismiss}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-xl card p-0 overflow-hidden animate-slide-up shadow-2xl shadow-black/50">
        {/* Close button */}
        <button 
          onClick={onDismiss}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-dark-700/50 hover:bg-dark-600 
                   text-gray-400 hover:text-white transition-colors"
          title="Skip for now"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 1 ? (
          /* Welcome Step */
          <div className="p-8 text-center">
            {/* Animated icon */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary to-accent-secondary 
                            rounded-2xl animate-pulse-soft"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-display font-bold mb-3">
              Welcome to MyJobHuntAI!
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Let's set up your profile so you can start tracking applications 
              and generating AI-powered cover letters.
            </p>

            {/* Benefits list */}
            <div className="text-left max-w-sm mx-auto mb-8 space-y-3">
              {[
                'Track all your job applications',
                'Get AI-generated cover letters',
                'Analyze your resume with AI',
              ].map((benefit, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-3 animate-slide-in-left"
                  style={{ animationDelay: `${i * 100 + 200}ms` }}
                >
                  <CheckCircle className="w-5 h-5 text-accent-success flex-shrink-0" />
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="btn-primary w-full max-w-xs"
            >
              Let's Get Started
            </button>
            
            <button
              onClick={onDismiss}
              className="mt-4 text-sm text-gray-500 hover:text-gray-400 transition-colors"
            >
              Skip for now
            </button>
          </div>
        ) : (
          /* Form Step */
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 p-6 border-b border-dark-600">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary 
                              flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold">Create Your Profile</h2>
                  <p className="text-gray-400 text-sm">Tell us a bit about yourself</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {error && (
                <div className="mb-6 p-4 bg-accent-danger/10 border border-accent-danger/30 rounded-xl animate-fade-in">
                  <p className="text-accent-danger text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className="input-field"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      className="input-field"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-accent-primary" />
                      Email Address *
                    </span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="input-field"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                {/* Preferred Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <span className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-accent-secondary" />
                      Preferred Job Title *
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.preferredRole}
                    onChange={(e) => handleChange('preferredRole', e.target.value)}
                    className="input-field"
                    placeholder="Software Engineer, Product Manager, etc."
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-accent-success" />
                      Phone Number *
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.countryPhoneCode}
                      onChange={(e) => handleChange('countryPhoneCode', e.target.value)}
                      className="input-field w-28"
                    >
                      {COUNTRY_CODES.map(({ code, country }) => (
                        <option key={code} value={code}>
                          {code} {country}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleChange('phoneNumber', e.target.value)}
                      className="input-field flex-1"
                      placeholder="555-123-4567"
                      required
                    />
                  </div>
                </div>

                {/* Date of Birth (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-accent-warning" />
                      Date of Birth
                      <span className="text-gray-500 text-xs">(Optional)</span>
                    </span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    className="input-field"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-dark-600 bg-dark-800/50">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Create Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
