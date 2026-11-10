const express = require('express');
const router = express.Router();
const { getUserById, updateProfile, getUserPosts } = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/:id', getUserById);
router.put('/profile', protect, updateProfile);
router.get('/:id/posts', optionalAuth, getUserPosts);

module.exports = router;
