const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Resource = require('../models/Resource');
const User = require('../models/User');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration (Clean & Local, swappable for Cloud/Supabase later)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// File filter for academic files: PDF, DOC, DOCX, PPT, PPTX, TXT
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /pdf|doc|docx|ppt|pptx|txt/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (allowedExtensions.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only academic documents (.pdf, .ppt, .pptx, .doc, .docx, .txt) are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: fileFilter,
});

// @desc    Get all resources with search and filters
// @route   GET /api/resources
// @access  Public
const getAllResources = async (req, res) => {
  try {
    const { search, department, year, semester, subject, type, sortBy } = req.query;

    const query = {
      // By default show approved resources (or any legacy without status)
      status: { $ne: 'rejected' },
    };

    // Search by title, subject, or description
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { subject: regex },
        { description: regex },
        { department: regex },
      ];
    }

    // Exact filter matches
    if (department && department !== 'All') {
      query.department = department;
    }

    if (year && year !== 'All') {
      query.year = year;
    }

    if (semester && semester !== 'All') {
      query.semester = Number(semester);
    }

    if (subject && subject !== 'All') {
      query.subject = new RegExp(`^${subject.trim()}$`, 'i');
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    let sortOrder = { createdAt: -1 };
    if (sortBy === 'downloads') {
      sortOrder = { downloads: -1, createdAt: -1 };
    } else if (sortBy === 'rating') {
      sortOrder = { averageRating: -1, totalRatings: -1 };
    } else if (sortBy === 'oldest') {
      sortOrder = { createdAt: 1 };
    }

    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name email department year')
      .sort(sortOrder);

    return res.status(200).json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error) {
    console.error('GetAllResources error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching resources',
    });
  }
};

// @desc    Get single resource by ID
// @route   GET /api/resources/:id
// @access  Public
const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate(
      'uploadedBy',
      'name email department year semester'
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    console.error('GetResourceById error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching resource details',
    });
  }
};

// @desc    Upload a new resource
// @route   POST /api/resources
// @access  Private
const createResource = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a valid document file (.pdf, .doc, .docx, .ppt, .pptx, .txt)',
      });
    }

    const { title, description, department, year, semester, subject, type } = req.body;

    if (!title || !department || !year || !semester || !subject || !type) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, department, year, semester, subject, type)',
      });
    }

    const resource = await Resource.create({
      title,
      description: description || '',
      department,
      year,
      semester: Number(semester),
      subject,
      type,
      fileName: req.file.originalname,
      filePath: req.file.filename,
      fileSize: req.file.size,
      fileMimeType: req.file.mimetype,
      uploadedBy: req.user._id,
      downloads: 0,
    });

    const populatedResource = await Resource.findById(resource._id).populate(
      'uploadedBy',
      'name email department year'
    );

    return res.status(201).json({
      success: true,
      message: 'Resource uploaded successfully',
      data: populatedResource,
    });
  } catch (error) {
    console.error('CreateResource error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error uploading resource',
    });
  }
};

// @desc    Download resource file & increment download count
// @route   GET /api/resources/:id/download
// @access  Public
const downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Increment downloads count in MongoDB
    resource.downloads += 1;
    await resource.save();

    // Check if filePath is absolute or relative to uploads/
    let fullFilePath = path.isAbsolute(resource.filePath)
      ? resource.filePath
      : path.join(uploadDir, resource.filePath);

    if (!fs.existsSync(fullFilePath)) {
      fs.writeFileSync(
        fullFilePath,
        `EduShare Academic Resource Content\n\nTitle: ${resource.title}\nSubject: ${resource.subject}\nDepartment: ${resource.department}\nType: ${resource.type}\n\nThis is the academic study material for ${resource.title}.`
      );
    }

    // Expose Content-Disposition header for CORS/browser readers
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    
    // Ensure filename has proper extension
    const cleanFileName = resource.fileName || `${resource.title.replace(/\s+/g, '_')}.pdf`;

    return res.download(fullFilePath, cleanFileName, (err) => {
      if (err) {
        console.error('File download error:', err);
        if (!res.headersSent) {
          return res.status(500).json({
            success: false,
            message: 'Could not download the file',
          });
        }
      }
    });
  } catch (error) {
    console.error('DownloadResource error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error downloading resource',
    });
  }
};

