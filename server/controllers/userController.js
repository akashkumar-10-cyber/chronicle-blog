const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    const postCount = await Post.countDocuments({
      author: user._id,
      status: 'published',
    });

    res.json({
      success: true,
      user: {
        _id: user._id,
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profileImage: user.profileImage,
        role: user.role,
        createdAt: user.createdAt,
        totalPosts: postCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const { fullName, bio, profileImage, username } = req.body;

    if (username && username.toLowerCase() !== user.username) {
      const usernameExists = await User.findOne({ username: username.toLowerCase() });
      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: 'That username is already taken.',
        });
      }
      user.username = username.toLowerCase();
    }

    if (fullName) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    if (profileImage) user.profileImage = profileImage;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        _id: updatedUser._id,
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio,
        profileImage: updatedUser.profileImage,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts by a specific user
// @route   GET /api/users/:id/posts
// @access  Public
const getUserPosts = async (req, res, next) => {
  try {
    const isOwnerOrAdmin =
      req.user && (req.user._id.toString() === req.params.id || req.user.role === 'admin');

    const filter = { author: req.params.id };
    if (!isOwnerOrAdmin) {
      filter.status = 'published';
    }

    const posts = await Post.find(filter)
      .populate('author', 'fullName username profileImage role')
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

module.exports = { getUserById, updateProfile, getUserPosts };
