import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  Calendar,
  Share2,
  Edit3,
  Trash2,
  ArrowLeft,
  Eye,
  Check,
  Sparkles,
  Bookmark,
} from 'lucide-react';
import apiRequest from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MarkdownRenderer from '../components/MarkdownRenderer';
import CommentSection from '../components/CommentSection';
import Modal from '../components/Modal';

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPost();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/api/posts/${id}`);
      if (data && data.post) {
        setPost(data.post);
        setRelatedPosts(data.relatedPosts || []);
      }
    } catch (err) {
      showToast(err.message || 'Article could not be found.', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showToast('Article link copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2500);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await apiRequest(`/api/posts/${id}`, { method: 'DELETE' });
      showToast('Article deleted successfully.', 'info');
      navigate('/');
    } catch (err) {
      showToast(err.message || 'Failed to delete article.', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-8 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-12 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-96 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/6" />
        </div>
      </div>
    );
  }

  if (!post) return null;

  const author = post.author || {};
  const currentUserId = user?._id || user?.id;
  const authorId = author._id || author.id;
  const isOwner = currentUserId && authorId && currentUserId === authorId;
  const isAdmin = user?.role === 'admin';
  const canModify = isOwner || isAdmin;

  const formattedDate = new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Articles
        </Link>

        {/* Author / Admin Edit & Delete Actions */}
        {canModify && (
          <div className="flex items-center gap-2">
            <Link
              to={`/edit-post/${post._id || post.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Article
            </Link>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Article Header */}
      <header className="space-y-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to={`/?category=${encodeURIComponent(post.category)}`}
            className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-900"
          >
            {post.category}
          </Link>
          {post.isSample && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/90 text-white flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Sample Content
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-sans text-slate-900 dark:text-white tracking-tight leading-[1.18]">
          {post.title}
        </h1>

        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-serif leading-relaxed italic">
          {post.description}
        </p>

        {/* Author & Meta Bar */}
        <div className="pt-4 pb-6 border-y border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <Link
            to={`/author/${authorId}`}
            className="flex items-center gap-3.5 group/author"
          >
            <img
              src={author.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
              alt={author.fullName}
              className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
            />
            <div>
              <p className="text-sm md:text-base font-bold text-slate-900 dark:text-white group-hover/author:text-brand-600 transition-colors">
                {author.fullName || 'Anonymous'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                @{author.username || 'author'}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              {post.readingTime || 5} min read
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5" title="Views">
              <Eye className="w-4 h-4 text-slate-400" />
              {post.views || 0}
            </span>

            <button
              onClick={handleShare}
              className="ml-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Share article link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Cover Image */}
      {post.coverImage && (
        <div className="my-8 rounded-3xl overflow-hidden shadow-2xl aspect-[16/9] bg-slate-100 dark:bg-slate-800">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Rendered Article Content */}
      <div className="my-10">
        <MarkdownRenderer content={post.content} />
      </div>

      {/* Tags section */}
      {post.tags && post.tags.length > 0 && (
        <div className="pt-8 pb-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">
              Topics:
            </span>
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/?tag=${encodeURIComponent(tag)}`}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-slate-700 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Author Biography Card */}
      <div className="my-10 p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <img
          src={author.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
          alt={author.fullName}
          className="w-16 h-16 rounded-full object-cover shrink-0 border-2 border-brand-500 shadow-md"
        />
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <h3 className="text-lg font-bold font-sans text-slate-900 dark:text-white">
              Written by {author.fullName}
            </h3>
            <span className="text-xs text-slate-400">@{author.username}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-serif leading-relaxed">
            {author.bio || 'Storyteller and contributor at Chronicle.'}
          </p>
          <div className="pt-2">
            <Link
              to={`/author/${authorId}`}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              View all articles by {author.fullName} →
            </Link>
          </div>
        </div>
      </div>

      {/* Related Articles Section */}
      {relatedPosts.length > 0 && (
        <section className="my-14 pt-10 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold font-sans text-slate-900 dark:text-white mb-6">
            Related Reads in {post.category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((rel) => (
              <Link
                key={rel._id || rel.id}
                to={`/post/${rel._id || rel.id}`}
                className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={rel.coverImage}
                    alt={rel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      {rel.category}
                    </span>
                    <h4 className="mt-1 text-sm font-bold font-sans text-slate-900 dark:text-white group-hover:text-brand-600 line-clamp-2 transition-colors">
                      {rel.title}
                    </h4>
                  </div>
                  <span className="mt-3 text-xs text-slate-400">
                    {rel.readingTime || 4} min read
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Interactive Comments Section */}
      <CommentSection postId={post._id || post.id} />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Article"
        message="Are you certain you wish to delete this article? All associated reader comments will also be permanently removed. This action cannot be undone."
        confirmText="Delete Article"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </article>
  );
};

export default PostDetailPage;
