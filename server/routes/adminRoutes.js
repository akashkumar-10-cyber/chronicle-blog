const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  getAllPosts,
  deletePostAdmin,
  deleteCommentAdmin,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/posts', getAllPosts);
router.delete('/posts/:id', deletePostAdmin);
router.delete('/comments/:id', deleteCommentAdmin);

module.exports = router;
