import { useState } from 'react';
import { X, FileText, ExternalLink, AlertCircle, Loader2, Download } from 'lucide-react';

/**
 * ResumePreviewModal - Reusable PDF preview component
 * 
 * Props:
 * - isOpen: boolean - Controls modal visibility
 * - onClose: () => void - Close handler
 * - resumeUrl: string | null - URL of the PDF to preview
 * - title: string (optional) - Title shown in the modal header
 * 
 * Features:
 * - Uses iframe for native PDF rendering
 * - High z-index (z-[60]) for stacking on top of other modals
 * - Handles missing/invalid URLs gracefully
 * - Open in new tab option
 */
export default function ResumePreviewModal({ 
  isOpen, 
  onClose, 
  resumeUrl, 
  title = 'Resume Preview' 
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!isOpen) return null;

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const hasValidUrl = resumeUrl && resumeUrl.trim() !== '';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-5xl h-[90vh] card p-0 overflow-hidden animate-slide-up flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-dark-600 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 
                            flex items-center justify-center">
                <FileText className="w-5 h-5 text-accent-primary" />
              </div>
              <div>
                <h2 className="font-display font-semibold">{title}</h2>
                {hasValidUrl && (
                  <p className="text-xs text-gray-500 truncate max-w-md">{resumeUrl}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasValidUrl && (
                <>
                  <a
                    href={resumeUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-700 
                             hover:bg-dark-600 text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-700 
                             hover:bg-dark-600 text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in New Tab
                  </a>
                </>
              )}
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-dark-700 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-dark-700/50 relative">
          {hasValidUrl ? (
            <>
              {/* Loading State */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-dark-800/80 z-10">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
                    <p className="text-gray-400 text-sm">Loading preview...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-dark-800 z-10">
                  <div className="flex flex-col items-center gap-4 text-center px-8">
                    <div className="w-16 h-16 rounded-2xl bg-accent-danger/10 flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-accent-danger" />
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">Unable to load preview</p>
                      <p className="text-gray-400 text-sm">
                        The PDF couldn't be loaded. Try opening it in a new tab instead.
                      </p>
                    </div>
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      Open in New Tab
                    </a>
                  </div>
                </div>
              )}

              {/* PDF iframe */}
              <iframe
                src={resumeUrl}
                className="w-full h-full border-0"
                title="Resume Preview"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
            </>
          ) : (
            /* No URL Available State */
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-center px-8">
                <div className="w-20 h-20 rounded-2xl bg-dark-600 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-gray-600" />
                </div>
                <div>
                  <p className="text-white font-medium mb-1">No Preview Available</p>
                  <p className="text-gray-400 text-sm">
                    This resume doesn't have a preview URL.
                  </p>
                </div>
                <button onClick={onClose} className="btn-secondary">
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
