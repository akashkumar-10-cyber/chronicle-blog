import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Send, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import apiRequest from '../utils/api';
import CommentItem from './CommentItem';
import Modal from './Modal';

const CommentSection = ({ postId }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [comments, setComments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/api/posts/${postId}/comments`);
      if (data && data.comments) {
        setComments(data.comments);
        setTotalCount(data.total || data.comments.length);
      }
    } catch (err) {
      console.warn('Failed to load comments:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      showToast('Comment cannot be empty.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const data = await apiRequest(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (data && data.comment) {
        // Prepend to top of comments list for immediate UI reactivity without full reload
        setComments((prev) => [data.comment, ...prev]);
        setTotalCount((prev) => prev + 1);
        setNewComment('');
        showToast('Comment posted successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit comment.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentCommentId, replyContent) => {
    try {
      const data = await apiRequest(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          content: replyContent,
          parentCommentId,
        }),
      });

      if (data && data.comment) {
        // Find parent and append reply
        setComments((prev) =>
          prev.map((c) => {
            if ((c._id || c.id) === parentCommentId) {
              return {
                ...c,
                replies: [...(c.replies || []), data.comment],
              };
            }
            return c;
          })
        );
        setTotalCount((prev) => prev + 1);
        showToast('Reply added successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to post reply.', 'error');
    }
  };

  const handleEdit = async (commentId, updatedContent) => {
    try {
      const data = await apiRequest(`/api/comments/${commentId}`, {
        method: 'PUT',
        body: JSON.stringify({ content: updatedContent }),
      });

      if (data && data.comment) {
        // Update in state
        setComments((prev) =>
          prev.map((c) => {
            if ((c._id || c.id) === commentId) {
              return { ...c, content: updatedContent, updatedAt: new Date().toISOString() };
            }
            if (c.replies) {
              return {
                ...c,
                replies: c.replies.map((r) =>
                  (r._id || r.id) === commentId
                    ? { ...r, content: updatedContent, updatedAt: new Date().toISOString() }
                    : r
                ),
              };
            }
            return c;
          })
        );
        showToast('Comment updated successfully.', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update comment.', 'error');
    }
  };

  const promptDeleteComment = (commentId) => {
    setCommentToDelete(commentId);
    setDeleteModalOpen(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    setIsDeleting(true);

    try {
      await apiRequest(`/api/comments/${commentToDelete}`, {
        method: 'DELETE',
      });

      // Filter out from local state
      setComments((prev) =>
        prev
          .filter((c) => (c._id || c.id) !== commentToDelete)
          .map((c) => ({
            ...c,
            replies: (c.replies || []).filter((r) => (r._id || r.id) !== commentToDelete),
          }))
      );
      setTotalCount((prev) => Math.max(0, prev - 1));
      showToast('Comment deleted.', 'info');
      setDeleteModalOpen(false);
      setCommentToDelete(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete comment.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold font-sans text-slate-900 dark:text-white">
              Discussion ({totalCount})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Share your insights and perspectives with the community
            </p>
          </div>
        </div>
      </div>

      {/* Write new comment form */}
      {isAuthenticated ? (
        <form onSubmit={handlePostComment} className="mb-10">
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm focus-within:ring-2 focus-within:ring-brand-500/30">
            <img
              src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
              alt={user.fullName}
              className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700 mt-1"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What are your thoughts on this article? Join the discussion..."
                rows={3}
                className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none resize-none leading-relaxed"
              />
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Markdown formatting supported
                </span>
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-6 rounded-2xl bg-brand-50/70 dark:bg-slate-900/80 border border-brand-200/80 dark:border-slate-800 text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Want to join the conversation and leave a reply?
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4" /> Sign In to Comment
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-300 dark:border-slate-700"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="py-8 text-center text-sm text-slate-400">
          Loading conversation...
        </div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
          <MessageSquare className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
            No comments yet. Be the first to spark the conversation!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id || comment.id}
              comment={comment}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={promptDeleteComment}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteComment}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </section>
  );
};

export default CommentSection;
