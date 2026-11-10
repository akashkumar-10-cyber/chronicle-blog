import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Flame,
  Clock,
  Sparkles,
  TrendingUp,
  Hash,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import apiRequest from '../utils/api';
import BlogCard from '../components/BlogCard';
import Pagination from '../components/Pagination';

const CATEGORIES = [
  'All',
  'Technology',
  'Programming',
  'Artificial Intelligence',
  'Education',
  'Lifestyle',
  'Travel',
  'Business',
  'Entertainment',
];

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters from URL query params
  const currentCategory = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentTag = searchParams.get('tag') || '';

  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [currentCategory, searchQuery, currentSort, currentPage, currentTag]);

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const queryObj = {
        page: currentPage,
        limit: 9,
        sort: currentSort,
      };

      if (currentCategory && currentCategory !== 'All') {
        queryObj.category = currentCategory;
      }
      if (searchQuery) {
        queryObj.search = searchQuery;
      }
      if (currentTag) {
        queryObj.tag = currentTag;
      }

      const queryString = new URLSearchParams(queryObj).toString();
      const data = await apiRequest(`/api/posts?${queryString}`);

      if (data && data.posts) {
        setPosts(data.posts);
        setTotalPages(data.pages || 1);
        setTotalCount(data.total || 0);

        // First post on page 1 with no filters can serve as featured
        if (currentPage === 1 && !searchQuery && currentCategory === 'All' && !currentTag) {
          setFeaturedPost(data.posts[0] || null);
        } else {
          setFeaturedPost(null);
        }

        // Fetch top 4 popular posts for trending sidebar
        if (trendingPosts.length === 0) {
          const popularData = await apiRequest('/api/posts?limit=4&sort=popular');
          if (popularData && popularData.posts) {
            setTrendingPosts(popularData.posts);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load posts:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // Reset to page 1 on filter changes
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    currentCategory !== 'All' || searchQuery !== '' || currentTag !== '' || currentSort !== 'newest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Featured Editorial Post (Hero) */}
      {featuredPost && !hasActiveFilters && (
        <section className="animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <span className="p-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Featured Editorial
            </span>
          </div>
          <BlogCard post={featuredPost} variant="featured" />
        </section>
      )}

      {/* Discovery, Category Pills & Sort Bar */}
      <section className="space-y-6">
        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = currentCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => updateParam('category', cat)}
                className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Filter / Search Bar Subheader */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          {/* Keyword Search form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by keywords, title, or topic..."
              className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateParam('search', '');
                }}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </form>

          {/* Sort Dropdown & Active Filter Reset */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            )}

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <select
                value={currentSort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-950 text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="newest">Latest Articles</option>
                <option value="popular">Most Popular</option>
                <option value="comments">Most Commented</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Articles List / Grid (Left 8 cols) */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold font-sans text-slate-900 dark:text-white flex items-center gap-2">
              {currentCategory === 'All' ? 'Latest Publications' : `${currentCategory} Articles`}
              <span className="text-sm font-normal text-slate-400">({totalCount})</span>
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 animate-pulse"
                >
                  <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-800 rounded-xl" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900">
              <Search className="w-10 h-10 mx-auto text-slate-400 mb-3 opacity-50" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                No articles matched your criteria
              </h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                Try searching with different keywords, selecting another category, or clearing active filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white"
              >
                View All Articles
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <BlogCard key={post._id || post.id} post={post} />
                ))}
              </div>

              {/* Numbered Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => updateParam('page', p.toString())}
              />
            </>
          )}
        </div>

        {/* Sidebar (Right 4 cols) */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Trending Articles Section */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold font-sans text-slate-900 dark:text-white">
                Popular & Trending
              </h3>
            </div>

            <div className="space-y-4">
              {trendingPosts.map((post, idx) => (
                <article key={post._id || post.id} className="flex items-start gap-3 group">
                  <span className="text-2xl font-black text-slate-200 dark:text-slate-800 font-sans group-hover:text-brand-500 transition-colors">
                    0{idx + 1}
                  </span>
                  <div className="flex-1">
                    <Link to={`/post/${post._id || post.id}`}>
                      <h4 className="text-sm font-semibold font-sans text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 line-clamp-2 transition-colors">
                        {post.title}
                      </h4>
                    </Link>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{post.category}</span>
                      <span>•</span>
                      <span>{post.readingTime || 4} min read</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Popular Tag Clouds */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Hash className="w-4 h-4 text-brand-600" />
              <h3 className="text-base font-bold font-sans text-slate-900 dark:text-white">
                Explore Tags
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                'TypeScript',
                'Node.js',
                'Microservices',
                'AI',
                'Startups',
                'CSS',
                'Minimalism',
                'Japan',
                'CleanTech',
                'Cinema',
              ].map((tag) => (
                <button
                  key={tag}
                  onClick={() => updateParam('tag', tag)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    currentTag === tag
                      ? 'bg-brand-600 text-white'
                      : 'bg-stone-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Newsletter / Editorial Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 text-white shadow-lg space-y-3">
            <h3 className="text-lg font-bold font-serif">The Chronicle Dispatch</h3>
            <p className="text-xs text-brand-100 leading-relaxed font-sans">
              Hand-picked stories, architectural essays, and cultural analyses delivered to your inbox weekly.
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-brand-900 hover:bg-brand-50 transition-colors"
              >
                Join Community Free <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default HomePage;