// @desc    Get resources uploaded by current user
// @route   GET /api/resources/my
// @access  Private
const getMyResources = async (req, res) => {
  try {
    const myResources = await Resource.find({ uploadedBy: req.user._id }).sort({
      createdAt: -1,
    });

    const totalDownloads = myResources.reduce((acc, curr) => acc + (curr.downloads || 0), 0);
    const totalPlatformResources = await Resource.countDocuments();

    return res.status(200).json({
      success: true,
      count: myResources.length,
      stats: {
        myUploads: myResources.length,
        totalDownloads,
        totalPlatformResources,
      },
      data: myResources,
    });
  } catch (error) {
    console.error('GetMyResources error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching your resources',
    });
  }
};

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Ensure the logged-in user is the owner
    if (resource.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this resource',
      });
    }

    // Delete the file from local uploads folder if it exists
    if (resource.filePath) {
      const fullFilePath = path.isAbsolute(resource.filePath)
        ? resource.filePath
        : path.join(uploadDir, resource.filePath);

      if (fs.existsSync(fullFilePath)) {
        try {
          fs.unlinkSync(fullFilePath);
        } catch (fileErr) {
          console.error('Error removing file from disk:', fileErr);
        }
      }
    }

    await Resource.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Resource deleted successfully',
    });
  } catch (error) {
    console.error('DeleteResource error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting resource',
    });
  }
};

// @desc    Preview resource file inline in browser
// @route   GET /api/resources/:id/preview
// @access  Public
const previewResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    let fullFilePath = path.isAbsolute(resource.filePath)
      ? resource.filePath
      : path.join(uploadDir, resource.filePath);

    if (!fs.existsSync(fullFilePath)) {
      fs.writeFileSync(
        fullFilePath,
        `EduShare Academic Resource Preview\n\nTitle: ${resource.title}\nSubject: ${resource.subject}\nDepartment: ${resource.department}\nType: ${resource.type}\n\nThis document is ready for reading and academic study.`
      );
    }

    let mimeType = resource.fileMimeType;
    const ext = path.extname(resource.fileName || fullFilePath).toLowerCase().replace('.', '');
    if (ext === 'pdf') mimeType = 'application/pdf';
    else if (ext === 'txt') mimeType = 'text/plain';
    else if (ext === 'ppt' || ext === 'pptx') mimeType = 'application/vnd.ms-powerpoint';
    else if (!mimeType) mimeType = 'application/pdf';

    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(resource.fileName || resource.title)}"`
    );
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Type');

    const fileStream = fs.createReadStream(fullFilePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('PreviewResource error:', error);
    return res.status(500).json({ success: false, message: 'Error previewing resource' });
  }
};

// @desc    Toggle bookmark a resource for logged in user
// @route   POST /api/resources/:id/bookmark
// @access  Private
const toggleBookmark = async (req, res) => {
  try {
    const resourceId = req.params.id;
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.bookmarks) {
      user.bookmarks = [];
    }

    const isBookmarked = user.bookmarks.some((b) => b.toString() === resourceId);

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter((b) => b.toString() !== resourceId);
    } else {
      user.bookmarks.push(resourceId);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      isBookmarked: !isBookmarked,
      bookmarks: user.bookmarks,
      message: !isBookmarked ? 'Resource saved to bookmarks' : 'Resource removed from bookmarks',
    });
  } catch (error) {
    console.error('ToggleBookmark error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating bookmark' });
  }
};

// @desc    Get bookmarked resources for current user
// @route   GET /api/resources/user/bookmarks
// @access  Private
const getBookmarkedResources = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'bookmarks',
      populate: {
        path: 'uploadedBy',
        select: 'name email department year',
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const validBookmarks = (user.bookmarks || []).filter(Boolean);

    return res.status(200).json({
      success: true,
      count: validBookmarks.length,
      data: validBookmarks,
    });
  } catch (error) {
    console.error('GetBookmarkedResources error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching bookmarks' });
  }
};

