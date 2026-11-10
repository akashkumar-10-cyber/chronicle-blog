const Post = require('../models/Post');
const Comment = require('../models/Comment');

// @desc    Get all published posts with filtering, search, sorting & pagination
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 9;
    const skip = (page - 1) * limit;

    const { search, category, tag, author, sort } = req.query;

    const query = { status: 'published' };

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Tag filter
    if (tag) {
      query.tags = { $in: [new RegExp(`^${tag}$`, 'i')] };
    }

    // Author filter
    if (author) {
      query.author = author;
    }

    // Search filter across title, description, content, tags
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $in: [searchRegex] } },
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'popular') {
      sortOption = { views: -1, createdAt: -1 };
    }

    const totalPosts = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'fullName username profileImage role')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    // Attach comments count for each post
    const postIds = posts.map((p) => p._id);
    const commentCounts = await Comment.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: '$post', count: { $sum: 1 } } },
    ]);

    const commentCountMap = {};
    commentCounts.forEach((c) => {
      commentCountMap[c._id.toString()] = c.count;
    });

    const postsWithCounts = posts.map((post) => {
      const obj = post.toObject();
      obj.commentsCount = commentCountMap[post._id.toString()] || 0;
      return obj;
    });

    // If requested, sort by most commented
    if (sort === 'comments') {
      postsWithCounts.sort((a, b) => b.commentsCount - a.commentsCount);
    }

    res.json({
      success: true,
      total: totalPosts,
      page,
      pages: Math.ceil(totalPosts / limit) || 1,
      limit,
      posts: postsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by ID with related posts
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'author',
      'fullName username profileImage bio role createdAt'
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Article not found.',
      });
    }

    // Increment views
    post.views = (post.views || 0) + 1;
    await post.save({ validateBeforeSave: false });

    // Count comments
    const commentsCount = await Comment.countDocuments({ post: post._id });

    // Find related articles (same category, different ID)
    const relatedPosts = await Post.find({
      category: post.category,
      _id: { $ne: post._id },
      status: 'published',
    })
      .select('title description coverImage category readingTime createdAt')
      .limit(3);

    const postObj = post.toObject();
    postObj.commentsCount = commentsCount;

    res.json({
      success: true,
      post: postObj,
      relatedPosts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new blog post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { title, description, content, coverImage, category, tags, status } = req.body;

    if (!title || !description || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, short description, and content for the article.',
      });
    }

    // Parse tags if array or string
    let parsedTags = [];
    if (Array.isArray(tags)) {
      parsedTags = tags.map((t) => t.trim()).filter(Boolean);
    } else if (typeof tags === 'string') {
      parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    // Calculate reading time
    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const post = await Post.create({
      title,
      description,
      content,
      coverImage:
        coverImage ||
        'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
      category: category || 'Technology',
      tags: parsedTags,
      author: req.user._id,
      status: status || 'published',
      readingTime,
    });

    const populatedPost = await Post.findById(post._id).populate(
      'author',
      'fullName username profileImage role'
    );

    res.status(201).json({
      success: true,
      message: 'Article published successfully.',
      post: populatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing blog post
// @route   PUT /api/posts/:id
// @access  Private (Author or Admin)
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Article not found.',
      });
    }

    // Check ownership or admin status
    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this article. Only the author or an admin can edit it.',
      });
    }

    const { title, description, content, coverImage, category, tags, status } = req.body;

    if (title) post.title = title;
    if (description) post.description = description;
    if (content) {
      post.content = content;
      const wordCount = content.trim().split(/\s+/).length;
      post.readingTime = Math.max(1, Math.ceil(wordCount / 200));
    }
    if (coverImage) post.coverImage = coverImage;
    if (category) post.category = category;
    if (status) post.status = status;

    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        post.tags = tags.map((t) => t.trim()).filter(Boolean);
      } else if (typeof tags === 'string') {
        post.tags = tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    const updatedPost = await post.save();
    const populated = await Post.findById(updatedPost._id).populate(
      'author',
      'fullName username profileImage role'
    );

    res.json({
      success: true,
      message: 'Article updated successfully.',
      post: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a blog post
// @route   DELETE /api/posts/:id
// @access  Private (Author or Admin)
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Article not found.',
      });
    }

    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this article.',
      });
    }

    // Delete associated comments
    await Comment.deleteMany({ post: post._id });

    // Delete post
    await Post.findByIdAndDelete(post._id);

    res.json({
      success: true,
      message: 'Article and associated comments deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};
