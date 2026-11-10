import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  FileText,
  MessageSquare,
  Trash2,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import apiRequest from '../utils/api';
import Modal from '../components/Modal';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'posts', 'users', 'comments'
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [postsList, setPostsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Deletion modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { type: 'post' | 'comment', id, title }
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'overview') {
        const data = await apiRequest('/api/admin/dashboard');
        if (data && data.stats) {
          setStats(data.stats);
        }
      } else if (activeTab === 'users') {
        const data = await apiRequest('/api/admin/users');
        if (data && data.users) {
          setUsersList(data.users);
        }
      } else if (activeTab === 'posts') {
        const data = await apiRequest('/api/admin/posts');
        if (data && data.posts) {
          setPostsList(data.posts);
        }
      } else if (activeTab === 'comments') {
        const data = await apiRequest('/api/admin/dashboard');
        if (data && data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to load administrative data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      const userId = targetUser._id || targetUser.id;
      await apiRequest(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });

      setUsersList((prev) =>
        prev.map((u) => ((u._id || u.id) === userId ? { ...u, role: newRole } : u))
      );
      showToast(`User role updated to ${newRole}.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update user role.', 'error');
    }
  };

  const promptDeletePost = (post) => {
    setItemToDelete({
      type: 'post',
      id: post._id || post.id,
      title: post.title,
    });
    setDeleteModalOpen(true);
  };

  const promptDeleteComment = (comment) => {
    setItemToDelete({
      type: 'comment',
      id: comment._id || comment.id,
      title: comment.content?.slice(0, 40) + '...',
    });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      if (itemToDelete.type === 'post') {
        await apiRequest(`/api/admin/posts/${itemToDelete.id}`, { method: 'DELETE' });
        setPostsList((prev) => prev.filter((p) => (p._id || p.id) !== itemToDelete.id));
        showToast('Article and associated comments removed by admin.', 'info');
      } else if (itemToDelete.type === 'comment') {
        await apiRequest(`/api/admin/comments/${itemToDelete.id}`, { method: 'DELETE' });
        if (stats?.recentComments) {
          setStats((prev) => ({
            ...prev,
            recentComments: prev.recentComments.filter((c) => (c._id || c.id) !== itemToDelete.id),
          }));
        }
        showToast('Comment removed by admin.', 'info');
      }
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      showToast(err.message || 'Operation failed.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Admin Operations Center
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-sans">
            Chronicle Platform Administration
          </h1>
          <p className="text-sm text-slate-400 font-sans">
            Authorized oversight for article curation, community moderation, and user credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-mono text-slate-300 border border-slate-700">
            Admin: @{user?.username}
          </span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-6 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Platform Analytics
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`pb-3 text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'posts'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Manage All Articles
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Manage Users & Roles
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`pb-3 text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'comments'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Moderate Recent Comments
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8 animate-fade-in">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Users
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-sans">
                  {stats.totalUsers}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Published Articles
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-sans">
                  {stats.totalPublishedPosts}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Comments
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-sans">
                  {stats.totalComments}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Categories
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-sans">
                  {stats.categoryBreakdown?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Category Distribution Breakdown */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold font-sans text-slate-900 dark:text-white">
              Articles Distribution by Category
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.categoryBreakdown?.map((cat) => (
                <div
                  key={cat._id}
                  className="p-3 rounded-xl bg-stone-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60"
                >
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                    {cat._id}
                  </p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {cat.count} articles
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Manage All Articles */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-5">Title</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Views</th>
                  <th className="py-3.5 px-5 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {postsList.map((post) => (
                  <tr key={post._id || post.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-5 max-w-xs">
                      <Link
                        to={`/post/${post._id || post.id}`}
                        className="font-bold text-slate-900 dark:text-white hover:text-brand-600 line-clamp-1 transition-colors"
                      >
                        {post.title}
                      </Link>
                      <span className="text-xs text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {post.author?.fullName || 'Unknown'}
                      </span>
                      <p className="text-slate-400">@{post.author?.username}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {post.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-500">
                      {post.views || 0}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => promptDeletePost(post)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                        title="Remove article as admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Manage Users & Roles */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-5">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Joined</th>
                  <th className="py-3.5 px-4">Articles</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-5 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {usersList.map((target) => (
                  <tr key={target._id || target.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={target.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {target.fullName}
                          </p>
                          <p className="text-xs text-slate-400">@{target.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-600 dark:text-slate-300">
                      {target.email}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(target.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {target.postsCount || 0}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          target.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {target.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {target.email !== user?.email && (
                        <button
                          onClick={() => handleRoleToggle(target)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          {target.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Moderate Recent Comments */}
      {activeTab === 'comments' && stats?.recentComments && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Community Moderation: Administrators can inspect and permanently delete inappropriate remarks.
            </span>
          </div>

          <div className="space-y-3">
            {stats.recentComments.map((comment) => (
              <div
                key={comment._id || comment.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {comment.author?.fullName || 'User'}
                    </span>
                    <span className="text-xs text-slate-400">
                      on article: <span className="italic">{comment.post?.title || 'Article'}</span>
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {comment.content}
                  </p>
                </div>

                <button
                  onClick={() => promptDeleteComment(comment)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors shrink-0"
                  title="Remove comment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deletion Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={`Administrative Removal`}
        message={`Are you sure you want to permanently delete this ${itemToDelete?.type}? "${itemToDelete?.title}"`}
        confirmText="Confirm Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminDashboardPage;
