const express = require('express');
const router = express.Router();
const {
  upload,
  getAllResources,
  getResourceById,
  createResource,
  downloadResource,
  previewResource,
  getMyResources,
  deleteResource,
  toggleBookmark,
  getBookmarkedResources,
  addReview,
  deleteReview,
  getAdminResources,
  updateResourceStatus,
  getAdminStats,
} = require('../controllers/resourceController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllResources);
router.get('/preview/:id', previewResource);
router.get('/my', protect, getMyResources);
router.get('/user/bookmarks', protect, getBookmarkedResources);

// Admin Moderation routes (defined before /:id parameter)
router.get('/admin/all', protect, admin, getAdminResources);
router.get('/admin/stats', protect, admin, getAdminStats);

// Single resource routes
router.get('/:id', getResourceById);
router.post('/', protect, upload.single('file'), createResource);
router.get('/:id/download', downloadResource);
router.get('/:id/preview', previewResource);
router.delete('/:id', protect, deleteResource);

// Bookmark & Review routes
router.post('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/reviews', protect, addReview);
router.delete('/:id/reviews/:reviewId', protect, deleteReview);

// Status update (Admin)
router.patch('/:id/status', protect, admin, updateResourceStatus);

module.exports = router;
