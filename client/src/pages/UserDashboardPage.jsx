import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  MessageSquare,
  Eye,
  PenTool,
  Edit2,
  Trash2,
  User,
  Settings,
  PlusCircle,
  ExternalLink,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import apiRequest from '../utils/api';
import Modal from '../components/Modal';

const UserDashboardPage = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('articles'); // 'articles', 'profile', 'comments'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    totalViews: 0,
  });

  // Profile edit fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Post delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setUsername(user.username || '');
      setBio(user.bio || '');
      setProfileImage(user.profileImage || '');
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const userId = user._id || user.id;
      const data = await apiRequest(`/api/users/${userId}/posts`);

      if (data && data.posts) {
        setPosts(data.posts);

        let totalViews = 0;
        let totalComments = 0;
        data.posts.forEach((p) => {
          totalViews += p.views || 0;
          totalComments += p.commentsCount || 0;
        });

        setStats({
          totalPosts: data.posts.length,
          totalComments,
          totalViews,
        });
      }
    } catch (err) {
      console.warn('Failed to load user posts:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      await updateProfile({
        fullName,
        username,
        bio,
        profileImage,
      });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const promptDeletePost = (post) => {
    setPostToDelete(post);
    setDeleteModalOpen(true);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);

    try {
      const postId = postToDelete._id || postToDelete.id;
      await apiRequest(`/api/posts/${postId}`, { method: 'DELETE' });

      setPosts((prev) => prev.filter((p) => (p._id || p.id) !== postId));
      setStats((prev) => ({ ...prev, totalPosts: Math.max(0, prev.totalPosts - 1) }));
      showToast('Article deleted successfully.', 'info');
      setDeleteModalOpen(false);
      setPostToDelete(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete article.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-sans text-slate-900 dark:text-white">
            Creator Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your articles, review reader engagement, and customize your profile.
          </p>
        </div>

        <Link
          to="/create-post"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-md active:scale-95 transition-all self-start sm:self-auto"
        >
          <PenTool className="w-4 h-4" /> Publish New Article
        </Link>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Articles Published
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-sans mt-0.5">
              {stats.totalPosts}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Comments Received
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-sans mt-0.5">
              {stats.totalComments}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Article Reads
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-sans mt-0.5">
              {stats.totalViews}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
        <button
          onClick={() => setActiveTab('articles')}
          className={`pb-3 text-sm font-semibold transition-all relative ${
            activeTab === 'articles'
              ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          My Published Articles ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-semibold transition-all relative ${
            activeTab === 'profile'
              ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          Account Profile & Bio
        </button>
      </div>

      {/* Tab: My Published Articles */}
      {activeTab === 'articles' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading articles...</div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
              <FileText className="w-12 h-12 mx-auto text-slate-400 opacity-40" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  You haven't written any articles yet
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Share your insights, code architecture, or creative stories with readers around the globe.
                </p>
              </div>
              <Link
                to="/create-post"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white"
              >
                <PlusCircle className="w-4 h-4" /> Draft First Article
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3.5 px-5">Article</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Published Date</th>
                    <th className="py-3.5 px-4">Views</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                  {posts.map((post) => (
                    <tr
                      key={post._id || post.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.coverImage}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover shrink-0 bg-slate-100 dark:bg-slate-800"
                          />
                          <div>
                            <Link
                              to={`/post/${post._id || post.id}`}
                              className="font-bold text-slate-900 dark:text-white hover:text-brand-600 line-clamp-1 transition-colors"
                            >
                              {post.title}
                            </Link>
                            <span className="text-xs text-slate-400">
                              {post.readingTime || 4} min read
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {post.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-300 font-mono">
                        {post.views || 0}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/post/${post._id || post.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="View live post"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/edit-post/${post._id || post.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit article"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => promptDeletePost(post)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60"
                            title="Delete article"
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
          )}
        </div>
      )}

      {/* Tab: Profile & Settings */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Avatar Preview */}
            <div className="flex items-center gap-5">
              <img
                src={
                  profileImage ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                }
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-brand-500 shadow-md"
              />
              <div className="flex-1 space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Profile Picture URL
                </label>
                <input
                  type="url"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-stone-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-stone-50 dark:bg-slate-950 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-stone-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Author Biography
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="A brief bio displayed on your published articles and profile page."
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-stone-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30 leading-relaxed font-serif"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Email: <span className="font-mono">{user?.email}</span>
              </span>

              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {savingProfile ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeletePost}
        title="Delete Article"
        message={`Are you sure you want to delete "${postToDelete?.title}"? All reader comments on this article will be permanently removed.`}
        confirmText="Confirm Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default UserDashboardPage;
