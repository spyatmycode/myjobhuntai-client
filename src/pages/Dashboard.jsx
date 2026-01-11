import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Search,
  Filter,
  Loader2,
  Ghost,
  Building2,
  Trash2,
  Edit3,
  Sparkles,
  Eye,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { jobApplicationService } from '../api/services';
import Layout from '../components/Layout';
import AddApplicationModal from '../components/AddApplicationModal';
import JobApplicationDetailModal from '../components/JobApplicationDetailModal';

const STATUS_CONFIG = {
  INTERESTED: { 
    class: 'status-interested', 
    icon: Clock,
    label: 'Interested',
    color: 'blue'
  },
  APPLIED: { 
    class: 'status-applied', 
    icon: CheckCircle,
    label: 'Applied',
    color: 'indigo'
  },
  INTERVIEW: { 
    class: 'status-interview', 
    icon: TrendingUp,
    label: 'Interview',
    color: 'green'
  },
  REJECTED: { 
    class: 'status-rejected', 
    icon: XCircle,
    label: 'Rejected',
    color: 'red'
  },
  GHOSTED: { 
    class: 'status-ghosted', 
    icon: Ghost,
    label: 'Ghosted',
    color: 'gray'
  },
  OFFER: { 
    class: 'status-offer', 
    icon: Sparkles,
    label: 'Offer',
    color: 'emerald'
  },
};

