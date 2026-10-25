import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  BookOpen,
  FileText,
  Download,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  FolderOpen,
  User,
  Trash2,
  AlertTriangle,
  X,
  Bookmark,
  Eye,
  Settings,
  ShieldAlert,
  Star,
} from 'lucide-react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import DocPreviewModal from '../components/DocPreviewModal';

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('uploads'); // 'uploads' | 'bookmarks'

  const [myResources, setMyResources] = useState([]);
  const [bookmarkedResources, setBookmarkedResources] = useState([]);
  const [stats, setStats] = useState({
    myUploads: 0,
    totalDownloads: 0,
    totalPlatformResources: 0,
  });

  const [loading, setLoading] = useState(true);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, resource: null, loading: false });
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  // Preview modal
  const [previewResource, setPreviewResource] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/resources/my');
        if (res.data?.success) {
          setMyResources(res.data.data);
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const fetchBookmarks = async () => {
    setBookmarksLoading(true);
    try {
      const res = await api.get('/resources/user/bookmarks');
      if (res.data?.success) {
        setBookmarkedResources(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    } finally {
      setBookmarksLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookmarks') {
      fetchBookmarks();
    }
  }, [activeTab]);

  const handleRemoveBookmark = async (resourceId, title) => {
    try {
      const res = await api.post(`/resources/${resourceId}/bookmark`);
      if (res.data?.success) {
        setBookmarkedResources((prev) => prev.filter((item) => item._id !== resourceId));
        updateUser({ bookmarks: res.data.bookmarks });
        setFeedback({
          message: `"${title}" removed from your bookmarks.`,
          type: 'success',
        });
        setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
      }
    } catch (err) {
      console.error('Remove bookmark error:', err);
    }
  };

  const openDeleteModal = (resource) => {
    setDeleteModal({ open: true, resource, loading: false });
  };

  const closeDeleteModal = () => {
    if (!deleteModal.loading) {
      setDeleteModal({ open: false, resource: null, loading: false });
    }
  };

  const handleDeleteResource = async () => {
    if (!deleteModal.resource) return;

    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await api.delete(`/resources/${deleteModal.resource._id}`);
      if (res.data?.success) {
        setMyResources((prev) => prev.filter((item) => item._id !== deleteModal.resource._id));
        setStats((prev) => ({
          ...prev,
          myUploads: Math.max(0, prev.myUploads - 1),
          totalDownloads: Math.max(0, prev.totalDownloads - (deleteModal.resource.downloads || 0)),
          totalPlatformResources: Math.max(0, prev.totalPlatformResources - 1),
        }));

        setFeedback({
          message: `"${deleteModal.resource.title}" was deleted successfully.`,
          type: 'success',
        });
        setTimeout(() => setFeedback({ message: '', type: '' }), 5000);
        closeDeleteModal();
      }
    } catch (err) {
      console.error('Delete resource error:', err);
      setFeedback({
        message: err.response?.data?.message || 'Failed to delete resource. Please try again.',
        type: 'error',
      });
      setTimeout(() => setFeedback({ message: '', type: '' }), 5000);
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'ED';

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 py-10 sm:py-14 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Feedback Alert Banner */}
        {feedback.message && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300'
            }`}
          >
            <div className="flex items-center gap-2.5 text-sm font-semibold">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback({ message: '', type: '' })}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Welcome Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800 p-8 sm:p-10 text-white shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xl text-white shrink-0">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                    Welcome, {user?.name || 'Student'}!
                  </h1>
                  {user?.role === 'admin' && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-zinc-400 text-sm sm:text-base mt-1 font-medium">
                  {user?.department || 'Engineering'} • {user?.year || 'Academic Year'} • Semester{' '}
                  {user?.semester || 1}
                </p>
                {user?.bio && (
                  <p className="text-zinc-400 text-xs mt-1.5 italic max-w-lg">"{user.bio}"</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/upload"
                id="dashboard-upload-btn"
                className="inline-flex items-center gap-2 bg-white hover:bg-zinc-100 text-zinc-950 font-bold px-5 py-2.5 rounded-xl shadow-xs transition text-sm"
              >
                <UploadCloud className="w-4 h-4 text-zinc-700" />
                <span>Upload Resource</span>
              </Link>

              <Link
                to="/profile"
                className="inline-flex items-center gap-2 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 hover:text-white font-semibold px-4 py-2.5 rounded-xl border border-zinc-700/80 transition text-sm"
              >
                <Settings className="w-4 h-4" />
                <span>Edit Profile</span>
              </Link>

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold px-4 py-2.5 rounded-xl border border-amber-500/30 transition text-sm"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admin Console</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-4 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-transparent dark:border-blue-900/40">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                My Uploads
              </div>
              <div className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-zinc-100 mt-0.5">
                {stats.myUploads}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-4 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-transparent dark:border-emerald-900/40">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Total Downloads
              </div>
              <div className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-zinc-100 mt-0.5">
                {stats.totalDownloads}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center gap-4 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-transparent dark:border-amber-900/40">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Saved Materials
              </div>
              <div className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-zinc-100 mt-0.5">
                {user?.bookmarks?.length || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: My Uploads vs Saved Materials */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6 gap-6">
          <button
            onClick={() => setActiveTab('uploads')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'uploads'
                ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>My Uploaded Resources ({myResources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'bookmarks'
                ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Bookmarked / Saved Study Materials</span>
          </button>
        </div>

        {/* TAB 1: My Uploaded Resources Table */}
        {activeTab === 'uploads' && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden transition-colors">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-zinc-100">
                  My Uploaded Resources
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Your shared academic materials and download stats
                </p>
              </div>
              <Link
                to="/upload"
                className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1 transition"
              >
                <span>+ Add Resource</span>
              </Link>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-zinc-900 dark:border-zinc-100 border-t-transparent mx-auto"></div>
              </div>
            ) : myResources.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                    <tr>
                      <th className="py-3.5 px-6">Title & Subject</th>
                      <th className="py-3.5 px-6">Department</th>
                      <th className="py-3.5 px-6">Type</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6">Downloads</th>
                      <th className="py-3.5 px-6">Date</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {myResources.map((item) => (
                      <tr key={item._id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition">
                        <td className="py-4 px-6">
                          <Link
                            to={`/resources/${item._id}`}
                            className="font-bold text-zinc-950 dark:text-zinc-100 hover:underline transition block"
                          >
                            {item.title}
                          </Link>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">{item.subject}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            {item.department}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                            {item.type}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                            {item.status || 'Published'}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-zinc-800 dark:text-zinc-200">
                          {item.downloads || 0}
                        </td>
                        <td className="py-4 px-6 text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setPreviewResource(item)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                              title="Preview Document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <Link
                              to={`/resources/${item._id}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-zinc-900 dark:text-zinc-200 hover:text-zinc-600 dark:hover:text-white transition px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              title="View details"
                            >
                              <span>View</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                            <button
                              onClick={() => openDeleteModal(item)}
                              id={`delete-resource-btn-${item._id}`}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                              title="Delete Resource"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 px-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center mx-auto mb-3">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                  You haven't uploaded any resources yet
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-5">
                  Share your lecture notes, previous question papers, or reference material with your classmates.
                </p>
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-semibold px-5 py-2.5 rounded-xl text-xs shadow-xs transition"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Resource</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Bookmarked / Saved Study Materials */}
        {activeTab === 'bookmarks' && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden transition-colors">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-zinc-100">
                Saved Study Materials
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Quick access to notes, question papers, and books saved for your exam preparation
              </p>
            </div>

            {bookmarksLoading ? (
              <div className="p-16 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-zinc-900 dark:border-zinc-100 border-t-transparent mx-auto"></div>
              </div>
            ) : bookmarkedResources.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                    <tr>
                      <th className="py-3.5 px-6">Material</th>
                      <th className="py-3.5 px-6">Department</th>
                      <th className="py-3.5 px-6">Type</th>
                      <th className="py-3.5 px-6">Rating</th>
                      <th className="py-3.5 px-6">Uploaded By</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {bookmarkedResources.map((item) => (
                      <tr key={item._id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition">
                        <td className="py-4 px-6">
                          <Link
                            to={`/resources/${item._id}`}
                            className="font-bold text-zinc-950 dark:text-zinc-100 hover:underline transition block"
                          >
                            {item.title}
                          </Link>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                            {item.subject}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          {item.department}
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                            {item.type}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {item.averageRating > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{item.averageRating}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-zinc-400 dark:text-zinc-500">Unrated</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-xs text-zinc-600 dark:text-zinc-300">
                          {item.uploadedBy?.name || 'Fellow Student'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setPreviewResource(item)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                              title="Preview Document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <Link
                              to={`/resources/${item._id}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-zinc-900 dark:text-zinc-200 hover:text-zinc-600 dark:hover:text-white transition px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              title="View details"
                            >
                              <span>View</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                            <button
                              onClick={() => handleRemoveBookmark(item._id, item.title)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition cursor-pointer"
                              title="Remove from bookmarks"
                            >
                              <Bookmark className="w-4 h-4 fill-amber-500 text-amber-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 px-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-3">
                  <Bookmark className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-1">No saved materials yet</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-5">
                  Browse study materials and click the bookmark icon to save notes for quick review before exams.
                </p>
                <Link
                  to="/resources"
                  className="inline-flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-semibold px-5 py-2.5 rounded-xl text-xs shadow-xs transition"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Explore Resources</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 sm:p-7 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative">
            <button
              onClick={closeDeleteModal}
              disabled={deleteModal.loading}
              className="absolute right-5 top-5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-4 border border-red-100 dark:border-red-900/50">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-zinc-950 dark:text-zinc-100 mb-2">Delete Resource?</h3>

            <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed mb-6">
              Are you sure you want to permanently delete{' '}
              <strong className="text-zinc-950 dark:text-white font-bold">"{deleteModal.resource?.title}"</strong>?
              This will remove the file and all associated download data from the repository. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteModal.loading}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteResource}
                disabled={deleteModal.loading}
                id="confirm-delete-btn"
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-75 flex items-center gap-2"
              >
                {deleteModal.loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewResource && (
        <DocPreviewModal
          resource={previewResource}
          isOpen={!!previewResource}
          onClose={() => setPreviewResource(null)}
          onDownload={() =>
            (window.location.href = `/api/resources/${previewResource._id}/download`)
          }
        />
      )}
    </div>
  );
};

export default Dashboard;
