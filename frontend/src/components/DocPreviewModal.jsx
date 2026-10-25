import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Maximize2,
  Minimize2,
  ExternalLink,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import api, { API_BASE_URL } from '../api/api';

const DocPreviewModal = ({ resource, isOpen, onClose, onDownload }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [blobUrl, setBlobUrl] = useState(null);

  const fileExt = resource?.fileName?.split('.').pop()?.toLowerCase() || 'pdf';
  const isPdf = fileExt === 'pdf';
  const isOfficeDoc = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(fileExt);
  const directPreviewUrl = resource ? `${API_BASE_URL}/resources/preview/${resource._id}` : '';

  useEffect(() => {
    if (!isOpen || !resource) {
      setBlobUrl(null);
      setLoading(false);
      return;
    }

    // Office formats cannot be natively displayed inside browser PDF viewers
    if (isOfficeDoc) {
      setLoading(false);
      setLoadError(true);
      setErrorMessage(`Preview is not supported directly for ${fileExt.toUpperCase()} files. Please download to view.`);
      return;
    }

    let isMounted = true;
    let createdUrl = null;

    setLoading(true);
    setLoadError(false);
    setErrorMessage('');

    const fetchPreview = async () => {
      try {
        const response = await api.get(`/resources/preview/${resource._id}`, {
          responseType: 'blob',
        });

        if (!isMounted) return;

        const contentType = response.headers['content-type'] || (isPdf ? 'application/pdf' : 'text/plain');
        const blob = new Blob([response.data], { type: contentType });
        createdUrl = URL.createObjectURL(blob);
        setBlobUrl(createdUrl);
        setLoading(false);
      } catch (err) {
        console.error('Preview load error:', err);
        if (isMounted) {
          setLoadError(true);
          setLoading(false);
          setErrorMessage('Could not load document preview. You can download the file directly.');
        }
      }
    };

    fetchPreview();

    return () => {
      isMounted = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [isOpen, resource?._id]);

  if (!isOpen || !resource) return null;

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleOpenNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank');
    } else {
      window.open(directPreviewUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-2xl sm:rounded-3xl border border-zinc-200 shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? 'w-full h-full rounded-none sm:rounded-none'
            : 'w-full max-w-5xl h-[88vh]'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-zinc-900 text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-zinc-100 truncate" title={resource.title}>
                {resource.title}
              </h3>
              <p className="text-xs text-zinc-400 truncate">
                {resource.subject} • {resource.department} • {resource.type}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleOpenNewTab}
              className="p-1.5 sm:p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {onDownload && (
              <button
                onClick={onDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition ml-1"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Viewer */}
        <div className="flex-1 relative bg-zinc-100 overflow-hidden flex items-center justify-center">
          {loading && !loadError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 z-10 gap-3">
              <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
              <p className="text-xs font-semibold text-zinc-600">Loading document preview...</p>
            </div>
          )}

          {loadError ? (
            <div className="text-center p-8 max-w-md">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <h4 className="font-bold text-zinc-900 text-base mb-1">Preview Unavailable</h4>
              <p className="text-xs text-zinc-600 mb-5">
                {errorMessage || `This file format (${fileExt.toUpperCase()}) cannot be rendered directly in the embedded viewer, or is protected by browser policies.`}
              </p>
              {onDownload && (
                <button
                  onClick={onDownload}
                  className="inline-flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-zinc-800 transition shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download File to View</span>
                </button>
              )}
            </div>
          ) : blobUrl ? (
            <iframe
              src={blobUrl}
              title={`Preview of ${resource.title}`}
              className="w-full h-full border-0 bg-white"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DocPreviewModal;
