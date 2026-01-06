import { useState, useRef } from 'react';
import { X, Loader2, Upload, FileText, Sparkles } from 'lucide-react';
import { resumeService } from '../api/services';

export default function UploadResumeModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [optionalPrompt, setOptionalPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or Word document');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    
    setSelectedFile(file);
    setError('');
    
    // Auto-fill title from filename if empty
    if (!title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setTitle(nameWithoutExt);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    if (!title.trim()) {
      setError('Please enter a title for your resume');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // CRITICAL: title and optionalUserPrompt as query params, only file in FormData
      const aiSummary = await resumeService.addResume(
        selectedFile,
        title.trim(),
        optionalPrompt.trim()
      );
      
      // aiSummary contains: { professionalSummary, skills, id, resumeUrl }
      onSuccess({ title: title.trim() }, aiSummary);
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
              <Upload className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-display font-bold">Upload Resume</h2>
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
          {/* File Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                       transition-all duration-200
                       ${dragActive 
                         ? 'border-accent-primary bg-accent-primary/10' 
                         : selectedFile 
                           ? 'border-accent-success bg-accent-success/5'
                           : 'border-dark-500 hover:border-dark-500 hover:bg-dark-700/50'}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-xl bg-accent-success/20 flex items-center justify-center mb-3">
                  <FileText className="w-7 h-7 text-accent-success" />
                </div>
                <p className="font-medium text-white mb-1">{selectedFile.name}</p>
                <p className="text-sm text-gray-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="mt-3 text-sm text-accent-danger hover:underline"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-xl bg-dark-600 flex items-center justify-center mb-3">
                  <Upload className="w-7 h-7 text-gray-400" />
                </div>
                <p className="font-medium text-white mb-1">
                  Drop your resume here or click to browse
                </p>
                <p className="text-sm text-gray-400">
                  Supports PDF, DOC, DOCX (max 10MB)
                </p>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Resume Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="e.g., Software Engineer Resume 2024"
              required
            />
          </div>

          {/* Optional AI Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-secondary" />
                AI Analysis Prompt (Optional)
              </span>
            </label>
            <textarea
              value={optionalPrompt}
              onChange={(e) => setOptionalPrompt(e.target.value)}
              className="input-field min-h-[80px] resize-none"
              placeholder="Add specific instructions for AI analysis, e.g., 'Focus on leadership experience' or 'Highlight backend skills'"
            />
            <p className="mt-2 text-xs text-gray-500">
              The AI will analyze your resume and generate a professional summary and skills extraction
            </p>
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
              disabled={isLoading || !selectedFile}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Upload & Analyze
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
