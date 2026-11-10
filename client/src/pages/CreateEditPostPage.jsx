import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PenTool,
  Save,
  Image as ImageIcon,
  Tag,
  Folder,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import apiRequest from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MarkdownEditor from '../components/MarkdownEditor';

const CATEGORIES = [
  'Technology',
  'Programming',
  'Artificial Intelligence',
  'Education',
  'Lifestyle',
  'Travel',
  'Business',
  'Entertainment',
];

const CURATED_COVERS = [
  {
    name: 'Technology',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Programming',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'AI & Data',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Lifestyle',
    url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Travel',
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Business',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  },
];

const CreateEditPostPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Technology');
  const [tagsInput, setTagsInput] = useState('');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80'
  );
  const [status, setStatus] = useState('published');
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchPostToEdit();
    }
  }, [id]);

  const fetchPostToEdit = async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/api/posts/${id}`);
      if (data && data.post) {
        const post = data.post;
        // Verify author or admin
        const authorId = post.author?._id || post.author?.id || post.author;
        const currentUserId = user?._id || user?.id;
        if (authorId !== currentUserId && user?.role !== 'admin') {
          showToast('You are not authorized to edit this article.', 'error');
          navigate('/');
          return;
        }

        setTitle(post.title);
        setDescription(post.description);
        setContent(post.content);
        setCategory(post.category);
        setCoverImage(post.coverImage);
        setStatus(post.status || 'published');
        if (Array.isArray(post.tags)) {
          setTagsInput(post.tags.join(', '));
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to load article for editing.', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Please enter an article title.', 'error');
      return;
    }
    if (!description.trim()) {
      showToast('Please provide a short summary description.', 'error');
      return;
    }
    if (!content.trim()) {
      showToast('Article content cannot be empty.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        category,
        coverImage: coverImage.trim(),
        tags: tagsInput,
        status,
      };

      if (isEditMode) {
        const res = await apiRequest(`/api/posts/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showToast('Article updated successfully!', 'success');
        navigate(`/post/${id}`);
      } else {
        const res = await apiRequest('/api/posts', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showToast('Article published successfully!', 'success');
        const newId = res.post?._id || res.post?.id;
        navigate(newId ? `/post/${newId}` : '/dashboard');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save article.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading article editor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-xl md:text-2xl font-bold font-sans text-slate-900 dark:text-white flex items-center gap-2">
          <PenTool className="w-5 h-5 text-brand-600" />
          {isEditMode ? 'Edit Article' : 'Publish New Article'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title Input */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Article Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Architectural Patterns for High-Throughput Distributed Microservices"
            className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-lg md:text-xl font-bold font-sans text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 shadow-sm"
            required
          />
        </div>

        {/* Short Summary Description */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Short Description / Excerpt <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A compelling 1-2 sentence preview of the core thesis that readers will see on article cards."
            rows={2}
            className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-serif text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40 shadow-sm leading-relaxed"
            required
          />
        </div>

        {/* Category & Tags Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-brand-600" />
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-brand-600" />
              Tags (Comma Separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Node.js, Architecture, Cloud, DevOps"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
        </div>

        {/* Cover Image & Presets */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
            Cover Image URL
          </label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          />

          {/* Quick preset covers picker */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Quick Cover Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {CURATED_COVERS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setCoverImage(preset.url)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Cover Image Live Preview */}
          {coverImage && (
            <div className="mt-3 relative aspect-[16/8] max-h-56 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
              <img
                src={coverImage}
                alt="Cover Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80';
                }}
              />
              <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-slate-900/80 text-white text-[11px] font-mono backdrop-blur-sm">
                Live Cover Preview
              </span>
            </div>
          )}
        </div>

        {/* Rich Markdown Editor */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Article Content (Markdown) <span className="text-rose-500">*</span>
          </label>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="# Introduction\n\nBegin writing your article here using markdown formatting..."
          />
        </div>

        {/* Publication Status & Submit Actions */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Visibility:
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="published">Published (Public)</option>
              <option value="draft">Draft (Private)</option>
            </select>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-md active:scale-95 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {submitting
                ? 'Saving...'
                : isEditMode
                ? 'Save Updates'
                : 'Publish Article'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEditPostPage;
