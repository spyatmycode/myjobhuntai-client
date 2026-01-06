import { useState } from 'react';
import { 
  X, 
  Building2, 
  Briefcase, 
  FileText, 
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Ghost,
  Trash2,
  Loader2,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { jobApplicationService } from '../api/services';

const STATUS_CONFIG = {
  INTERESTED: { 
    class: 'status-interested', 
    icon: Clock,
    label: 'Interested',
    bgClass: 'bg-blue-500/10 border-blue-500/30'
  },
  APPLIED: { 
    class: 'status-applied', 
    icon: CheckCircle,
    label: 'Applied',
    bgClass: 'bg-accent-primary/10 border-accent-primary/30'
  },
  INTERVIEW: { 
    class: 'status-interview', 
    icon: TrendingUp,
    label: 'Interview',
    bgClass: 'bg-accent-success/10 border-accent-success/30'
  },
  REJECTED: { 
    class: 'status-rejected', 
    icon: XCircle,
    label: 'Rejected',
    bgClass: 'bg-accent-danger/10 border-accent-danger/30'
  },
  GHOSTED: { 
    class: 'status-ghosted', 
    icon: Ghost,
    label: 'Ghosted',
    bgClass: 'bg-gray-500/10 border-gray-500/30'
  },
  OFFER: { 
    class: 'status-offer', 
    icon: Sparkles,
    label: 'Offer',
    bgClass: 'bg-emerald-500/10 border-emerald-500/30'
  },
};

export default function JobApplicationDetailModal({ 
  application, 
  onClose, 
  onDelete,
  onStatusChange 
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);

  if (!application) return null;

  const statusConfig = STATUS_CONFIG[application.status] || STATUS_CONFIG.INTERESTED;
  const StatusIcon = statusConfig.icon;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await jobApplicationService.deleteApplication(application.id);
      onDelete?.(application.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete application:', error);
      alert('Failed to delete application. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await jobApplicationService.updateStatus(application.id, newStatus);
      onStatusChange?.(application.id, newStatus);
      setEditingStatus(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleCopyCoverLetter = () => {
    if (application.aiCoverLetter) {
      navigator.clipboard.writeText(application.aiCoverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
      <div className="relative w-full max-w-2xl card p-0 overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-dark-600 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-dark-700 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold">{application.companyName}</h2>
                <p className="text-gray-400">{application.jobTitle}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Status Badge */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
            {editingStatus ? (
              <select
                value={application.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                onBlur={() => setEditingStatus(false)}
                autoFocus
                className="input-field w-48"
              >
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            ) : (
              <button
                onClick={() => setEditingStatus(true)}
                className={`${statusConfig.class} inline-flex items-center gap-2 cursor-pointer 
                          hover:opacity-80 transition-opacity`}
              >
                <StatusIcon className="w-4 h-4" />
                {statusConfig.label}
                <span className="text-xs opacity-60">(click to change)</span>
              </button>
            )}
          </div>

          {/* Job Description */}
          {application.jobDescription && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Job Description
              </label>
              <div className="bg-dark-700/50 rounded-xl p-4 max-h-48 overflow-y-auto">
                <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                  {application.jobDescription}
                </p>
              </div>
            </div>
          )}

          {/* AI Cover Letter */}
          {application.aiCoverLetter && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-primary" />
                  AI Generated Cover Letter
                </label>
                <button
                  onClick={handleCopyCoverLetter}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                           bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-accent-success" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className={`rounded-xl p-4 border ${statusConfig.bgClass} max-h-64 overflow-y-auto`}>
                <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                  {application.aiCoverLetter}
                </p>
              </div>
            </div>
          )}

          {/* No Cover Letter State */}
          {!application.aiCoverLetter && (
            <div className="mb-6 p-6 border border-dashed border-dark-500 rounded-xl text-center">
              <Sparkles className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No AI cover letter generated yet</p>
              <p className="text-gray-600 text-xs mt-1">
                Go to Applications page to generate one
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-dark-600 flex-shrink-0 bg-dark-800/50">
          <div className="flex items-center justify-between">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-accent-danger 
                       hover:bg-accent-danger/10 transition-colors disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete Application
            </button>
            <button onClick={onClose} className="btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
