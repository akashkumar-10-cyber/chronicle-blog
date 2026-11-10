import { INITIAL_USERS, INITIAL_POSTS, INITIAL_COMMENTS } from './sampleData';

const STORAGE_KEY_USERS = 'chronicle_users_v1';
const STORAGE_KEY_POSTS = 'chronicle_posts_v1';
const STORAGE_KEY_COMMENTS = 'chronicle_comments_v1';
const STORAGE_KEY_CURRENT_USER = 'chronicle_current_user_v1';

// Initialize data if not yet present
const getStored = (key, initial) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return initial;
  }
};

const setStored = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage write error:', e);
  }
};

export const initializeMockStore = () => {
  getStored(STORAGE_KEY_USERS, INITIAL_USERS);
  getStored(STORAGE_KEY_POSTS, INITIAL_POSTS);
  getStored(STORAGE_KEY_COMMENTS, INITIAL_COMMENTS);
};

// Dispatch mock requests based on route and HTTP method
export const handleMockRequest = async (endpoint, options = {}) => {
  initializeMockStore();
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};

  // Extract query parameters
  const [pathname, queryString] = endpoint.split('?');
  const params = new URLSearchParams(queryString || '');

  // Simulate short realistic network delay (50-150ms)
  await new Promise((r) => setTimeout(r, 60));

  let users = getStored(STORAGE_KEY_USERS, INITIAL_USERS);
  let posts = getStored(STORAGE_KEY_POSTS, INITIAL_POSTS);
  let comments = getStored(STORAGE_KEY_COMMENTS, INITIAL_COMMENTS);
  let currentUser = getStored(STORAGE_KEY_CURRENT_USER, null);

  // Helper: get current authenticated user
  const token = localStorage.getItem('token');
  if (token && !currentUser) {
    currentUser = users.find((u) => u._id === token || u.id === token) || users[0];
  }

  // --- AUTH ENDPOINTS ---
  if (pathname === '/api/auth/register' && method === 'POST') {
    const { fullName, username, email, password, bio, profileImage } = body;
    if (!fullName || !username || !email || !password) {
      throw new Error('Please provide full name, username, email, and password.');
    }
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email address already exists.');
    }
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('This username is already taken. Please choose another.');
    }

    const newUser = {
      _id: `usr_${Date.now()}`,
      id: `usr_${Date.now()}`,
      fullName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      bio: bio || 'Storyteller and thoughtful reader on Chronicle.',
      profileImage: profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setStored(STORAGE_KEY_USERS, users);
    setStored(STORAGE_KEY_CURRENT_USER, newUser);
    localStorage.setItem('token', newUser._id);

    return {
      success: true,
      token: newUser._id,
      user: newUser,
      message: 'Account registered successfully.',
    };
  }

  if (pathname === '/api/auth/login' && method === 'POST') {
    const { email, password } = body;
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() ||
        u.username.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      throw new Error('Invalid credentials. Please verify your email/username and password.');
    }

    // Passwords accepted for demo: password matches or demo defaults
    setStored(STORAGE_KEY_CURRENT_USER, user);
    localStorage.setItem('token', user._id);

    return {
      success: true,
      token: user._id,
      user,
      message: 'Logged in successfully.',
    };
  }

  if (pathname === '/api/auth/logout' && method === 'POST') {
    setStored(STORAGE_KEY_CURRENT_USER, null);
    localStorage.removeItem('token');
    return { success: true, message: 'Logged out successfully.' };
  }

  if (pathname === '/api/auth/me' && method === 'GET') {
    if (!currentUser) {
      throw new Error('Not authenticated.');
    }
    return { success: true, user: currentUser };
  }

  // --- POSTS ENDPOINTS ---
  if (pathname === '/api/posts' && method === 'GET') {
    const page = parseInt(params.get('page') || '1', 10);
    const limit = parseInt(params.get('limit') || '9', 10);
    const category = params.get('category');
    const tag = params.get('tag');
    const search = params.get('search');
    const author = params.get('author');
    const sort = params.get('sort') || 'newest';

    let filtered = posts.filter((p) => p.status === 'published');

    if (category && category !== 'All') {
      filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (tag) {
      filtered = filtered.filter((p) =>
        (p.tags || []).some((t) => t.toLowerCase() === tag.toLowerCase())
      );
    }

    if (author) {
      filtered = filtered.filter(
        (p) => (p.author?._id || p.author?.id || p.author) === author
      );
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    // Attach comments count
    const postsWithCounts = filtered.map((post) => {
      const postComments = comments.filter((c) => (c.post?._id || c.post?.id || c.post) === post._id);
      let count = postComments.length;
      postComments.forEach((c) => {
        if (c.replies) count += c.replies.length;
      });
      return {
        ...post,
        commentsCount: count,
      };
    });

    if (sort === 'oldest') {
      postsWithCounts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sort === 'popular') {
      postsWithCounts.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sort === 'comments') {
      postsWithCounts.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
    } else {
      postsWithCounts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const total = postsWithCounts.length;
    const startIndex = (page - 1) * limit;
    const paginated = postsWithCounts.slice(startIndex, startIndex + limit);

    return {
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      limit,
      posts: paginated,
    };
  }

  // GET single post: /api/posts/:id
  const postDetailMatch = pathname.match(/^\/api\/posts\/([^/]+)$/);
  if (postDetailMatch && method === 'GET') {
    const postId = postDetailMatch[1];
    const postIndex = posts.findIndex((p) => p._id === postId || p.id === postId);

    if (postIndex === -1) {
      throw new Error('Article not found.');
    }

    // Increment views
    posts[postIndex].views = (posts[postIndex].views || 0) + 1;
    setStored(STORAGE_KEY_POSTS, posts);

    const post = posts[postIndex];
    const relatedPosts = posts
      .filter((p) => p._id !== post._id && p.category === post.category && p.status === 'published')
      .slice(0, 3);

    const postComments = comments.filter((c) => (c.post?._id || c.post?.id || c.post) === post._id);
    let count = postComments.length;
    postComments.forEach((c) => {
      if (c.replies) count += c.replies.length;
    });

    return {
      success: true,
      post: { ...post, commentsCount: count },
      relatedPosts,
    };
  }

  // CREATE post: POST /api/posts
  if (pathname === '/api/posts' && method === 'POST') {
    if (!currentUser) throw new Error('Authentication required.');
    const { title, description, content, coverImage, category, tags, status } = body;
    if (!title || !description || !content) {
      throw new Error('Please provide title, short description, and content.');
    }

    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    let parsedTags = [];
    if (Array.isArray(tags)) parsedTags = tags;
    else if (typeof tags === 'string') parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);

    const newPost = {
      _id: `post_${Date.now()}`,
      id: `post_${Date.now()}`,
      title,
      description,
      content,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
      category: category || 'Technology',
      tags: parsedTags,
      author: currentUser,
      status: status || 'published',
      readingTime,
      views: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    posts.unshift(newPost);
    setStored(STORAGE_KEY_POSTS, posts);

    return {
      success: true,
      message: 'Article published successfully.',
      post: newPost,
    };
  }

  // UPDATE post: PUT /api/posts/:id
  if (postDetailMatch && method === 'PUT') {
    if (!currentUser) throw new Error('Authentication required.');
    const postId = postDetailMatch[1];
    const postIndex = posts.findIndex((p) => p._id === postId || p.id === postId);

    if (postIndex === -1) throw new Error('Article not found.');

    const target = posts[postIndex];
    const authorId = target.author?._id || target.author?.id || target.author;
    const isAuthor = authorId === currentUser._id || authorId === currentUser.id;
    const isAdmin = currentUser.role === 'admin';

    if (!isAuthor && !isAdmin) {
      throw new Error('Not authorized to edit this article.');
    }

    const { title, description, content, coverImage, category, tags, status } = body;
    if (title) target.title = title;
    if (description) target.description = description;
    if (content) {
      target.content = content;
      const wordCount = content.trim().split(/\s+/).length;
      target.readingTime = Math.max(1, Math.ceil(wordCount / 200));
    }
    if (coverImage) target.coverImage = coverImage;
    if (category) target.category = category;
    if (status) target.status = status;
    if (tags !== undefined) {
      target.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
    target.updatedAt = new Date().toISOString();

    posts[postIndex] = target;
    setStored(STORAGE_KEY_POSTS, posts);

    return {
      success: true,
      message: 'Article updated successfully.',
      post: target,
    };
  }

  // DELETE post: DELETE /api/posts/:id
  if (postDetailMatch && method === 'DELETE') {
    if (!currentUser) throw new Error('Authentication required.');
    const postId = postDetailMatch[1];
    const postIndex = posts.findIndex((p) => p._id === postId || p.id === postId);

    if (postIndex === -1) throw new Error('Article not found.');

    const target = posts[postIndex];
    const authorId = target.author?._id || target.author?.id || target.author;
    const isAuthor = authorId === currentUser._id || authorId === currentUser.id;
    const isAdmin = currentUser.role === 'admin';

    if (!isAuthor && !isAdmin) {
      throw new Error('Not authorized to delete this article.');
    }

    posts.splice(postIndex, 1);
    setStored(STORAGE_KEY_POSTS, posts);

    // Delete associated comments
    comments = comments.filter((c) => (c.post?._id || c.post?.id || c.post) !== postId);
    setStored(STORAGE_KEY_COMMENTS, comments);

    return { success: true, message: 'Article deleted successfully.' };
  }

  // --- COMMENTS ENDPOINTS ---
  // GET comments: GET /api/posts/:id/comments
  const commentsMatch = pathname.match(/^\/api\/posts\/([^/]+)\/comments$/);
  if (commentsMatch && method === 'GET') {
    const postId = commentsMatch[1];
    const postComments = comments
      .filter((c) => (c.post?._id || c.post?.id || c.post) === postId && !c.parentComment)
      .map((top) => {
        const topId = top._id || top.id;
        const replies = comments.filter((c) => c.parentComment === topId);
        return {
          ...top,
          replies: replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      success: true,
      total: postComments.length,
      comments: postComments,
    };
  }

  // POST comment: POST /api/posts/:id/comments
  if (commentsMatch && method === 'POST') {
    if (!currentUser) throw new Error('Please log in to post a comment.');
    const postId = commentsMatch[1];
    const { content, parentCommentId } = body;

    if (!content || !content.trim()) {
      throw new Error('Comment content cannot be empty.');
    }

    const newComment = {
      _id: `cmt_${Date.now()}`,
      id: `cmt_${Date.now()}`,
      post: postId,
      author: currentUser,
      content: content.trim(),
      parentComment: parentCommentId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
    };

    comments.unshift(newComment);
    setStored(STORAGE_KEY_COMMENTS, comments);

    return {
      success: true,
      message: parentCommentId ? 'Reply posted successfully.' : 'Comment posted successfully.',
      comment: newComment,
    };
  }

  // PUT /api/comments/:id
  const commentDetailMatch = pathname.match(/^\/api\/comments\/([^/]+)$/);
  if (commentDetailMatch && method === 'PUT') {
    if (!currentUser) throw new Error('Authentication required.');
    const commentId = commentDetailMatch[1];
    const { content } = body;

    if (!content || !content.trim()) throw new Error('Comment content cannot be empty.');

    const cIndex = comments.findIndex((c) => c._id === commentId || c.id === commentId);
    if (cIndex === -1) throw new Error('Comment not found.');

    const target = comments[cIndex];
    const authorId = target.author?._id || target.author?.id || target.author;
    const isAuthor = authorId === currentUser._id || authorId === currentUser.id;
    const isAdmin = currentUser.role === 'admin';

    if (!isAuthor && !isAdmin) throw new Error('Not authorized to edit this comment.');

    target.content = content.trim();
    target.updatedAt = new Date().toISOString();
    comments[cIndex] = target;
    setStored(STORAGE_KEY_COMMENTS, comments);

    return {
      success: true,
      message: 'Comment updated successfully.',
      comment: target,
    };
  }

  // DELETE /api/comments/:id
  if (commentDetailMatch && method === 'DELETE') {
    if (!currentUser) throw new Error('Authentication required.');
    const commentId = commentDetailMatch[1];
    const cIndex = comments.findIndex((c) => c._id === commentId || c.id === commentId);
    if (cIndex === -1) throw new Error('Comment not found.');

    const target = comments[cIndex];
    const authorId = target.author?._id || target.author?.id || target.author;
    const isAuthor = authorId === currentUser._id || authorId === currentUser.id;
    const isAdmin = currentUser.role === 'admin';

    if (!isAuthor && !isAdmin) throw new Error('Not authorized to delete this comment.');

    // Remove comment and any replies referencing it
    comments = comments.filter(
      (c) => c._id !== commentId && c.id !== commentId && c.parentComment !== commentId
    );
    setStored(STORAGE_KEY_COMMENTS, comments);

    return { success: true, message: 'Comment deleted successfully.' };
  }

  // --- USER PROFILE & USER POSTS ---
  const userPostsMatch = pathname.match(/^\/api\/users\/([^/]+)\/posts$/);
  if (userPostsMatch && method === 'GET') {
    const userId = userPostsMatch[1];
    const userPosts = posts.filter(
      (p) => (p.author?._id || p.author?.id || p.author) === userId
    );
    return {
      success: true,
      count: userPosts.length,
      posts: userPosts,
    };
  }

  const userDetailMatch = pathname.match(/^\/api\/users\/([^/]+)$/);
  if (userDetailMatch && method === 'GET') {
    const userId = userDetailMatch[1];
    const user = users.find((u) => u._id === userId || u.id === userId);
    if (!user) throw new Error('User not found.');
    const postCount = posts.filter(
      (p) => (p.author?._id || p.author?.id || p.author) === userId && p.status === 'published'
    ).length;
    return {
      success: true,
      user: { ...user, totalPosts: postCount },
    };
  }

  if (pathname === '/api/users/profile' && method === 'PUT') {
    if (!currentUser) throw new Error('Authentication required.');
    const { fullName, bio, profileImage, username } = body;

    const uIndex = users.findIndex((u) => u._id === currentUser._id);
    if (uIndex === -1) throw new Error('User not found.');

    if (fullName) users[uIndex].fullName = fullName;
    if (bio !== undefined) users[uIndex].bio = bio;
    if (profileImage) users[uIndex].profileImage = profileImage;
    if (username) users[uIndex].username = username.toLowerCase();

    setStored(STORAGE_KEY_USERS, users);
    setStored(STORAGE_KEY_CURRENT_USER, users[uIndex]);

    return {
      success: true,
      message: 'Profile updated successfully.',
      user: users[uIndex],
    };
  }

  // --- ADMIN ENDPOINTS ---
  if (pathname === '/api/admin/dashboard' && method === 'GET') {
    if (!currentUser || currentUser.role !== 'admin') throw new Error('Administrator privileges required.');

    const categoryMap = {};
    posts.forEach((p) => {
      categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
    });

    const categoryBreakdown = Object.keys(categoryMap).map((cat) => ({
      _id: cat,
      count: categoryMap[cat],
    }));

    return {
      success: true,
      stats: {
        totalUsers: users.length,
        totalPosts: posts.length,
        totalPublishedPosts: posts.filter((p) => p.status === 'published').length,
        totalComments: comments.length,
        categoryBreakdown,
        recentUsers: users.slice(-5).reverse(),
        recentPosts: posts.slice(-5).reverse(),
        recentComments: comments.slice(-5).reverse(),
      },
    };
  }

  if (pathname === '/api/admin/users' && method === 'GET') {
    if (!currentUser || currentUser.role !== 'admin') throw new Error('Administrator privileges required.');
    const usersWithStats = users.map((user) => {
      const pCount = posts.filter(
        (p) => (p.author?._id || p.author?.id || p.author) === (user._id || user.id)
      ).length;
      return { ...user, postsCount: pCount };
    });
    return { success: true, count: usersWithStats.length, users: usersWithStats };
  }

  const adminUserRoleMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)\/role$/);
  if (adminUserRoleMatch && method === 'PUT') {
    if (!currentUser || currentUser.role !== 'admin') throw new Error('Administrator privileges required.');
    const userId = adminUserRoleMatch[1];
    const { role } = body;
    const uIndex = users.findIndex((u) => u._id === userId || u.id === userId);
    if (uIndex === -1) throw new Error('User not found.');

    users[uIndex].role = role;
    setStored(STORAGE_KEY_USERS, users);
    return { success: true, message: `Role updated to ${role}.`, user: users[uIndex] };
  }

  if (pathname === '/api/admin/posts' && method === 'GET') {
    if (!currentUser || currentUser.role !== 'admin') throw new Error('Administrator privileges required.');
    return { success: true, count: posts.length, posts };
  }

  const adminPostDeleteMatch = pathname.match(/^\/api\/admin\/posts\/([^/]+)$/);
  if (adminPostDeleteMatch && method === 'DELETE') {
    if (!currentUser || currentUser.role !== 'admin') throw new Error('Administrator privileges required.');
    const postId = adminPostDeleteMatch[1];
    posts = posts.filter((p) => p._id !== postId && p.id !== postId);
    comments = comments.filter((c) => (c.post?._id || c.post?.id || c.post) !== postId);
    setStored(STORAGE_KEY_POSTS, posts);
    setStored(STORAGE_KEY_COMMENTS, comments);
    return { success: true, message: 'Article removed by administrator.' };
  }

  const adminCommentDeleteMatch = pathname.match(/^\/api\/admin\/comments\/([^/]+)$/);
  if (adminCommentDeleteMatch && method === 'DELETE') {
    if (!currentUser || currentUser.role !== 'admin') throw new Error('Administrator privileges required.');
    const commentId = adminCommentDeleteMatch[1];
    comments = comments.filter(
      (c) => c._id !== commentId && c.id !== commentId && c.parentComment !== commentId
    );
    setStored(STORAGE_KEY_COMMENTS, comments);
    return { success: true, message: 'Comment removed by administrator.' };
  }

  throw new Error(`Unhandled mock route: ${method} ${endpoint}`);
};
