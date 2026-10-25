const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserRole,
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Admin Routes
router.get('/admin/users', protect, admin, getAllUsers);
router.patch('/admin/users/:id/role', protect, admin, updateUserRole);

module.exports = router;
