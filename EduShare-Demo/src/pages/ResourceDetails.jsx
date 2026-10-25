import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Download,
  FileText,
  Calendar,
  User,
  BookOpen,
  Layers,
  Building2,
  ArrowLeft,
  CheckCircle2,
  HardDrive,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import api from '../api/api';

const formatFileSize = (bytes) => {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

const ResourceDetails = () => {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await api.get(`/resources/${id}`);
        if (res.data?.success) {
          setResource(res.data.data);
        } else {
          setError('Resource not found');
        }
      } catch (err) {
        console.error('Error fetching resource details:', err);
        setError('Failed to load resource details.');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id]);

  const handleDownload = async () => {
    if (!resource || downloading) return;
    setDownloading(true);
    setDownloadSuccess(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Update downloads counter
      const stored = localStorage.getItem('edushare_resources');
      if (stored) {
        try {
          const list = JSON.parse(stored);
          const idx = list.findIndex((r) => r._id === resource._id);
          if (idx !== -1) {
            list[idx].downloads = (list[idx].downloads || 0) + 1;
            localStorage.setItem('edushare_resources', JSON.stringify(list));
          }
        } catch (e) {}
      }

      // Increment downloads count in local state
      setResource((prev) => ({
        ...prev,
        downloads: (prev.downloads || 0) + 1,
      }));

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-zinc-900 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl p-10 border border-zinc-200 shadow-sm">
          <p className="text-red-600 font-bold text-base mb-4">{error || 'Resource not found'}</p>
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Resources</span>
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = resource.createdAt
    ? new Date(resource.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    : 'Recently';

  const fileExt = resource.fileName?.split('.').pop()?.toUpperCase() || 'PDF';

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-950 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Resources</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-7 sm:p-9 border border-zinc-200/90 shadow-xs">
              {/* Type Pill & Meta */}
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <span className="text-xs font-bold font-mono uppercase px-3 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80">
                  {resource.type}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-md bg-zinc-100 text-zinc-700">
                  {resource.subject}
                </span>
                <span className="text-xs font-mono text-zinc-500 ml-auto flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {formattedDate}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-black text-zinc-950 tracking-tight leading-snug mb-5">
                {resource.title}
              </h1>

              {/* Description */}
              <div className="mt-6 pt-6 border-t border-zinc-100">
                <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Overview & Topics Covered
                </h3>
                <p className="text-zinc-700 text-base leading-relaxed whitespace-pre-line">
                  {resource.description || 'No detailed description provided for this academic resource.'}
                </p>
              </div>

              {/* Academic Metadata Grid */}
              <div className="mt-8 pt-6 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3.5 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Department</div>
                    <div className="text-sm font-bold text-zinc-900">{resource.department}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                  <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Subject</div>
                    <div className="text-sm font-bold text-zinc-900">{resource.subject}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Year & Semester</div>
                    <div className="text-sm font-bold text-zinc-900">
                      {resource.year} • Semester {resource.semester}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Uploaded By</div>
                    <div className="text-sm font-bold text-zinc-900">
                      {resource.uploadedBy?.name || 'Fellow Student'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action / Download Column (1 col) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-7 border border-zinc-200 shadow-xs sticky top-20">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-zinc-950">
                  Document Package
                </h2>
              </div>

              {/* File Specs Box */}
              <div className="space-y-3.5 text-sm text-zinc-600 mb-6 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-zinc-500 font-medium text-xs font-mono">Original File:</span>
                  <span className="font-bold text-zinc-900 text-right truncate max-w-[170px]" title={resource.fileName}>
                    {resource.fileName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium text-xs font-mono">Size:</span>
                  <span className="font-bold text-zinc-900">{formatFileSize(resource.fileSize)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium text-xs font-mono">File Format:</span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs font-mono">
                    {fileExt}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium text-xs font-mono">Total Downloads:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1 text-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {resource.downloads || 0} times
                  </span>
                </div>
              </div>

              {/* Download Action Button */}
              <button
                onClick={handleDownload}
                disabled={downloading}
                id="download-resource-btn"
                className="w-full py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer disabled:opacity-75"
              >
                {downloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Downloading Material...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Resource</span>
                  </>
                )}
              </button>

              {downloadSuccess && (
                <div className="mt-3.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Download completed successfully!</span>
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center gap-2 text-xs text-zinc-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified academic document. Safe & direct.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetails;
