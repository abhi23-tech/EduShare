import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Calendar,
  Layers,
  ArrowRight,
  BookOpen,
  Building2,
} from 'lucide-react';

const getTypeBadge = (type) => {
  switch (type) {
    case 'Notes':
      return 'bg-blue-50 text-blue-700 border-blue-200/80';
    case 'PYQ':
      return 'bg-amber-50 text-amber-700 border-amber-200/80';
    case 'Reference Material':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    case 'PPT':
      return 'bg-purple-50 text-purple-700 border-purple-200/80';
    case 'Lab Manual':
      return 'bg-rose-50 text-rose-700 border-rose-200/80';
    default:
      return 'bg-zinc-100 text-zinc-700 border-zinc-200';
  }
};

const formatBytes = (bytes) => {
  if (!bytes) return 'PDF Document';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const ResourceCard = ({ resource }) => {
  if (!resource) return null;

  const formattedDate = resource.createdAt
    ? new Date(resource.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  const fileExt = resource.fileName?.split('.').pop()?.toUpperCase() || 'PDF';

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 hover:border-zinc-400/90 hover:shadow-lg hover:shadow-zinc-950/5 transition-all duration-200 hover:-translate-y-1.5 p-6 flex flex-col justify-between group cursor-pointer">
      <div>
        {/* Card Header: Type Tag on Left, Date on Right */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span className="font-mono font-semibold text-xs px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200/70 group-hover:bg-zinc-200/70 transition-colors">
            {resource.type}
          </span>
          <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-xs">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/resources/${resource._id}`} className="block group mb-3">
          <h3 className="font-extrabold text-zinc-950 text-lg sm:text-xl leading-snug tracking-tight group-hover:text-zinc-700 transition-colors">
            {resource.title}
          </h3>
        </Link>

        {/* Department Badge - Fully Visible */}
        <div className="mb-3.5 flex items-center gap-2 px-3 py-1.5 bg-zinc-50 rounded-lg border border-zinc-200/80 text-xs font-semibold text-zinc-800">
          <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <span className="leading-tight">{resource.department}</span>
        </div>

        {/* Structured metadata list */}
        <div className="space-y-2 text-sm">
          {/* Subject & Format */}
          <div className="flex items-center justify-between text-zinc-800 py-0.5">
            <span className="font-semibold text-sm text-zinc-900">{resource.subject}</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 shrink-0">
              {fileExt}
            </span>
          </div>

          {/* Year & Semester */}
          <div className="flex items-center justify-between text-zinc-500 py-0.5 text-xs font-medium">
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
      <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-500 font-mono text-xs">
          <span>&lt;/&gt; {formatBytes(resource.fileSize)}</span>
          <span>•</span>
          <span className="font-semibold text-zinc-700">{resource.downloads || 0} downloads</span>
        </div>

        <Link
          to={`/resources/${resource._id}`}
          className="inline-flex items-center gap-1.5 font-bold text-zinc-950 group-hover:text-zinc-700 text-sm transition"
        >
          <span>View Resource</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-200" />
        </Link>
      </div>
    </div>
  );
};

export default ResourceCard;
