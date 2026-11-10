const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a blog title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a short summary description'],
      trim: true,
      maxlength: [400, 'Description cannot exceed 400 characters'],
    },
    content: {
      type: String,
      required: [true, 'Please provide the article content'],
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Technology',
        'Programming',
        'Artificial Intelligence',
        'Education',
        'Lifestyle',
        'Travel',
        'Business',
        'Entertainment',
      ],
      default: 'Technology',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
    },
    readingTime: {
      type: Number,
      default: 3,
    },
    views: {
      type: Number,
      default: 0,
    },
    isSample: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate reading time before save
postSchema.pre('save', function (next) {
  if (this.content) {
    const wordCount = this.content.trim().split(/\s+/).length;
    this.readingTime = Math.max(1, Math.ceil(wordCount / 200));
  }
  next();
});

// Index for full-text search across title, description, content, tags
postSchema.index({ title: 'text', description: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Post', postSchema);
