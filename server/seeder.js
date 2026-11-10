require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const sampleArticles = require('./sampleArticles');

const seedData = async (options = { exitOnComplete: true }) => {
  try {
    console.log('[Seeder] Connecting to database...');
    await connectDB();

    // Check if database already has posts
    const existingPostsCount = await Post.countDocuments();
    if (existingPostsCount > 0 && !options.force) {
      console.log(`[Seeder] Database already contains ${existingPostsCount} posts. Skipping seed.`);
      if (options.exitOnComplete) process.exit(0);
      return;
    }

    if (options.force) {
      console.log('[Seeder] Force mode enabled: Clearing existing database collections...');
      await Comment.deleteMany({});
      await Post.deleteMany({});
      await User.deleteMany({});
    }

    console.log('[Seeder] Creating admin and authors...');

    // 1. Admin User
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@chronicle.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        fullName: 'Eleanor Vance',
        username: 'admin_eleanor',
        email: adminEmail,
        password: adminPassword,
        bio: 'Chief Editor and Platform Administrator at Chronicle. Overseeing editorial direction, code ethics, and platform reliability.',
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        role: 'admin',
      });
      console.log(`[Seeder] Created Admin user: ${adminEmail}`);
    }

    // 2. Demo Author 1 (Tech & AI)
    let author1 = await User.findOne({ email: 'sarah.chen@chronicle.com' });
    if (!author1) {
      author1 = await User.create({
        fullName: 'Dr. Sarah Chen',
        username: 'sarah_chen',
        email: 'sarah.chen@chronicle.com',
        password: 'Author@123456',
        bio: 'Senior AI Research Engineer & Systems Architect. Writing on generative pipelines, cognitive agents, and distributed computing.',
        profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
        role: 'user',
      });
      console.log(`[Seeder] Created Author 1: sarah.chen@chronicle.com`);
    }

    // 3. Demo Author 2 (Design & Lifestyle)
    let author2 = await User.findOne({ email: 'marcus.rossi@chronicle.com' });
    if (!author2) {
      author2 = await User.create({
        fullName: 'Marcus Rossi',
        username: 'marcus_rossi',
        email: 'marcus.rossi@chronicle.com',
        password: 'Author@123456',
        bio: 'Design technologist, world traveler, and minimalist living advocate. Exploring the intersection of human attention and digital craft.',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        role: 'user',
      });
      console.log(`[Seeder] Created Author 2: marcus.rossi@chronicle.com`);
    }

    // 4. Demo Author 3 (Business & Cinema)
    let author3 = await User.findOne({ email: 'maya.patel@chronicle.com' });
    if (!author3) {
      author3 = await User.create({
        fullName: 'Maya Patel',
        username: 'maya_patel',
        email: 'maya.patel@chronicle.com',
        password: 'Author@123456',
        bio: 'SaaS founder, angel investor, and film enthusiast. Unpacking unit economics and creative virtual production.',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        role: 'user',
      });
      console.log(`[Seeder] Created Author 3: maya.patel@chronicle.com`);
    }

    const authors = [adminUser, author1, author2, author3];

    // Seed Posts
    console.log('[Seeder] Inserting 10 sample articles across all categories...');
    const createdPosts = [];

    for (let i = 0; i < sampleArticles.length; i++) {
      const article = sampleArticles[i];
      const author = authors[i % authors.length];

      const post = await Post.create({
        ...article,
        author: author._id,
        views: 45 + Math.floor(Math.random() * 320),
      });

      createdPosts.push(post);
    }
    console.log(`[Seeder] Successfully created ${createdPosts.length} articles.`);

    // Seed Sample Comments and Replies on first 3 articles
    console.log('[Seeder] Adding realistic comments and nested replies...');

    // Article 1 Comments
    const comment1 = await Comment.create({
      post: createdPosts[0]._id,
      author: author2._id,
      content: 'This breakdown of idempotent consumer design is gold. We suffered cascading failures last month due to missing deduplication in our payment pipeline.',
    });

    await Comment.create({
      post: createdPosts[0]._id,
      author: author1._id,
      content: 'Glad this resonated! The correlation ID headers combined with a Redis bloom filter or transactional ledger usually resolve 99% of duplicate deliveries.',
      parentComment: comment1._id,
    });

    await Comment.create({
      post: createdPosts[0]._id,
      author: adminUser._id,
      content: 'Featured this piece in the editor newsletter. Essential reading for our backend engineering team.',
    });

    // Article 2 Comments
    const comment2 = await Comment.create({
      post: createdPosts[1]._id,
      author: author3._id,
      content: 'Discriminated unions completely eliminated runtime null pointer exceptions across our client-side state machine. Wonderful explanation.',
    });

    await Comment.create({
      post: createdPosts[1]._id,
      author: author2._id,
      content: 'Pairing discriminated unions with exhaustive switch statement checks using TypeScript `never` is also super powerful!',
      parentComment: comment2._id,
    });

    // Article 3 Comments
    await Comment.create({
      post: createdPosts[2]._id,
      author: author1._id,
      content: 'Multi-agent cognitive loops will reshape how we build software over the next 24 months. Boundaries and sandboxing are critical.',
    });

    console.log('[Seeder] Seeding completed successfully!');
    if (options.exitOnComplete) {
      process.exit(0);
    }
  } catch (error) {
    console.error(`[Seeder Error] ${error.message}`);
    if (options.exitOnComplete) {
      process.exit(1);
    }
  }
};

// If run directly from CLI
if (require.main === module) {
  const force = process.argv.includes('--force');
  seedData({ exitOnComplete: true, force });
}

module.exports = seedData;
