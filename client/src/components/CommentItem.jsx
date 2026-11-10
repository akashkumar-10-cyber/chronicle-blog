import React, { useState } from 'react';
import { Reply, Edit2, Trash2, Check, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CommentItem = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  isReply = false,
}) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const author = comment.author || {};
  const currentUserId = user?._id || user?.id;
  const authorId = author._id || author.id;
  const isOwner = currentUserId && authorId && currentUserId === authorId;
  const isAdmin = user?.role === 'admin';
  const canModify = isOwner || isAdmin;

  const formattedDate = new Date(comment.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      await onReply(comment._id || comment.id, replyText.trim());
      setReplyText('');
      setIsReplying(false);
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return;

    setSubmittingEdit(true);
    try {
      await onEdit(comment._id || comment.id, editText.trim());
      setIsEditing(false);
    } finally {
      setSubmittingEdit(false);
    }
  };

  return (
    <div className={`group/comment relative ${isReply ? 'ml-8 md:ml-12 mt-4' : 'mt-6'}`}>
      <div className="p-4 md:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 transition-all hover:border-slate-300 dark:hover:border-slate-700">
        {/* Comment Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={author.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
              alt={author.fullName}
              className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {author.fullName || 'Reader'}
                </span>
                {author.role === 'admin' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-300 flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> Admin
                  </span>
                )}
                <span className="text-xs text-slate-400">@{author.username || 'user'}</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">{formattedDate}</span>
            </div>
          </div>

          {/* Action buttons (Owner / Admin) */}
          <div className="flex items-center gap-1">
            {canModify && !isEditing && (
              <>
                {isOwner && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditText(comment.content);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Edit comment"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => onDelete(comment._id || comment.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors"
                  title="Delete comment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Comment Body / Edit Form */}
        <div className="mt-3">
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-brand-300 dark:border-brand-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit || !editText.trim()}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" /> {submittingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
              {comment.content}
            </p>
          )}
        </div>

        {/* Reply Action button */}
        {!isReply && !isEditing && user && (
          <div className="mt-3 flex items-center justify-start">
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline transition-colors"
            >
              <Reply className="w-3.5 h-3.5" />
              {isReplying ? 'Cancel Reply' : 'Reply'}
            </button>
          </div>
        )}

        {/* Inline Reply Form */}
        {isReplying && (
          <form onSubmit={handleReplySubmit} className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-start gap-2.5">
              <img
                src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={user.fullName}
                className="w-7 h-7 rounded-full object-cover shrink-0 mt-1"
              />
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Replying to @${author.username || 'author'}...`}
                rows={2}
                className="flex-1 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsReplying(false)}
                className="px-3 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReply || !replyText.trim()}
                className="px-3 py-1 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                {submittingReply ? 'Posting...' : 'Post Reply'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Render nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3 border-l-2 border-slate-200 dark:border-slate-800 ml-4 md:ml-6 pl-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id || reply.id}
              comment={reply}
              onEdit={onEdit}
              onDelete={onDelete}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
