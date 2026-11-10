const Comment = require('../models/Comment');
const Post = require('../models/Post');

// @desc    Get all comments for a post (structured with nested replies)
// @route   GET /api/posts/:id/comments
// @access  Public
const getPostComments = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Article not found.',
      });
    }

    // Fetch all comments for this post
    const comments = await Comment.find({ post: post._id })
      .populate('author', 'fullName username profileImage role')
      .sort({ createdAt: -1 });

    // Structure into top-level comments and replies
    const topLevelComments = [];
    const replyMap = {};

    comments.forEach((comment) => {
      const c = comment.toObject();
      if (!c.parentComment) {
        c.replies = [];
        topLevelComments.push(c);
      } else {
        const parentId = c.parentComment.toString();
        if (!replyMap[parentId]) {
          replyMap[parentId] = [];
        }
        replyMap[parentId].push(c);
      }
    });

    // Attach replies to top-level comments (or recursive if needed, but 1-level nesting is clean and standard)
    topLevelComments.forEach((topComment) => {
      topComment.replies = (replyMap[topComment._id.toString()] || []).sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    });

    res.json({
      success: true,
      total: comments.length,
      comments: topLevelComments,
      rawCount: comments.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a comment or reply on a post
// @route   POST /api/posts/:id/comments
// @access  Private
const createComment = async (req, res, next) => {
  try {
    const { content, parentCommentId } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty.',
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Article not found.',
      });
    }

    let parentComment = null;
    if (parentCommentId) {
      parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'The comment you are attempting to reply to does not exist.',
        });
      }
    }

    const newComment = await Comment.create({
      post: post._id,
      author: req.user._id,
      content: content.trim(),
      parentComment: parentComment ? parentComment._id : null,
    });

    const populated = await Comment.findById(newComment._id).populate(
      'author',
      'fullName username profileImage role'
    );

    const commentObj = populated.toObject();
    commentObj.replies = [];

    res.status(201).json({
      success: true,
      message: parentComment ? 'Reply posted successfully.' : 'Comment posted successfully.',
      comment: commentObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private (Author or Admin)
const updateComment = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty.',
      });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this comment.',
      });
    }

    comment.content = content.trim();
    const updated = await comment.save();

    const populated = await Comment.findById(updated._id).populate(
      'author',
      'fullName username profileImage role'
    );

    res.json({
      success: true,
      message: 'Comment updated successfully.',
      comment: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (Author or Admin)
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this comment.',
      });
    }

    // Delete nested replies if this is a top-level comment
    await Comment.deleteMany({ parentComment: comment._id });

    // Delete the comment itself
    await Comment.findByIdAndDelete(comment._id);

    res.json({
      success: true,
      message: 'Comment deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
};
