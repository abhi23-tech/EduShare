import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Clock,
  ShieldCheck,
  Eye,
  Bookmark,
  Star,
  MessageSquare,
  Trash2,
  Send,
  AlertCircle,
} from 'lucide-react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import DocPreviewModal from '../components/DocPreviewModal';

const formatFileSize = (bytes) => {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

const ResourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuth();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Preview Modal
  const [previewOpen, setPreviewOpen] = useState(false);

  // Bookmark state
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  // Review & Rating state
  const [userRating, setUserRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await api.get(`/resources/${id}`);
        if (res.data?.success) {
          setResource(res.data.data);
          if (user && res.data.data.ratings) {
            const myReview = res.data.data.ratings.find(
              (r) => r.user === user._id || r.user?._id === user._id
            );
            if (myReview) {
              setUserRating(myReview.rating);
              setUserComment(myReview.comment || '');
            }
          }
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
  }, [id, user]);

  // Sync bookmark state with user
  useEffect(() => {
    if (user?.bookmarks && resource?._id) {
      const isSaved = user.bookmarks.some(
        (b) => (typeof b === 'string' ? b === resource._id : b?._id === resource._id)
      );
      setBookmarked(isSaved);
    }
  }, [user, resource]);

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setBookmarking(true);
    try {
      const res = await api.post(`/resources/${resource._id}/bookmark`);
      if (res.data?.success) {
        setBookmarked(res.data.isBookmarked);
        updateUser({ bookmarks: res.data.bookmarks });
      }
    } catch (err) {
      console.error('Error updating bookmark:', err);
    } finally {
      setBookmarking(false);
    }
  };

  const handleDownload = async () => {
    if (!resource) return;
    setDownloading(true);
    setDownloadSuccess(false);

    try {
      const safeFileName = resource.fileName || `${resource.title.replace(/\s+/g, '_')}.pdf`;

      const response = await api.get(`/resources/${resource._id}/download`, {
        responseType: 'blob',
      });

      let mimeType = resource.fileMimeType;
      if (!mimeType || mimeType === 'application/octet-stream') {
        const ext = safeFileName.split('.').pop().toLowerCase();
        if (ext === 'pdf') mimeType = 'application/pdf';
        else if (ext === 'doc') mimeType = 'application/msword';
        else if (ext === 'docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        else if (ext === 'ppt') mimeType = 'application/vnd.ms-powerpoint';
        else if (ext === 'pptx') mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        else if (ext === 'txt') mimeType = 'text/plain';
        else mimeType = 'application/pdf';
      }

      const blob = new Blob([response.data], { type: mimeType });
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', safeFileName);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 5000);

      setResource((prev) => ({
        ...prev,
        downloads: (prev.downloads || 0) + 1,
      }));

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Download failed, using direct URL fallback:', err);
      window.location.href = `http://localhost:5000/api/resources/${resource._id}/download`;
      setResource((prev) => ({
        ...prev,
        downloads: (prev.downloads || 0) + 1,
      }));
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } finally {
      setDownloading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSubmittingReview(true);
    setReviewMessage({ text: '', type: '' });

    try {
      const res = await api.post(`/resources/${resource._id}/reviews`, {
        rating: userRating,
        comment: userComment,
      });

      if (res.data?.success) {
        setResource(res.data.data);
        setReviewMessage({ text: 'Review submitted successfully!', type: 'success' });
        setTimeout(() => setReviewMessage({ text: '', type: '' }), 4000);
      }
    } catch (err) {
      console.error('Submit review error:', err);
      setReviewMessage({
        text: err.response?.data?.message || 'Failed to submit review.',
        type: 'error',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const res = await api.delete(`/resources/${resource._id}/reviews/${reviewId}`);
      if (res.data?.success) {
        setResource(res.data.data);
        setUserComment('');
        setUserRating(5);
      }
    } catch (err) {
      console.error('Delete review error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-zinc-900 dark:border-white border-t-transparent"></div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-red-600 dark:text-red-400 font-bold text-base mb-4">{error || 'Resource not found'}</p>
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2.5 rounded-xl font-bold text-sm"
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

  const ratingsList = resource.ratings || [];
  const starCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = ratingsList.filter((r) => r.rating === star).length;
    const percentage = ratingsList.length > 0 ? (count / ratingsList.length) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 py-12 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Back navigation & Top Actions */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Resources</span>
          </Link>

          <button
            onClick={handleToggleBookmark}
            disabled={bookmarking}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              bookmarked
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{bookmarked ? 'Saved in Bookmarks' : 'Save to Bookmarks'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-7 sm:p-9 border border-zinc-200/90 dark:border-zinc-800 shadow-xs transition-colors">
              {/* Type Pill, Rating & Date */}
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <span className="text-xs font-bold font-mono uppercase px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50">
                  {resource.type}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {resource.subject}
                </span>
                {resource.totalRatings > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{resource.averageRating} / 5</span>
                    <span className="text-zinc-400 dark:text-zinc-500 font-normal">({resource.totalRatings})</span>
                  </span>
                )}
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 ml-auto flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {formattedDate}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-black text-zinc-950 dark:text-white tracking-tight leading-snug mb-5">
                {resource.title}
              </h1>

              {/* Description */}
              <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Overview & Topics Covered
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300 text-base leading-relaxed whitespace-pre-line">
                  {resource.description || 'No detailed description provided for this academic resource.'}
                </p>
              </div>

              {/* Academic Metadata Grid */}
              <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3.5 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Department
                    </div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{resource.department}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                  <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Subject
                    </div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{resource.subject}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Year & Semester
                    </div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {resource.year} • Semester {resource.semester}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Uploaded By
                    </div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {resource.uploadedBy?.name || 'Fellow Student'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ratings, Reviews & Feedback Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-7 sm:p-9 border border-zinc-200/90 dark:border-zinc-800 shadow-xs transition-colors">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
                    Student Reviews & Ratings
                  </h2>
                </div>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {ratingsList.length} {ratingsList.length === 1 ? 'review' : 'reviews'}
                </span>
              </div>

              {/* Rating Summary Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 mb-8 items-center">
                <div className="text-center sm:border-r sm:border-zinc-200 dark:sm:border-zinc-700 sm:pr-4">
                  <div className="text-4xl font-black text-zinc-950 dark:text-white">
                    {resource.averageRating || '0.0'}
                  </div>
                  <div className="flex items-center justify-center gap-1 my-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(resource.averageRating || 0)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-zinc-300 dark:text-zinc-600'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    Based on {resource.totalRatings || 0} student ratings
                  </div>
                </div>

                {/* Star Percentage Bars */}
                <div className="sm:col-span-2 space-y-1.5">
                  {starCounts.map(({ star, count, percentage }) => (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-6 font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-0.5">
                        {star} <Star className="w-2.5 h-2.5 fill-zinc-400 dark:fill-zinc-500 text-zinc-400 dark:text-zinc-500" />
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-mono text-zinc-400 dark:text-zinc-500">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leave a Review Form */}
              <div className="mb-8 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
                <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-100 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  <span>Rate & Review this Document</span>
                </h3>

                {reviewMessage.text && (
                  <div
                    className={`mb-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      reviewMessage.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                    }`}
                  >
                    {reviewMessage.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{reviewMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Interactive Star Picker */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Your Rating:
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setUserRating(star)}
                          className="p-1 rounded hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              star <= (hoverRating || userRating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-zinc-300 dark:text-zinc-600'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {hoverRating || userRating} out of 5 stars
                      </span>
                    </div>
                  </div>

                  {/* Comment Textarea */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Your Comments & Feedback:
                    </label>
                    <textarea
                      rows={3}
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder="Share how helpful this note or exam paper was for your preparation..."
                      className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-white text-sm resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {submittingReview ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white dark:border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Review</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                  Community Feedback ({ratingsList.length})
                </h3>

                {ratingsList.length > 0 ? (
                  ratingsList.map((rev) => {
                    const isOwnReview =
                      user && (rev.user === user._id || rev.user?._id === user._id);
                    const canDelete = isOwnReview || user?.role === 'admin';

                    return (
                      <div
                        key={rev._id || Math.random()}
                        className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-200">
                              {rev.userName ? rev.userName[0].toUpperCase() : 'S'}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{rev.userName}</div>
                              <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
                                {rev.createdAt
                                  ? new Date(rev.createdAt).toLocaleDateString()
                                  : 'Recently'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= rev.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-zinc-300 dark:text-zinc-600'
                                  }`}
                                />
                              ))}
                            </div>

                            {canDelete && (
                              <button
                                onClick={() => handleDeleteReview(rev._id)}
                                className="p-1 text-zinc-400 hover:text-red-600 transition ml-1"
                                title="Delete this review"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {rev.comment && (
                          <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 mt-1 pl-10 leading-relaxed">
                            {rev.comment}
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-xs">
                    No reviews yet. Be the first student to review this material!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Action / Download & Preview Column (1 col) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-7 border border-zinc-200 dark:border-zinc-800 shadow-xs sticky top-20 transition-colors">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-zinc-950 dark:text-white">Document Package</h2>
              </div>

              {/* File Specs Box */}
              <div className="space-y-3.5 text-sm text-zinc-600 dark:text-zinc-400 mb-6 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium text-xs font-mono">Original File:</span>
                  <span
                    className="font-bold text-zinc-900 dark:text-zinc-100 text-right truncate max-w-[170px]"
                    title={resource.fileName}
                  >
                    {resource.fileName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium text-xs font-mono">Size:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatFileSize(resource.fileSize)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium text-xs font-mono">Format:</span>
                  <span className="font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded text-xs font-mono border border-blue-200/50 dark:border-blue-900/40">
                    {fileExt}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium text-xs font-mono">Total Downloads:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {resource.downloads || 0} times
                  </span>
                </div>
              </div>

              {/* Dual Action Buttons: Preview & Download */}
              <div className="space-y-2.5">
                {/* Preview Document Button */}
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  id="preview-resource-btn"
                  className="w-full py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition active:scale-98 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  <span>Preview Document</span>
                </button>

                {/* Download Button */}
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
              </div>

              {downloadSuccess && (
                <div className="mt-3.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Download completed successfully!</span>
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified academic document. Safe & direct.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* In-Browser PDF & Document Preview Modal */}
      <DocPreviewModal
        resource={resource}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default ResourceDetails;
