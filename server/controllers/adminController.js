const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// @desc    Get system-wide platform statistics for Admin Dashboard
// @route   GET /api/admin/dashboard
// @access  Private (Admin Only)
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalPublishedPosts = await Post.countDocuments({ status: 'published' });
    const totalComments = await Comment.countDocuments();

    // Aggregated Category breakdown
    const categoryBreakdown = await Post.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Recent registered users
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent posts
    const recentPosts = await Post.find()
      .populate('author', 'fullName username email profileImage')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent comments
    const recentComments = await Comment.find()
      .populate('author', 'fullName username profileImage')
      .populate('post', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPosts,
        totalPublishedPosts,
        totalComments,
        categoryBreakdown,
        recentUsers,
        recentPosts,
        recentComments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with post counts
// @route   GET /api/admin/users
// @access  Private (Admin Only)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // Aggregate post counts per user
    const postCounts = await Post.aggregate([
      { $group: { _id: '$author', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    postCounts.forEach((pc) => {
      countMap[pc._id.toString()] = pc.count;
    });

    const usersWithStats = users.map((user) => {
      const obj = user.toObject();
      obj.postsCount = countMap[user._id.toString()] || 0;
      return obj;
    });

    res.json({
      success: true,
      count: usersWithStats.length,
      users: usersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a user's role (admin/user)
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin Only)
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Must be either "user" or "admin".',
      });
    }

    if (req.user._id.toString() === req.params.id && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove your own administrator privileges.',
      });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role successfully updated to ${role}.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts for moderation
// @route   GET /api/admin/posts
// @access  Private (Admin Only)
const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate('author', 'fullName username email profileImage role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Administrative deletion of any post
// @route   DELETE /api/admin/posts/:id
// @access  Private (Admin Only)
const deletePostAdmin = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Article not found.',
      });
    }

    // Cascade delete associated comments
    await Comment.deleteMany({ post: post._id });
    await Post.findByIdAndDelete(post._id);

    res.json({
      success: true,
      message: 'Article and associated comments successfully removed by administrator.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Administrative deletion of any comment
// @route   DELETE /api/admin/comments/:id
// @access  Private (Admin Only)
const deleteCommentAdmin = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    // Cascade delete replies
    await Comment.deleteMany({ parentComment: comment._id });
    await Comment.findByIdAndDelete(comment._id);

    res.json({
      success: true,
      message: 'Comment successfully removed by administrator.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  getAllPosts,
  deletePostAdmin,
  deleteCommentAdmin,
};