export default function Dashboard() {
  const { candidateId } = useAuth();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    loadApplications();
  }, [candidateId]);

  const loadApplications = async () => {
    if (!candidateId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await jobApplicationService.getCandidateApplications(candidateId);
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await jobApplicationService.updateStatus(applicationId, newStatus);
      setApplications(apps => 
        apps.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      // Also update selected application if it's the one being changed
      if (selectedApplication?.id === applicationId) {
        setSelectedApplication(prev => ({ ...prev, status: newStatus }));
      }
      setEditingStatus(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (applicationId) => {
    setApplications(apps => apps.filter(app => app.id !== applicationId));
  };

  const handleApplicationUpsert = (upsertedApplication, isUpdate) => {
    if (isUpdate) {
      setApplications(prev => 
        prev.map(app => 
          app.id === upsertedApplication.id ? upsertedApplication : app
        )
      );
    } else {
      setApplications(prev => [upsertedApplication, ...prev]);
    }
    setShowAddModal(false);
    setEditingApplication(null);
  };

  const handleRowClick = (app, e) => {
    // Don't open modal if clicking on action buttons or status dropdown
    if (e.target.closest('button') || e.target.closest('select')) {
      return;
    }
    setSelectedApplication(app);
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || app.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Helper: Check if an application is "effectively ghosted" (APPLIED for > 2 weeks)
  const isEffectivelyGhosted = (app) => {
    if (app.status !== 'APPLIED') return false;
    if (!app.createdAt) return false;
    
    const createdDate = new Date(app.createdAt);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    return createdDate < twoWeeksAgo;
  };

  // Stats calculation with improved response rate logic
  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'APPLIED').length,
    interviews: applications.filter(a => a.status === 'INTERVIEW').length,
    offers: applications.filter(a => a.status === 'OFFER').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
    ghosted: applications.filter(a => a.status === 'GHOSTED').length,
    effectivelyGhosted: applications.filter(isEffectivelyGhosted).length,
  };

  // Response rate calculation:
  // - Denominator: All applications that have been submitted (not just INTERESTED)
  //   = APPLIED + INTERVIEW + OFFER + REJECTED + GHOSTED
  // - Numerator: All applications that received a response (positive or negative)
  //   = INTERVIEW + OFFER + REJECTED + GHOSTED + effectively ghosted APPLIED
  const submittedStatuses = ['APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED', 'GHOSTED'];
  const totalSubmitted = applications.filter(a => submittedStatuses.includes(a.status)).length;
  
  // Responses include: explicit responses + ghosted (marked or effectively)
  const explicitResponses = applications.filter(a => 
    ['INTERVIEW', 'OFFER', 'REJECTED', 'GHOSTED'].includes(a.status)
  ).length;
  const totalResponses = explicitResponses + stats.effectivelyGhosted;

  const responseRate = totalSubmitted > 0 
    ? Math.round((totalResponses / totalSubmitted) * 100) 
    : 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Dashboard</h1>
            <p className="text-gray-400">Track and manage your job applications</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Application
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { 
              label: 'Total Applications', 
              value: stats.total, 
              icon: Briefcase, 
              color: 'from-blue-500 to-blue-600',
              delay: '0',
              subtitle: `${stats.applied} pending`,
              info: 'Total number of job applications you\'re tracking, including all statuses from interested to offer.'
            },
            { 
              label: 'Interviews', 
              value: stats.interviews, 
              icon: TrendingUp, 
              color: 'from-accent-primary to-accent-secondary',
              delay: '100',
              subtitle: stats.offers > 0 ? `${stats.offers} offer${stats.offers > 1 ? 's' : ''}!` : null,
              info: 'Applications where you\'ve secured an interview. A key milestone showing employer interest.'
            },
            { 
              label: 'Offers', 
              value: stats.offers, 
              icon: Sparkles, 
              color: 'from-accent-success to-emerald-600',
              delay: '200',
              subtitle: stats.offers > 0 ? 'Congratulations!' : 'Keep going!',
              info: 'Job offers received. The ultimate goal of your job search journey!'
            },
            { 
              label: 'Response Rate', 
              value: `${responseRate}%`, 
              icon: CheckCircle, 
              color: responseRate >= 50 ? 'from-accent-success to-emerald-600' : 
                     responseRate >= 25 ? 'from-accent-warning to-orange-600' : 
                     'from-gray-500 to-gray-600',
              delay: '300',
              subtitle: `${totalResponses}/${totalSubmitted} responses`,
              info: 'Percentage of submitted applications that received any response (interview, offer, rejection, or ghosted after 2+ weeks).'
            },
          ].map((stat) => (
            <div 
              key={stat.label} 
              className="card p-6 animate-slide-up relative group"
              style={{ animationDelay: `${stat.delay}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} 
                              flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                {/* Info Icon with Tooltip */}
                <div className="relative">
                  <button 
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-dark-700 
                             transition-colors"
                    aria-label={`Info about ${stat.label}`}
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  {/* Tooltip */}
                  <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-dark-700 border border-dark-500 
                                rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 
                                group-hover:visible transition-all duration-200 z-10">
                    <p className="text-sm text-gray-300 leading-relaxed">{stat.info}</p>
                    <div className="absolute -top-2 right-3 w-3 h-3 bg-dark-700 border-l border-t 
                                  border-dark-500 transform rotate-45"></div>
                  </div>
                </div>
              </div>
              <p className="text-3xl font-display font-bold mb-1">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
              {stat.subtitle && (
                <p className="text-gray-500 text-xs mt-1">{stat.subtitle}</p>
              )}
            </div>
          ))}
        </div>

        {/* Applications Table */}
        <div className="card overflow-hidden animate-slide-up animate-delay-400">
          {/* Search and Filter Bar */}
          <div className="p-4 border-b border-dark-600 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by company or job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field w-40"
              >
                <option value="ALL">All Statuses</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-accent-danger mb-4">{error}</p>
              <button onClick={loadApplications} className="btn-secondary">
                Try Again
              </button>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-20">
              <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
              <p className="text-gray-400 mb-6">
                Start tracking your job search by adding your first application
              </p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                Add Your First Application
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-600">
                    <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Company</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Position</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Status</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app, index) => {
                    const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.INTERESTED;
                    const StatusIcon = statusConfig.icon;
                    const appIsEffectivelyGhosted = isEffectivelyGhosted(app);
                    
                    return (
                      <tr 
                        key={app.id} 
                        onClick={(e) => handleRowClick(app, e)}
                        className={`border-b border-dark-700 hover:bg-dark-700/50 transition-colors cursor-pointer
                                  ${appIsEffectivelyGhosted ? 'bg-gray-500/5' : ''}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-dark-600 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <span className="font-medium">{app.companyName}</span>
                              {appIsEffectivelyGhosted && (
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                  <Ghost className="w-3 h-3" />
                                  No response in 2+ weeks
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-300">{app.jobTitle}</span>
                        </td>
                        <td className="py-4 px-6">
                          {editingStatus === app.id ? (
                            <select
                              value={app.status}
                              onChange={(e) => handleStatusChange(app.id, e.target.value)}
                              onBlur={() => setEditingStatus(null)}
                              autoFocus
                              className="input-field text-sm py-1 px-2"
                            >
                              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                <option key={key} value={key}>{config.label}</option>
                              ))}
                            </select>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingStatus(app.id);
                                }}
                                className={`${statusConfig.class} inline-flex items-center gap-1.5 cursor-pointer 
                                          hover:opacity-80 transition-opacity`}
                              >
                                <StatusIcon className="w-3.5 h-3.5" />
                                {statusConfig.label}
                              </button>
                              {appIsEffectivelyGhosted && (
                                <span className="text-gray-500" title="Likely ghosted - no response in 2+ weeks">
                                  <Ghost className="w-4 h-4" />
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedApplication(app);
                              }}
                              className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-white transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingApplication(app);
                              }}
                              className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-white transition-colors"
                              title="Edit Application"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this application?')) {
                                  try {
                                    await jobApplicationService.deleteApplication(app.id);
                                    handleDelete(app.id);
                                  } catch (err) {
                                    setError(err.message);
                                  }
                                }
                              }}
                              className="p-2 rounded-lg hover:bg-accent-danger/10 text-gray-400 hover:text-accent-danger transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Application Modal */}
        {(showAddModal || editingApplication) && (
          <AddApplicationModal
            onClose={() => {
              setShowAddModal(false);
              setEditingApplication(null);
            }}
            onSuccess={handleApplicationUpsert}
            candidateId={candidateId}
            applicationToEdit={editingApplication}
          />
        )}

        {/* Job Application Detail Modal */}
        {selectedApplication && (
          <JobApplicationDetailModal
            application={selectedApplication}
            onClose={() => setSelectedApplication(null)}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </Layout>
  );
}

