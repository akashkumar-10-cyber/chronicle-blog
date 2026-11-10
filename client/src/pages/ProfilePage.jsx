import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, FileText, ArrowLeft, ShieldCheck, PenTool } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiRequest from '../utils/api';
import BlogCard from '../components/BlogCard';

const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const targetUserId = id || currentUser?._id || currentUser?.id;
  const isOwnProfile =
    currentUser && (currentUser._id === targetUserId || currentUser.id === targetUserId);

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (targetUserId) {
      fetchUserData();
    }
  }, [targetUserId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [userRes, postsRes] = await Promise.all([
        apiRequest(`/api/users/${targetUserId}`),
        apiRequest(`/api/users/${targetUserId}/posts`),
      ]);

      if (userRes && userRes.user) {
        setProfileUser(userRes.user);
      }
      if (postsRes && postsRes.posts) {
        setPosts(postsRes.posts);
      }
    } catch (err) {
      console.warn('Failed to load author profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading author profile...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-lg font-bold">Author profile not found</h2>
        <Link to="/" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
          Return to homepage
        </Link>
      </div>
    );
  }

  const joinDate = new Date(profileUser.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Top author hero card */}
      <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 shadow-lg overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={
              profileUser.profileImage ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
            }
            alt={profileUser.fullName}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-xl"
          />

          <div className="flex-1 text-center sm:text-left space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-sans text-slate-900 dark:text-white">
                  {profileUser.fullName}
                </h1>
                <p className="text-sm text-slate-400">@{profileUser.username}</p>
              </div>

              {isOwnProfile && (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors self-center sm:self-start"
                >
                  <PenTool className="w-3.5 h-3.5" /> Manage Articles
                </Link>
              )}
            </div>

            <p className="text-base text-slate-600 dark:text-slate-300 font-serif leading-relaxed max-w-2xl">
              {profileUser.bio || 'Storyteller and contributor at Chronicle.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" /> Member since {joinDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" /> {posts.length} Publications
              </span>
              {profileUser.role === 'admin' && (
                <>
                  <span>•</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Editorial Director
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Author's Articles Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-sans text-slate-900 dark:text-white">
          Published Articles by {profileUser.fullName}
        </h2>

        {posts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900">
            <FileText className="w-10 h-10 mx-auto text-slate-400 opacity-40 mb-2" />
            <p className="text-sm text-slate-500">No published articles yet from this author.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard key={post._id || post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
