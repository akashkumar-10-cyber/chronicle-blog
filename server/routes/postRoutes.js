const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const {
  getPostComments,
  createComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const { commentLimiter } = require('../middleware/rateLimiter');

// Post endpoints
router.route('/')
  .get(getPosts)
  .post(protect, createPost);

router.route('/:id')
  .get(getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);

// Comments nested under post
router.route('/:id/comments')
  .get(getPostComments)
  .post(protect, commentLimiter, createComment);

module.exports = router;
