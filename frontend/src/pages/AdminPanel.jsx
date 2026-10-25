import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Eye,
  Users,
  FileText,
  Download,
  Search,
  Filter,
  UserCheck,
  Building2,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import DocPreviewModal from '../components/DocPreviewModal';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('moderation'); // 'moderation' | 'users'

  // Platform stats
  const [stats, setStats] = useState({
    totalResources: 0,
    approvedResources: 0,
    pendingResources: 0,
    rejectedResources: 0,
    totalUsers: 0,
    studentUsers: 0,
    adminUsers: 0,
    totalDownloads: 0,
    totalReviews: 0,
  });

  // Resources state
  const [resources, setResources] = useState([]);
  const [resourceFilter, setResourceFilter] = useState('All');
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourcesLoading, setResourcesLoading] = useState(true);

  // Users state
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Preview modal
  const [previewResource, setPreviewResource] = useState(null);

  // Feedback notification
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  // Action loading states
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/resources/admin/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  const fetchResources = async () => {
    setResourcesLoading(true);
    try {
      const params = {};
      if (resourceFilter !== 'All') params.status = resourceFilter.toLowerCase();
      if (resourceSearch.trim()) params.search = resourceSearch.trim();

      const res = await api.get('/resources/admin/all', { params });
      if (res.data?.success) {
        setResources(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin resources:', err);
    } finally {
      setResourcesLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await api.get('/auth/admin/users');
      if (res.data?.success) {
        setUsersList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchResources();
  }, [resourceFilter]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleStatusChange = async (resourceId, newStatus) => {
    setActionLoadingId(resourceId);
    try {
      const res = await api.patch(`/resources/${resourceId}/status`, { status: newStatus });
      if (res.data?.success) {
        setResources((prev) =>
          prev.map((item) => (item._id === resourceId ? { ...item, status: newStatus } : item))
        );
        fetchStats();
        setFeedback({
          message: `Resource status updated to "${newStatus}".`,
          type: 'success',
        });
        setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setFeedback({
        message: err.response?.data?.message || 'Failed to update resource status.',
        type: 'error',
      });
      setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteResource = async (resourceId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    setActionLoadingId(resourceId);
    try {
      const res = await api.delete(`/resources/${resourceId}`);
      if (res.data?.success) {
        setResources((prev) => prev.filter((item) => item._id !== resourceId));
        fetchStats();
        setFeedback({ message: `"${title}" has been deleted.`, type: 'success' });
        setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
      }
    } catch (err) {
      console.error('Error deleting resource:', err);
      setFeedback({
        message: err.response?.data?.message || 'Failed to delete resource.',
        type: 'error',
      });
      setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRoleToggle = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'student' : 'admin';
    if (!window.confirm(`Change ${targetUser.name}'s role to ${newRole}?`)) return;

    try {
      const res = await api.patch(`/auth/admin/users/${targetUser._id}/role`, { role: newRole });
      if (res.data?.success) {
        setUsersList((prev) =>
          prev.map((u) => (u._id === targetUser._id ? { ...u, role: newRole } : u))
        );
        fetchStats();
        setFeedback({
          message: `${targetUser.name}'s role updated to ${newRole}.`,
          type: 'success',
        });
        setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
      }
    } catch (err) {
      console.error('Error changing role:', err);
      setFeedback({
        message: err.response?.data?.message || 'Failed to change role.',
        type: 'error',
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            <Clock className="w-3 h-3 text-amber-500 dark:text-amber-400" />
            Pending Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60">
            <XCircle className="w-3 h-3 text-red-500 dark:text-red-400" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {status || 'Approved'}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 py-10 sm:py-14 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Feedback Alert */}
        {feedback.message && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-sm font-semibold ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300'
            }`}
          >
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback({ message: '', type: '' })}
              className="text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              ✕
            </button>
          </div>
        )}

        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800 p-8 sm:p-10 text-white shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xl text-amber-400 shrink-0">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Admin Moderation Console</h1>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Faculty & Admin
                  </span>
                </div>
                <p className="text-zinc-400 text-sm mt-1">
                  Approve or reject uploaded study materials, manage users, and review platform engagement metrics.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 hover:text-white text-xs font-bold border border-zinc-700 transition"
              >
                <span>My Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Platform KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
            <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Total Resources
            </div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-zinc-100 mt-1">
              {stats.totalResources}
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              {stats.approvedResources} approved • {stats.pendingResources} pending
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
            <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Pending Moderation
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {stats.pendingResources}
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
              Requires faculty approval
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
            <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Registered Students
            </div>
            <div className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-zinc-100 mt-1">
              {stats.totalUsers}
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              {stats.adminUsers} platform admins
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
            <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Total Downloads
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.totalDownloads}
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              {stats.totalReviews} student reviews
            </div>
          </div>
        </div>

        {/* Tabs: Moderation vs Users */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6 gap-6">
          <button
            onClick={() => setActiveTab('moderation')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'moderation'
                ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Academic Moderation Queue</span>
            {stats.pendingResources > 0 && (
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-transparent dark:border-amber-800/50">
                {stats.pendingResources}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'users'
                ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student & User Management</span>
          </button>
        </div>

        {/* TAB 1: Academic Moderation Queue */}
        {activeTab === 'moderation' && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden transition-colors">
            {/* Filter toolbar */}
            <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mr-1">Status:</span>
                {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setResourceFilter(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      resourceFilter === status
                        ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by title or subject..."
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchResources()}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 transition-colors"
                />
              </div>
            </div>

            {/* Resources Table */}
            {resourcesLoading ? (
              <div className="p-16 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-zinc-900 dark:border-zinc-100 border-t-transparent mx-auto"></div>
              </div>
            ) : resources.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                    <tr>
                      <th className="py-3.5 px-6">Material</th>
                      <th className="py-3.5 px-6">Department</th>
                      <th className="py-3.5 px-6">Uploader</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6">Downloads</th>
                      <th className="py-3.5 px-6 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {resources.map((item) => (
                      <tr key={item._id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition">
                        <td className="py-4 px-6">
                          <Link
                            to={`/resources/${item._id}`}
                            className="font-bold text-zinc-950 dark:text-zinc-100 hover:underline transition block"
                          >
                            {item.title}
                          </Link>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                            {item.subject} • {item.type}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          {item.department}
                        </td>
                        <td className="py-4 px-6 text-xs text-zinc-600 dark:text-zinc-400">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-200">
                            {item.uploadedBy?.name || 'Student'}
                          </div>
                          <div className="text-zinc-400 dark:text-zinc-500 text-[11px]">{item.uploadedBy?.email}</div>
                        </td>
                        <td className="py-4 px-6">{getStatusBadge(item.status)}</td>
                        <td className="py-4 px-6 font-bold text-zinc-800 dark:text-zinc-200">
                          {item.downloads || 0}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview */}
                            <button
                              onClick={() => setPreviewResource(item)}
                              className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                              title="Preview Document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Approve */}
                            {item.status !== 'approved' && (
                              <button
                                onClick={() => handleStatusChange(item._id, 'approved')}
                                disabled={actionLoadingId === item._id}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/60 transition cursor-pointer"
                                title="Approve Material"
                              >
                                Approve
                              </button>
                            )}

                            {/* Reject */}
                            {item.status !== 'rejected' && (
                              <button
                                onClick={() => handleStatusChange(item._id, 'rejected')}
                                disabled={actionLoadingId === item._id}
                                className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800/60 transition cursor-pointer"
                                title="Reject Material"
                              >
                                Reject
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteResource(item._id, item.title)}
                              disabled={actionLoadingId === item._id}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                              title="Delete Permanently"
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
              <div className="text-center py-16 text-zinc-400 dark:text-zinc-500 text-sm">
                No materials found matching this status filter.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Student & User Management */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden transition-colors">
            {usersLoading ? (
              <div className="p-16 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-zinc-900 dark:border-zinc-100 border-t-transparent mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs uppercase font-bold tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                    <tr>
                      <th className="py-3.5 px-6">Name & Email</th>
                      <th className="py-3.5 px-6">Department</th>
                      <th className="py-3.5 px-6">Academic Year</th>
                      <th className="py-3.5 px-6">Role</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {usersList.map((u) => (
                      <tr key={u._id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition">
                        <td className="py-4 px-6">
                          <div className="font-bold text-zinc-950 dark:text-zinc-100">{u.name}</div>
                          <div className="text-xs text-zinc-400 dark:text-zinc-500">{u.email}</div>
                        </td>
                        <td className="py-4 px-6 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          {u.department}
                        </td>
                        <td className="py-4 px-6 text-xs text-zinc-600 dark:text-zinc-400">
                          {u.year} • Sem {u.semester}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                              u.role === 'admin'
                                ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60'
                                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60'
                            }`}
                          >
                            {u.role === 'admin' ? 'Platform Admin' : 'Student'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {u._id !== user._id ? (
                            <button
                              onClick={() => handleRoleToggle(u)}
                              className="px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition cursor-pointer"
                            >
                              {u.role === 'admin' ? 'Demote to Student' : 'Promote to Admin'}
                            </button>
                          ) : (
                            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold italic">
                              You (Current)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Embedded Document Preview Modal */}
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

export default AdminPanel;
