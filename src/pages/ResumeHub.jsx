import { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Plus, 
  Trash2, 
  ExternalLink,
  Loader2,
  Sparkles,
  Code,
  User,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resumeService } from '../api/services';
import Layout from '../components/Layout';
import UploadResumeModal from '../components/UploadResumeModal';
import ResumePreviewModal from '../components/ResumePreviewModal';

export default function ResumeHub() {
  const { candidateId } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [previewResume, setPreviewResume] = useState(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setIsLoading(true);
      const data = await resumeService.getCandidateResumes();
      setResumes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (resumeId) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    
    try {
      await resumeService.deleteResume(resumeId);
      setResumes(prev => prev.filter(r => r.id !== resumeId));
      if (selectedResume?.id === resumeId) {
        setSelectedResume(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUploadSuccess = (newResume, summary) => {
    // newResume is from response.data.data which is AIResumeSummaryResponse
    // It contains: professionalSummary, skills, id, resumeUrl
    
    // We need to create a resume object for the list
    const resumeForList = {
      id: summary.id,
      title: newResume.title || 'New Resume',
      resumeSummary: summary.professionalSummary,
      skills: summary.skills,
      filePath: summary.resumeUrl,
    };
    
    setResumes(prev => [resumeForList, ...prev]);
    setAiSummary(summary);
    setShowUploadModal(false);
  };

  const handleViewSummary = (resume) => {
    setSelectedResume(resume);
    setAiSummary({
      professionalSummary: resume.resumeSummary,
      skills: resume.skills,
    });
  };

  const handlePreviewResume = (resume, e) => {
    e?.stopPropagation();
    setPreviewResume(resume);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Resume Hub</h1>
            <p className="text-gray-400">Manage your resumes and view AI-generated summaries</p>
          </div>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Upload Resume
          </button>
        </div>

        {/* AI Summary Display */}
        {aiSummary && (
          <div className="card p-6 mb-8 animate-slide-up border-accent-primary/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary 
                            flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-display font-semibold">AI Resume Analysis</h2>
                <p className="text-gray-400 text-sm">Powered by AI to highlight your strengths</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Professional Summary */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <User className="w-5 h-5 text-accent-primary" />
                  <span className="font-medium">Professional Summary</span>
                </div>
                <p className="text-gray-400 leading-relaxed bg-dark-700/50 rounded-xl p-4">
                  {aiSummary.professionalSummary || 'No summary available'}
                </p>
              </div>
              
              {/* Skills */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <Code className="w-5 h-5 text-accent-secondary" />
                  <span className="font-medium">Key Skills</span>
                </div>
                <div className="bg-dark-700/50 rounded-xl p-4">
                  {aiSummary.skills ? (
                    <div className="flex flex-wrap gap-2">
                      {aiSummary.skills.split(',').map((skill, i) => (
                        <span 
                          key={i}
                          className="px-3 py-1 bg-dark-600 rounded-lg text-sm text-gray-300"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No skills extracted</p>
                  )}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setAiSummary(null)}
              className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Resumes Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-accent-danger mb-4">{error}</p>
            <button onClick={loadResumes} className="btn-secondary">
              Try Again
            </button>
          </div>
        ) : resumes.length === 0 ? (
          <div className="card p-12 text-center animate-fade-in">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No resumes uploaded</h3>
            <p className="text-gray-400 mb-6">
              Upload your first resume to get AI-powered insights
            </p>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="btn-primary"
            >
              Upload Your Resume
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Upload New Card */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="card-hover p-6 border-2 border-dashed border-dark-500 hover:border-accent-primary/50 
                       flex flex-col items-center justify-center min-h-[200px] group transition-all duration-300
                       animate-fade-in"
            >
              <div className="w-14 h-14 rounded-xl bg-dark-700 group-hover:bg-accent-primary/10 
                            flex items-center justify-center transition-colors mb-4">
                <Plus className="w-7 h-7 text-gray-400 group-hover:text-accent-primary transition-colors" />
              </div>
              <span className="font-medium text-gray-400 group-hover:text-white transition-colors">
                Upload New Resume
              </span>
            </button>

            {/* Resume Cards */}
            {resumes.map((resume, index) => (
              <div 
                key={resume.id}
                className="card-hover p-6 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 
                                flex items-center justify-center">
                    <FileText className="w-6 h-6 text-accent-primary" />
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Preview Button */}
                    <button
                      onClick={(e) => handlePreviewResume(resume, e)}
                      className="p-2 rounded-lg hover:bg-accent-primary/10 text-gray-400 hover:text-accent-primary transition-colors"
                      title="Preview Resume"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {resume.filePath && (
                      <a
                        href={resume.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg hover:bg-dark-600 text-gray-400 hover:text-white transition-colors"
                        title="Open in New Tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(resume.id);
                      }}
                      className="p-2 rounded-lg hover:bg-accent-danger/10 text-gray-400 hover:text-accent-danger transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 
                  className="font-semibold text-lg mb-2 truncate cursor-pointer hover:text-accent-primary transition-colors"
                  onClick={() => handleViewSummary(resume)}
                >
                  {resume.title}
                </h3>
                
                {resume.resumeSummary && (
                  <p 
                    className="text-gray-400 text-sm line-clamp-3 mb-4 cursor-pointer hover:text-gray-300 transition-colors"
                    onClick={() => handleViewSummary(resume)}
                  >
                    {resume.resumeSummary}
                  </p>
                )}
                
                {resume.skills && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {resume.skills.split(',').slice(0, 3).map((skill, i) => (
                      <span 
                        key={i}
                        className="px-2 py-0.5 bg-dark-700 rounded text-xs text-gray-400"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                    {resume.skills.split(',').length > 3 && (
                      <span className="px-2 py-0.5 bg-dark-700 rounded text-xs text-gray-400">
                        +{resume.skills.split(',').length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Preview PDF Button */}
                {resume.filePath && (
                  <button
                    onClick={(e) => handlePreviewResume(resume, e)}
                    className="w-full py-2 px-4 rounded-lg bg-dark-700 hover:bg-dark-600 
                             text-gray-400 hover:text-white text-sm font-medium 
                             flex items-center justify-center gap-2 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Preview PDF
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <UploadResumeModal
            onClose={() => setShowUploadModal(false)}
            onSuccess={handleUploadSuccess}
          />
        )}

        {/* Resume Preview Modal */}
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
