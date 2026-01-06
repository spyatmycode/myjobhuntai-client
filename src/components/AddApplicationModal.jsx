import { useState } from 'react';
import { X, Loader2, Briefcase } from 'lucide-react';
import { jobApplicationService } from '../api/services';

const JOB_STATUSES = ['INTERESTED', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED', 'GHOSTED'];

export default function AddApplicationModal({ onClose, onSuccess, candidateId }) {
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [status, setStatus] = useState('INTERESTED');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!candidateId) {
      setError('Please complete your profile first');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const newApplication = await jobApplicationService.addApplication({
        companyName,
        jobTitle,
        jobDescription,
        status,
        candidateId,
      });
      onSuccess(newApplication);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg card p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary 
                          flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-display font-bold">Add Application</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-accent-danger/10 border border-accent-danger/30 rounded-xl">
            <p className="text-accent-danger text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="input-field"
              placeholder="Google, Apple, etc."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="input-field"
              placeholder="Software Engineer"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Job Description *
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="input-field min-h-[120px] resize-none"
              placeholder="Paste the job description here..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-field"
            >
              {JOB_STATUSES.map(s => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
