const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a resource title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Please select a department'],
      trim: true,
    },
    year: {
      type: String,
      required: [true, 'Please select a year'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Please select a semester'],
      min: 1,
      max: 8,
    },
    subject: {
      type: String,
      required: [true, 'Please add a subject name'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please select resource type'],
      enum: ['Notes', 'PYQ', 'Reference Material', 'PPT', 'Lab Manual'],
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
    },
    filePath: {
      type: String,
      required: [true, 'File path is required'],
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    fileMimeType: {
      type: String,
      default: '',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'approved',
    },
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        userName: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          trim: true,
          default: '',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Add text index for fast and flexible text searches
resourceSchema.index({ title: 'text', subject: 'text', description: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
