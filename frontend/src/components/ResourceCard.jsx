import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Calendar,
  ArrowRight,
  Building2,
  Bookmark,
  Star,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const getTypeBadge = (type) => {
  switch (type) {
    case 'Notes':
      return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-900/50';
    case 'PYQ':
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/50';
    case 'Reference Material':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/50';
    case 'PPT':
      return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-900/50';
    case 'Lab Manual':
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/50';
    default:
      return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
  }
};

const formatBytes = (bytes) => {
  if (!bytes) return 'PDF Document';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const ResourceCard = ({ resource, onBookmarkChange }) => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();

  const isInitiallyBookmarked =
    user?.bookmarks &&
    Array.isArray(user.bookmarks) &&
    user.bookmarks.some((b) => (typeof b === 'string' ? b === resource?._id : b?._id === resource?._id));

  const [bookmarked, setBookmarked] = useState(!!isInitiallyBookmarked);
  const [bookmarking, setBookmarking] = useState(false);

  if (!resource) return null;

  const handleBookmarkClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

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
        if (onBookmarkChange) {
          onBookmarkChange(resource._id, res.data.isBookmarked);
        }
      }
    } catch (err) {
      console.error('Bookmark toggle error:', err);
    } finally {
      setBookmarking(false);
    }
  };

  const formattedDate = resource.createdAt
    ? new Date(resource.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  const fileExt = resource.fileName?.split('.').pop()?.toUpperCase() || 'PDF';
  const hasRating = resource.totalRatings > 0;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400/90 dark:hover:border-zinc-700 hover:shadow-lg dark:hover:shadow-zinc-950/40 transition-all duration-200 hover:-translate-y-1.5 p-6 flex flex-col justify-between group relative">
      <div>
        {/* Card Header: Type Tag & Ratings on Left, Bookmark & Date on Right */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-xs px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/70 dark:border-zinc-700 group-hover:bg-zinc-200/70 dark:group-hover:bg-zinc-700/60 transition-colors">
              {resource.type}
            </span>
            {hasRating ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/50">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{resource.averageRating}</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">({resource.totalRatings})</span>
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmarkClick}
              disabled={bookmarking}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                bookmarked
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-100'
                  : 'bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
              title={bookmarked ? 'Remove from bookmarks' : 'Bookmark this resource'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
              <Calendar className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <Link to={`/resources/${resource._id}`} className="block group mb-3">
          <h3 className="font-extrabold text-zinc-950 dark:text-zinc-100 text-lg sm:text-xl leading-snug tracking-tight group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
            {resource.title}
          </h3>
        </Link>

        {/* Department Badge */}
        <div className="mb-3.5 flex items-center gap-2 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
          <Building2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
          <span className="leading-tight">{resource.department}</span>
        </div>

        {/* Structured metadata list */}
        <div className="space-y-2 text-sm">
          {/* Subject & Format */}
          <div className="flex items-center justify-between text-zinc-800 dark:text-zinc-200 py-0.5">
            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{resource.subject}</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shrink-0">
              {fileExt}
            </span>
          </div>

          {/* Year & Semester */}
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 py-0.5 text-xs font-medium">
            <span>
              Semester {resource.semester} • {resource.year}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getTypeBadge(
                resource.type
              )}`}
            >
              {resource.type}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
          <span>&lt;/&gt; {formatBytes(resource.fileSize)}</span>
          <span>•</span>
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">{resource.downloads || 0} downloads</span>
        </div>

        <Link
          to={`/resources/${resource._id}`}
          className="inline-flex items-center gap-1.5 font-bold text-zinc-950 dark:text-white group-hover:text-zinc-700 dark:group-hover:text-zinc-300 text-sm transition"
        >
          <span>View Resource</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-200" />
        </Link>
      </div>
    </div>
  );
};

export default ResourceCard;
