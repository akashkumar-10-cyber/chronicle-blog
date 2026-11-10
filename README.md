# 🖋️ Chronicle — Full-Stack Editorial Blog Platform with Comments

[![Deploy Chronicle Blog Platform](https://github.com/akashkumar-10-cyber/chronicle-blog/actions/workflows/deploy.yml/badge.svg)](https://github.com/akashkumar-10-cyber/chronicle-blog/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg)](https://tailwindcss.com)

A modern, production-grade, editorial-style **Full-Stack Blog Platform with Nested Comments**, built with **React**, **Node.js**, **Express.js**, **MongoDB Atlas**, and **Tailwind CSS**. Features comprehensive CRUD operations, full markdown writing with a live preview editor, hierarchical nested comment discussions, author dashboard, administrative control center, light/dark mode, and instant demo quick-fill authentication.

---

## 🌐 Live Public HTTPS Deployment

- **Public Production Website:** [https://akashkumar-10-cyber.github.io/chronicle-blog/](https://akashkumar-10-cyber.github.io/chronicle-blog/)
- **GitHub Repository:** [https://github.com/akashkumar-10-cyber/chronicle-blog](https://github.com/akashkumar-10-cyber/chronicle-blog)

> 🚀 **Publicly Accessible Worldwide**: Anyone from anywhere can access the application from mobile phones, laptops, desktops, and tablets without requiring any local installation.

---

## ⚡ Pre-Configured Instant Demo Logins

Both accounts can be signed in instantly with a single click on the login screen using the **"Instant Demo Quick-Fill"** buttons:

| Role | Email Address | Password | Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| **🛡️ Administrator** | `admin@chronicle.com` | `Admin@123456` | Full administrative oversight: delete any inappropriate post or comment across the platform, manage user accounts, promote/demote roles, inspect system KPIs. |
| **✍️ Author** | `sarah.chen@chronicle.com` | `Author@123456` | Publish articles with rich markdown, edit and delete own articles, post comments, reply to community threads, edit/delete own comments, manage profile. |

---

## ✨ Key Features & Capabilities

### 1. Editorial Reader Experience
- **Hero & Featured Publication**: Large magazine-style editorial showcase highlighting top articles.
- **Real-Time Discovery & Filtering**:
  - Live keyword search across title, description, tags, and content.
  - Category filters (*Technology, Programming, Artificial Intelligence, Education, Lifestyle, Travel, Business, Entertainment*).
  - Sorting by **Latest Articles**, **Most Popular (Views)**, and **Most Commented**.
  - Tag pill navigation.
  - Numbered pagination with page jump navigation.
- **Reading Comfort & Theming**:
  - Light and Dark modes with automatic OS system preference detection and manual toggle.
  - Automatic native UI scrollbar adaptation with `color-scheme: light dark`.
  - Calculated estimated reading time (e.g., `5 min read`).
  - View counters and social link sharing with instant clipboard feedback.

### 2. Rich Markdown Blog Writing & CRUD
- **Create Post**:
  - Title, short summary excerpt, category selection, and comma-separated tags.
  - Cover image URL with instant live preview and 1-click curated photo presets.
  - Dual-mode Markdown Editor with **Write** and **Live Preview** tabs.
  - Formatting toolbar (Bold, Italic, H1/H2/H3, Blockquote, Code Blocks, Lists, Links, Images).
  - Live word counter and estimated reading time.
  - Visibility status toggle (Published or Draft).
- **Edit Post**: Pre-fills existing markdown and updates directly.
- **Delete Post**: Safety confirmation modal with cascading removal of all associated comments.
- **Related Articles**: Recommends related articles in the same category automatically.

### 3. Community Comment & Reply System
- **Logged-in user participation**: Add comments to any article.
- **Hierarchical Nested Replies**: Reply directly to existing reader comments with 1-level threading.
- **Inline Editing**: Comment owners can edit their comments inline with instant DOM updates.
- **Comment Deletion**: Comment owners and administrators can remove comments with confirmation.
- **Real-Time UI Updates**: Modifies comments without requiring full page reload.
- **Anti-Spam Rate Limiting**: Enforced rate limiters on comment submission endpoints.

### 4. Personalized Creator Dashboard
- **Creator KPI Cards**: Total articles published, total comments received, total article views.
- **Articles Directory**: Table of user's published articles with quick View, Edit, and Delete actions.
- **Profile Customization**: Update Full Name, Username, Author Biography, and Profile Avatar with instant preview.

### 5. Administrative Control Center
- **Protected Administrator Guard**: Restricted strictly to users with `role: 'admin'`.
- **System KPIs**: Total registered users, total articles, total comments, category distribution.
- **Content Moderation**: Inspect all articles across the platform and remove violating posts.
- **Comment Moderation**: Review and delete inappropriate remarks across all discussions.
- **User Role Management**: Promote regular users to administrators or demote roles.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS 3.4, Lucide React, React Router v6 (`HashRouter`) |
| **Backend** | Node.js v20+, Express.js 4.21, Mongoose 8.9 |
| **Database** | MongoDB Atlas (Cloud NoSQL Database) / Local MongoDB fallback |
| **Authentication** | JSON Web Tokens (JWT), bcrypt.js password hashing |
| **Security** | Express Rate Limiter, CORS protection, sanitized inputs, role guards |
| **Hosting & CI/CD** | GitHub Pages (Automated GitHub Actions CI/CD), Vercel & Render Ready |

---

## 🏗️ Project Architecture & Directory Structure

```
intern-4/
├── .github/
│   └── workflows/
│       └── deploy.yml           # Automated GitHub Pages CI/CD workflow
├── api/
│   └── index.js                 # Serverless entrypoint for Vercel deployment
├── client/                      # React Frontend Application
│   ├── public/                  # Favicons and web assets
│   ├── src/
│   │   ├── components/          # Reusable UI widgets
│   │   │   ├── BlogCard.jsx     # Editorial blog card widget
│   │   │   ├── CommentItem.jsx  # Single comment with reply & edit mechanics
│   │   │   ├── CommentSection.jsx # Comments container & submission form
│   │   │   ├── Footer.jsx       # Editorial brand footer
│   │   │   ├── MarkdownEditor.jsx # Dual-mode write & preview editor
│   │   │   ├── MarkdownRenderer.jsx # Typography & code syntax formatter
│   │   │   ├── Modal.jsx        # Confirmation & alert modal
│   │   │   ├── Navbar.jsx       # Brand navigation bar with search & drawer
│   │   │   ├── Pagination.jsx   # Numbered pagination controls
│   │   │   └── ProtectedRoute.jsx # Auth & admin route guards
│   │   ├── context/             # React Context Providers
│   │   │   ├── AuthContext.jsx  # JWT state & persistent sessions
│   │   │   ├── ThemeContext.jsx # Light / Dark mode toggling
│   │   │   └── ToastContext.jsx # Animated notification alerts
│   │   ├── pages/               # Application Views
│   │   │   ├── AdminDashboardPage.jsx # Administrator control center
│   │   │   ├── CreateEditPostPage.jsx # Article composer & editor
│   │   │   ├── HomePage.jsx     # Featured showcase, search, filters & grid
│   │   │   ├── LoginPage.jsx    # Login form with 1-click demo buttons
│   │   │   ├── NotFoundPage.jsx # Custom 404 page
│   │   │   ├── PostDetailPage.jsx # Full article layout with comments
│   │   │   ├── ProfilePage.jsx  # Public author biography & articles
│   │   │   ├── RegisterPage.jsx # New member registration
│   │   │   └── UserDashboardPage.jsx # Creator articles, stats & profile
│   │   ├── utils/
│   │   │   ├── api.js           # Resilient dual-mode API request caller
│   │   │   ├── mockStore.js     # Persistent fallback storage engine
│   │   │   └── sampleData.js    # Seeded initial users, 10 articles & comments
│   │   ├── App.jsx              # Main routing & layout configuration
│   │   ├── index.css            # Custom scrollbars & article prose styles
│   │   └── main.jsx             # React DOM root entrypoint
│   ├── index.html               # HTML5 shell with meta tags & color-scheme
│   ├── tailwind.config.js       # Tailwind CSS theme extensions
│   └── vite.config.js           # Vite build and proxy configuration
├── server/                      # Node.js + Express REST API Backend
│   ├── config/
│   │   └── db.js                # MongoDB Mongoose database connector
│   ├── controllers/             # RESTful API route controllers
│   │   ├── adminController.js   # Analytics, user roles & moderation
│   │   ├── authController.js    # Register, login, me, logout
│   │   ├── commentController.js # Nested comments CRUD
│   │   ├── postController.js    # Articles CRUD, search, tags, pagination
│   │   └── userController.js    # Profiles & author articles
│   ├── middleware/
│   │   ├── auth.js              # JWT verification & adminOnly guards
│   │   ├── error.js             # 404 & global exception handlers
│   │   └── rateLimiter.js       # Auth and comment spam limiters
│   ├── models/                  # Mongoose Schemas (User, Post, Comment)
│   ├── routes/                  # Express Router modules
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── commentRoutes.js
│   │   ├── postRoutes.js
│   │   └── userRoutes.js
│   ├── sampleArticles.js        # 10 realistic sample articles
│   ├── seeder.js                # Database seeder script
│   └── server.js                # Express app entrypoint & static server
├── render.yaml                  # 1-Click Render Cloud deployment blueprint
├── vercel.json                  # Vercel serverless monorepo configuration
└── package.json                 # Monorepo scripts
```

---

## 📡 RESTful API Reference

### Authentication Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account with hashed password |
| `POST` | `/api/auth/login` | Public | Authenticate user credentials & issue JWT token |
| `POST` | `/api/auth/logout` | Public | Clear authentication session |
| `GET` | `/api/auth/me` | Private | Retrieve currently authenticated user profile |

### User Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/:id` | Public | Get public author profile with total articles count |
| `PUT` | `/api/users/profile` | Private | Update current user's full name, username, bio, and avatar |
| `GET` | `/api/users/:id/posts` | Public | Get all articles authored by a specific user |

### Blog Post Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts` | Public | Retrieve posts with search, category, tag, sort, pagination |
| `GET` | `/api/posts/:id` | Public | Get single article details, increment views, fetch related reads |
| `POST` | `/api/posts` | Private | Create and publish a new blog post |
| `PUT` | `/api/posts/:id` | Private (Author/Admin) | Update an existing blog post |
| `DELETE` | `/api/posts/:id` | Private (Author/Admin) | Delete an article and cascade delete its comments |

### Comment Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts/:id/comments` | Public | Get all comments with nested replies (newest first) |
| `POST` | `/api/posts/:id/comments` | Private | Submit top-level comment or reply to an existing comment |
| `PUT` | `/api/comments/:id` | Private (Author/Admin) | Edit a comment |
| `DELETE` | `/api/comments/:id` | Private (Author/Admin) | Delete a comment and its nested replies |

### Administrator Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Admin Only | Platform statistics, category breakdown, recent activity |
| `GET` | `/api/admin/users` | Admin Only | List all registered users with article counts |
| `PUT` | `/api/admin/users/:id/role` | Admin Only | Change user role (`admin` or `user`) |
| `GET` | `/api/admin/posts` | Admin Only | View all articles across the platform |
| `DELETE` | `/api/admin/posts/:id` | Admin Only | Administratively remove any article |
| `DELETE` | `/api/admin/comments/:id` | Admin Only | Administratively remove any comment |

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB Atlas connection string (or local MongoDB running at `mongodb://127.0.0.1:27017`)

### 2. Clone the Repository
```bash
git clone https://github.com/akashkumar-10-cyber/chronicle-blog.git
cd chronicle-blog
```

### 3. Install All Dependencies
```bash
npm run install:all
```

### 4. Configure Backend Environment
Create a `.env` file in the `server/` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/chronicle_blog?retryWrites=true&w=majority
JWT_SECRET=chronicle_production_jwt_secret_token_2026_super_secure
ADMIN_EMAIL=admin@chronicle.com
ADMIN_PASSWORD=Admin@123456
```

### 5. Seed the Database
Populate the database with the initial 10 comprehensive sample articles, author profiles, and realistic discussion threads:
```bash
npm run seed
```

### 6. Start Development Servers
In Terminal 1 (Backend API):
```bash
npm run server
```

In Terminal 2 (React Frontend):
```bash
npm run client
```

Open [http://localhost:3000](http://localhost:3000) to view the application locally.

---

## 🚀 Public Cloud Deployment Guide

### Option A: GitHub Pages (Live & Active)
1. Push changes to the `main` or `master` branch.
2. The included GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically builds the client and publishes the site to:
   `https://<your-username>.github.io/chronicle-blog/`

### Option B: Render Web Service (Full-Stack Monorepo)
1. Sign up at [render.com](https://render.com).
2. Click **New +** → **Blueprint**.
3. Select this GitHub repository. Render automatically reads `render.yaml` and configures:
   - Build Command: `npm run install:all && npm run build`
   - Start Command: `npm run server`
4. Provide your MongoDB Atlas `MONGO_URI` in the Render Environment Variables tab.
5. Your live website and REST API will be available at `https://chronicle-blog-platform.onrender.com`.

### Option C: Vercel (Serverless Deployment)
1. Sign up at [vercel.com](https://vercel.com).
2. Import `chronicle-blog`. Vercel automatically reads `vercel.json`.
3. Set `MONGO_URI` and `JWT_SECRET` in Project Settings → Environment Variables.
4. Click **Deploy**. Your live website will be accessible at `https://chronicle-blog.vercel.app`.

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