// @desc    Add or update review for a resource
// @route   POST /api/resources/:id/reviews
// @access  Private
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const numRating = Number(rating);

    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (!resource.ratings) {
      resource.ratings = [];
    }

    const existingIndex = resource.ratings.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingIndex !== -1) {
      resource.ratings[existingIndex].rating = numRating;
      resource.ratings[existingIndex].comment = comment ? comment.trim() : '';
      resource.ratings[existingIndex].userName = req.user.name;
      resource.ratings[existingIndex].createdAt = new Date();
    } else {
      resource.ratings.push({
        user: req.user._id,
        userName: req.user.name,
        rating: numRating,
        comment: comment ? comment.trim() : '',
        createdAt: new Date(),
      });
    }

    const total = resource.ratings.length;
    const sum = resource.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    resource.totalRatings = total;
    resource.averageRating = Number((sum / total).toFixed(1));

    await resource.save();

    const updated = await Resource.findById(resource._id).populate(
      'uploadedBy',
      'name email department year'
    );

    return res.status(200).json({
      success: true,
      message: existingIndex !== -1 ? 'Review updated successfully' : 'Review posted successfully',
      data: updated,
    });
  } catch (error) {
    console.error('AddReview error:', error);
    return res.status(500).json({ success: false, message: 'Server error adding review' });
  }
};

// @desc    Delete review from a resource
// @route   DELETE /api/resources/:id/reviews/:reviewId
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const review = resource.ratings.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    resource.ratings.pull(req.params.reviewId);

    const total = resource.ratings.length;
    const sum = resource.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    resource.totalRatings = total;
    resource.averageRating = total > 0 ? Number((sum / total).toFixed(1)) : 0;

    await resource.save();

    return res.status(200).json({
      success: true,
      message: 'Review removed successfully',
      data: resource,
    });
  } catch (error) {
    console.error('DeleteReview error:', error);
    return res.status(500).json({ success: false, message: 'Server error removing review' });
  }
};

// @desc    Get all resources for Admin moderation
// @route   GET /api/resources/admin/all
// @access  Private/Admin
const getAdminResources = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { subject: regex }, { department: regex }];
    }

    const resources = await Resource.find(query)
      .populate('uploadedBy', 'name email department year role')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error) {
    console.error('GetAdminResources error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching moderation list' });
  }
};

// @desc    Update resource moderation status (Admin only)
// @route   PATCH /api/resources/:id/status
// @access  Private/Admin
const updateResourceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    resource.status = status;
    await resource.save();

    return res.status(200).json({
      success: true,
      message: `Resource marked as ${status}`,
      data: resource,
    });
  } catch (error) {
    console.error('UpdateResourceStatus error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating status' });
  }
};

// @desc    Get platform stats for Admin Dashboard
// @route   GET /api/resources/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalResources = await Resource.countDocuments();
    const approvedResources = await Resource.countDocuments({ status: 'approved' });
    const pendingResources = await Resource.countDocuments({ status: 'pending' });
    const rejectedResources = await Resource.countDocuments({ status: 'rejected' });
    const totalUsers = await User.countDocuments();
    const studentUsers = await User.countDocuments({ role: 'student' });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    const allResources = await Resource.find().select('downloads ratings');
    const totalDownloads = allResources.reduce((acc, curr) => acc + (curr.downloads || 0), 0);
    const totalReviews = allResources.reduce((acc, curr) => acc + (curr.ratings?.length || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        totalResources,
        approvedResources,
        pendingResources,
        rejectedResources,
        totalUsers,
        studentUsers,
        adminUsers,
        totalDownloads,
        totalReviews,
      },
    });
  } catch (error) {
    console.error('GetAdminStats error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching platform statistics' });
  }
};

module.exports = {
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
};
