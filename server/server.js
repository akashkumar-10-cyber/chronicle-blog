require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');

const { connectDB, getDBStatus } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');
const seedData = require('./seeder');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize database connection
connectDB().then(async (conn) => {
  if (conn) {
    try {
      // Auto-seed if database is freshly created with 0 articles
      const Post = require('./models/Post');
      const count = await Post.countDocuments();
      if (count === 0) {
        console.log('[Server] Database is empty. Running initial content seeder...');
        await seedData({ exitOnComplete: false, force: false });
      }
    } catch (e) {
      console.warn(`[Server Auto-Seed] Check skipped: ${e.message}`);
    }
  }
});

const app = express();

// Security & Utility Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health Check & Diagnostic Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Chronicle Full-Stack Blogging Platform',
    version: '1.0.0',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    database: getDBStatus(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);

// Serve static frontend assets if built
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      message: 'Chronicle Blog Platform REST API is active',
      version: '1.0.0',
      docs: '/api/health',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        posts: '/api/posts',
        comments: '/api/comments',
        admin: '/api/admin',
      },
    });
  });
}

// Global 404 & Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Chronicle Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

module.exports = app;
