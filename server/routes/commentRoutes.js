const express = require('express');
const router = express.Router();
const { updateComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.route('/:id')
  .put(protect, updateComment)
  .delete(protect, deleteComment);

module.exports = router;
