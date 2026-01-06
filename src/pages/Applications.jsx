import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Loader2,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Ghost,
  FileText,
  Sparkles,
  X,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { jobApplicationService, aiService, resumeService } from '../api/services';
import Layout from '../components/Layout';
import ResumePreviewModal from '../components/ResumePreviewModal';

const STATUS_CONFIG = {
  INTERESTED: { class: 'status-interested', icon: Clock, label: 'Interested' },
  APPLIED: { class: 'status-applied', icon: CheckCircle, label: 'Applied' },
  INTERVIEW: { class: 'status-interview', icon: TrendingUp, label: 'Interview' },
  REJECTED: { class: 'status-rejected', icon: XCircle, label: 'Rejected' },
  GHOSTED: { class: 'status-ghosted', icon: Ghost, label: 'Ghosted' },
  OFFER: { class: 'status-offer', icon: Sparkles, label: 'Offer' },
};

export default function Applications() {
  const { candidateId } = useAuth();
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState(null);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [coverLetterResult, setCoverLetterResult] = useState(null);
  const [previewResume, setPreviewResume] = useState(null);

  useEffect(() => {
    loadData();
  }, [candidateId]);

  const loadData = async () => {
    if (!candidateId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [appsData, resumesData] = await Promise.all([
        jobApplicationService.getCandidateApplications(candidateId),
        resumeService.getCandidateResumes()
      ]);
      setApplications(Array.isArray(appsData) ? appsData : []);
      setResumes(Array.isArray(resumesData) ? resumesData : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCoverLetter = async (resumeId) => {
    if (!selectedApp || !candidateId) return;
    
    setIsGeneratingCover(true);
    try {
      const result = await aiService.generateCoverLetter(
        candidateId,
        resumeId,
        selectedApp.id,
        `Cover Letter for ${selectedApp.jobTitle} at ${selectedApp.companyName}`,
        ''
      );
      setCoverLetterResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handlePreviewResume = (resume, e) => {
    e.stopPropagation();
    setPreviewResume(resume);
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || app.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-display font-bold mb-2">Applications</h1>
          <p className="text-gray-400">View detailed information and generate cover letters</p>
        </div>

        {/* Search and Filter */}
        <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-4 animate-slide-up">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
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

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-accent-danger mb-4">{error}</p>
            <button onClick={loadData} className="btn-secondary">Try Again</button>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="card p-12 text-center animate-fade-in">
            <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No applications found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {filteredApplications.map((app, index) => {
              const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.INTERESTED;
              const StatusIcon = statusConfig.icon;
              
              return (
                <div 
                  key={app.id}
                  className="card-hover p-6 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{app.companyName}</h3>
                        <p className="text-gray-400">{app.jobTitle}</p>
                      </div>
                    </div>
                    <span className={`${statusConfig.class} inline-flex items-center gap-1.5`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusConfig.label}
                    </span>
                  </div>
                  
                  {app.jobDescription && (
                    <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                      {app.jobDescription}
                    </p>
                  )}

                  {/* AI Cover Letter Section */}
                  {app.aiCoverLetter ? (
                    <div className="bg-dark-700/50 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2 text-accent-primary">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">AI Cover Letter</span>
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-4">{app.aiCoverLetter}</p>
                    </div>
                  ) : null}
                  
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="btn-ghost w-full flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Cover Letter
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Cover Letter Generation Modal */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => {
              setSelectedApp(null);
              setCoverLetterResult(null);
            }} />
            
            <div className="relative w-full max-w-2xl card p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary 
                                flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold">Generate Cover Letter</h2>
                    <p className="text-gray-400 text-sm">{selectedApp.companyName} - {selectedApp.jobTitle}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedApp(null);
                    setCoverLetterResult(null);
                  }}
                  className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {coverLetterResult ? (
                <div className="space-y-6">
                  {/* Match Percentage */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-dark-700 flex items-center justify-center">
                      <span className="text-2xl font-bold text-accent-success">
                        {coverLetterResult.matchPercentage}%
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">Job Match Score</p>
                      <p className="text-gray-400 text-sm">Based on your resume and the job description</p>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-accent-success mb-2">Matching Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {coverLetterResult.matchingKeywords?.map((kw, i) => (
                          <span key={i} className="px-2 py-1 bg-accent-success/10 text-accent-success text-xs rounded">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-accent-warning mb-2">Missing Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {coverLetterResult.missingKeywords?.map((kw, i) => (
                          <span key={i} className="px-2 py-1 bg-accent-warning/10 text-accent-warning text-xs rounded">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Generated Cover Letter</h4>
                    <div className="bg-dark-700/50 rounded-xl p-4 max-h-60 overflow-y-auto">
                      <p className="text-gray-300 whitespace-pre-wrap text-sm">
                        {coverLetterResult.coverLetter}
                      </p>
                    </div>
                  </div>

                  {/* Interview Tips */}
                  {coverLetterResult.interviewTips?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Interview Tips</h4>
                      <ul className="space-y-2">
                        {coverLetterResult.interviewTips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                            <span className="text-accent-primary mt-1">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setSelectedApp(null);
                      setCoverLetterResult(null);
                    }}
                    className="btn-primary w-full"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 mb-4">Select a resume to generate a tailored cover letter:</p>
                  
                  {resumes.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No resumes found. Upload a resume first.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {resumes.map((resume) => (
                        <div
                          key={resume.id}
                          className="p-4 bg-dark-700/50 hover:bg-dark-700 rounded-xl 
                                   transition-colors flex items-center gap-4"
                        >
                          <div className="w-10 h-10 rounded-lg bg-dark-600 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-accent-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{resume.title}</p>
                            {resume.skills && (
                              <p className="text-gray-400 text-sm truncate">{resume.skills}</p>
                            )}
                          </div>
                          
                          {/* Preview Button - Eye Icon */}
                          {resume.filePath && (
                            <button
                              onClick={(e) => handlePreviewResume(resume, e)}
                              className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-accent-primary 
                                       transition-colors flex-shrink-0"
                              title="Preview Resume"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          )}
                          
                          {/* Generate Button */}
                          <button
                            onClick={() => handleGenerateCoverLetter(resume.id)}
                            disabled={isGeneratingCover}
                            className="px-4 py-2 rounded-lg bg-accent-primary/10 hover:bg-accent-primary/20 
                                     text-accent-primary text-sm font-medium transition-colors 
                                     disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
                          >
                            {isGeneratingCover ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                Use This
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resume Preview Modal - Stacks on top with z-[60] */}
        <ResumePreviewModal
          isOpen={!!previewResume}
          onClose={() => setPreviewResume(null)}
          resumeUrl={previewResume?.filePath}
          title={previewResume?.title || 'Resume Preview'}
        />
      </div>
    </Layout>
  );
}
