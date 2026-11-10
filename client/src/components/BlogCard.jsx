import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MessageSquare, Eye, Sparkles } from 'lucide-react';

const categoryColorMap = {
  Technology: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  Programming: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  'Artificial Intelligence': 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  Education: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  Lifestyle: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  Travel: 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  Business: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  Entertainment: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950/80 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800',
};

const BlogCard = ({ post, variant = 'standard' }) => {
  const author = post.author || {};
  const postId = post._id || post.id;
  const categoryStyle = categoryColorMap[post.category] || 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';

  const formattedDate = new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (variant === 'featured') {
    return (
      <article className="group relative grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl transition-all duration-300 overflow-hidden">
        {/* Featured Cover Image */}
        <div className="lg:col-span-7 relative overflow-hidden rounded-2xl aspect-[16/10] bg-slate-100 dark:bg-slate-800">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md shadow-sm ${categoryStyle}`}>
              {post.category}
            </span>
            {post.isSample && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/90 text-white backdrop-blur-md shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Sample
              </span>
            )}
          </div>
        </div>

        {/* Content Details */}
        <div className="lg:col-span-5 flex flex-col justify-between py-2">
          <div>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">
              <span>{formattedDate}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime || 5} min read
              </span>
            </div>

            <Link to={`/post/${postId}`}>
              <h2 className="text-2xl lg:text-3xl font-bold font-sans text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-3 tracking-tight">
                {post.title}
              </h2>
            </Link>

            <p className="mt-3 text-sm md:text-base text-slate-600 dark:text-slate-300 font-serif line-clamp-3 leading-relaxed">
              {post.description}
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Link
              to={`/author/${author._id || author.id}`}
              className="flex items-center gap-3 group/author"
            >
              <img
                src={author.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={author.fullName}
                className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover/author:text-brand-600 transition-colors">
                  {author.fullName || 'Anonymous'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  @{author.username || 'author'}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1" title="Views">
                <Eye className="w-3.5 h-3.5" />
                {post.views || 0}
              </span>
              <span className="flex items-center gap-1" title="Comments">
                <MessageSquare className="w-3.5 h-3.5" />
                {post.commentsCount || 0}
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Standard Card
  return (
    <article className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-slate-200/30 dark:shadow-none hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Cover Image */}
      <Link to={`/post/${postId}`} className="relative overflow-hidden aspect-[16/10] bg-slate-100 dark:bg-slate-800">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-md shadow-sm ${categoryStyle}`}>
            {post.category}
          </span>
          {post.isSample && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/90 text-white backdrop-blur-md shadow-sm flex items-center gap-1">
              Sample
            </span>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400 font-medium mb-2.5">
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readingTime || 4} min read
            </span>
          </div>

          <Link to={`/post/${postId}`}>
            <h3 className="text-lg font-bold font-sans text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 tracking-tight">
              {post.title}
            </h3>
          </Link>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 font-serif line-clamp-2 leading-relaxed">
            {post.description}
          </p>
        </div>

        {/* Author Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <Link
            to={`/author/${author._id || author.id}`}
            className="flex items-center gap-2.5 group/author"
          >
            <img
              src={author.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
              alt={author.fullName}
              className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover/author:text-brand-600 transition-colors">
              {author.fullName || 'Anonymous'}
            </span>
          </Link>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1" title="Views">
              <Eye className="w-3.5 h-3.5" />
              {post.views || 0}
            </span>
            <span className="flex items-center gap-1" title="Comments">
              <MessageSquare className="w-3.5 h-3.5" />
              {post.commentsCount || 0}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
