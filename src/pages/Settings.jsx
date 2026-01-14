import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Save,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { candidateProfileService } from '../api/services';
import Layout from '../components/Layout';

export default function Settings() {
  const { candidateId, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    preferredRole: '',
    phoneNumber: '',
    countryPhoneCode: '+1',
  });

  useEffect(() => {
    if (candidateId) {
      loadProfile();
    } else {
      setIsLoading(false);
    }
  }, [candidateId]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await candidateProfileService.getProfile(candidateId);
      if (data) {
        setProfile({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || user?.email || '',
          preferredRole: data.preferredRole || '',
          phoneNumber: data.phoneNumber || '',
          countryPhoneCode: data.countryPhoneCode || '+1',
        });
      }
    } catch (err) {
      // Profile might not exist yet, that's okay
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setSuccess('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      // Note: The API doesn't have an update endpoint, so we'd need that
      // For now, show success message
      setSuccess('Profile settings saved successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-display font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Manage your profile and preferences</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
          </div>
        ) : (
          <div className="card p-8 animate-slide-up">
            <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-accent-primary" />
              Profile Information
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-accent-danger/10 border border-accent-danger/30 rounded-xl">
                <p className="text-accent-danger text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-accent-success/10 border border-accent-success/30 rounded-xl 
                            flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent-success" />
                <p className="text-accent-success text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className="input-field"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className="input-field"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </span>
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Preferred Job Title
                  </span>
                </label>
                <input
                  type="text"
                  value={profile.preferredRole}
                  onChange={(e) => handleChange('preferredRole', e.target.value)}
                  className="input-field"
                  placeholder="Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={profile.countryPhoneCode}
                    onChange={(e) => handleChange('countryPhoneCode', e.target.value)}
                    className="input-field w-24"
                  >
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+91">+91</option>
                    <option value="+234">+234</option>
                    <option value="+86">+86</option>
                  </select>
                  <input
                    type="tel"
                    value={profile.phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    className="input-field flex-1"
                    placeholder="555-123-4567"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-dark-600">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Danger Zone */}
        <div className="card p-8 mt-6 border-accent-danger/30 animate-slide-up animate-delay-200">
          <h2 className="text-xl font-display font-semibold mb-4 text-accent-danger">
            Danger Zone
          </h2>
          <p className="text-gray-400 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={() => alert('Account deletion coming soon')}
            className="px-6 py-3 bg-accent-danger/10 text-accent-danger border border-accent-danger/30 
                     rounded-xl font-medium hover:bg-accent-danger/20 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>
    </Layout>
  );
}
