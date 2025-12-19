# ZETA - Advanced Science Education Platform

<div align="center">

![ZETA Platform](https://img.shields.io/badge/ZETA-Science%20Platform-9333ea?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Version](https://img.shields.io/badge/version-2.0.0-blue?style=for-the-badge)

**A comprehensive full-stack science education platform with advanced quiz systems, research paper management, and multimedia content delivery.**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-configuration)
- [Usage Guide](#-usage-guide)
- [Admin Panel](#-admin-panel)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Security Features](#-security-features)
- [Performance Optimization](#-performance-optimization)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🌟 Overview

ZETA is a modern, full-stack science education platform designed to provide an engaging learning experience through interactive quizzes, curated research papers, educational YouTube channels, and downloadable applications. Built with performance, security, and user experience as core principles.

### What Makes ZETA Special?

- **🎯 Dual Quiz System**: Daily challenges and topic-based competitive quizzes
- **📚 Research Paper Library**: Organized scientific papers with search functionality
- **🎥 YouTube Integration**: Curated educational channels with visual previews
- **📱 App Marketplace**: Educational applications with download links
- **👨‍💼 Powerful Admin Dashboard**: Complete content management system
- **🌓 Theme Support**: Beautiful light and dark modes
- **📊 Progress Tracking**: Monitor quiz performance and learning progress
- **🚀 Serverless Architecture**: Lightning-fast performance with Vercel deployment

---

## ✨ Key Features

### For Students

#### 📝 Quiz System
- **Daily Quiz**: One question per day to maintain consistent learning
- **Competitive Quiz**: Topic-based quizzes with unlimited questions
- **Real-time Feedback**: Instant answer validation with correct/incorrect indicators
- **Progress Tracking**: Visual progress indicators showing attempted vs total questions
- **Answer Persistence**: Your answers are saved and visible on revisit
- **Question Numbering**: Clear organization with numbered questions

#### 📚 Research Papers
- **Searchable Database**: Quick search functionality to find papers by topic
- **PDF Integration**: Direct PDF viewing with Firebase storage
- **Recent Papers Section**: Quick access to latest additions
- **Detailed Descriptions**: Comprehensive paper summaries

#### 🎥 YouTube Channels
- **Visual Previews**: Channel thumbnails from ImgBB hosting
- **Curated Content**: Hand-picked educational science channels
- **Direct Links**: One-click access to channel pages
- **Responsive Cards**: Beautiful card-based layout

#### 📱 Educational Apps
- **App Gallery**: Browse educational applications
- **Feature Highlights**: Detailed app descriptions
- **Visual Previews**: App screenshots and icons via ImgBB
- **Download Links**: Direct download access

#### 🔐 Account Management
- **Secure Authentication**: JWT-based authentication system
- **Password Management**: Update password with current password verification
- **Security Questions**: Account recovery via security questions
- **Account Deletion**: Complete data removal option
- **Help Documentation**: Integrated PDF help guide

#### 🌓 User Experience
- **Dark/Light Theme**: Toggle between themes with persistence
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Welcome Screen**: Personalized onboarding experience
- **Toast Notifications**: Non-intrusive feedback messages
- **Keyboard Navigation**: Full keyboard accessibility support
- **Loading States**: Skeleton screens and progress indicators

### For Administrators

#### 🛠️ Admin Dashboard
- **Complete Content Control**: Manage all platform content from one place
- **Multi-tab Interface**: Organized sections for different content types
- **Real-time Updates**: Changes reflect immediately for all users

#### 📝 Quiz Management
- **Daily Quiz Editor**: Create and update daily quiz questions
- **Topic Management**: Create unlimited quiz topics
- **Question Editor**: Add, edit, and delete questions per topic
- **Bulk Import**: 🆕 CSV-based bulk question import for both daily and competitive quizzes
- **Visual Organization**: Expandable/collapsible topic sections
- **Question Counter**: See total questions per topic at a glance

#### 📥 Bulk Import System (NEW)
```csv
Question,Option A,Option B,Option C,Option D,Correct Answer
What is H2O?,Water,Oxygen,Hydrogen,Carbon,A
What is CO2?,Water,Carbon Dioxide,Oxygen,Nitrogen,B
```
- **CSV Format**: Simple comma-separated format
- **Error Handling**: Validation with success/failure counts
- **Batch Processing**: Import multiple questions at once
- **Format Validation**: Automatic checking for correct format

#### 📚 Content Management
- **Research Papers**: Add/edit/delete papers with PDF URLs
- **YouTube Channels**: Manage channels with thumbnail support
- **Apps Gallery**: Control app listings with image previews
- **Help System**: Update platform help documentation

#### 🖼️ Image Management
- **ImgBB Integration**: Host images for channels and apps
- **Google Drive Support**: Convert Drive share links to direct image URLs
- **Fallback Icons**: Automatic fallback for missing images
- **Preview Support**: Image previews in admin panel

---

## 🛠️ Technology Stack

### Frontend
```
HTML5, CSS3 (Custom CSS Variables)
Vanilla JavaScript (ES6+)
Responsive Design (Mobile-First)
CSS Grid & Flexbox
```

### Backend (Serverless)
```
Node.js 24.x
Express.js (Serverless Functions)
Vercel Serverless Platform
MongoDB Atlas
JWT Authentication
bcrypt.js (Password Hashing)
```

### Database
```
MongoDB Atlas (Cloud Database)
Mongoose ODM
Indexed Collections
```

### External Services
```
Firebase Storage (PDF Hosting)
ImgBB (Image Hosting)
Google Drive (Alternative Image Hosting)
Vercel (Frontend & Backend Deployment)
```

### Security
```
JWT Tokens (7-day expiration)
bcrypt Password Hashing (10 rounds)
CORS Configuration
Environment Variables
Input Sanitization
XSS Protection
```

---

## 🏗️ Architecture

### Project Structure

```
zeta/
├── frontend/                    # Client-side application
│   ├── index.html              # Main application page
│   ├── login.html              # Authentication page
│   ├── style.css               # Global styles with CSS variables
│   ├── app.js                  # Main application logic
│   ├── login.js                # Authentication logic
│   ├── admin.js                # Admin dashboard functionality
│   └── config.js               # API configuration
│
├── backend/                     # Serverless backend
│   ├── api/                    # Serverless function handlers
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── quiz.js            # Quiz endpoints
│   │   ├── papers.js          # Research papers endpoints
│   │   ├── channels.js        # YouTube channels endpoints
│   │   ├── apps.js            # Apps endpoints
│   │   ├── help.js            # Help system endpoints
│   │   └── admin.js           # Admin endpoints
│   │
│   ├── models/                 # MongoDB schemas
│   │   ├── User.js            # User model with auth
│   │   ├── Quiz.js            # Quiz models (Daily & Topics)
│   │   └── Content.js         # Content models (Papers, Channels, Apps, Help)
│   │
│   ├── lib/                    # Utility functions
│   │   └── db.js              # MongoDB connection handler
│   │
│   ├── package.json            # Backend dependencies
│   ├── vercel.json            # Vercel configuration
│   └── .env                   # Environment variables (not in git)
│
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

### Database Schema

#### User Schema
```javascript
{
  fullname: String,
  email: String (unique, lowercase),
  password: String (hashed),
  securityQuestion: String,
  securityAnswer: String (hashed),
  quizAnswers: [{
    questionId: ObjectId,
    answer: String (A/B/C/D),
    type: String (daily/competitive),
    answeredAt: Date
  }],
  createdAt: Date
}
```

#### Daily Quiz Schema
```javascript
{
  question: String,
  optionA: String,
  optionB: String,
  optionC: String,
  optionD: String,
  correctOption: String (A/B/C/D),
  createdAt: Date
}
```

#### Topic Schema (Competitive Quiz)
```javascript
{
  name: String,
  questions: [{
    question: String,
    optionA: String,
    optionB: String,
    optionC: String,
    optionD: String,
    correctOption: String (A/B/C/D)
  }],
  createdAt: Date
}
```

#### Paper Schema
```javascript
{
  topicName: String,
  description: String,
  pdfUrl: String,
  createdAt: Date
}
```

#### Channel Schema
```javascript
{
  name: String,
  description: String,
  url: String,
  photoUrl: String,
  createdAt: Date
}
```

#### App Schema
```javascript
{
  name: String,
  features: String,
  downloadUrl: String,
  photoUrl: String,
  createdAt: Date
}
```

---

## 📦 Installation & Setup

### Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB Atlas Account** - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Firebase Account** (for PDF storage) - [Sign up](https://firebase.google.com/)
- **ImgBB Account** (for image hosting) - [Sign up](https://imgbb.com/)
- **Vercel Account** (for deployment) - [Sign up](https://vercel.com/)
- **Git** - [Download](https://git-scm.com/)

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/zeta.git
cd zeta
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Install dev dependencies (optional)
npm install --save-dev nodemon
```

### Step 3: Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# MongoDB Configuration
w=majority

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Port (for local development)
PORT=5000

# Node Environment
NODE_ENV=development
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: MongoDB Atlas Setup

1. **Create Cluster**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster (Free tier available)
   - Wait for cluster creation (5-10 minutes)

2. **Create Database User**
   - Go to "Database Access"
   - Add new database user
   - Set username and password
   - Grant "Read and Write" permissions

3. **Configure Network Access**
   - Go to "Network Access"
   - Add IP Address
   - For development: `0.0.0.0/0` (Allow from anywhere)
   - For production: Add specific IP addresses

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Add to `.env` file

### Step 5: Firebase Setup (PDF Storage)

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project
   - Enable Storage

2. **Upload PDFs**
   - Go to Storage section
   - Upload your PDF files
   - Right-click file → "Get download URL"
   - Use these URLs in admin panel

3. **Configure Storage Rules** (Optional)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read;
      allow write: if request.auth != null;
    }
  }
}
```

### Step 6: ImgBB Setup (Image Hosting)

1. **Get API Key**
   - Go to [ImgBB](https://imgbb.com/)
   - Sign up and get free API key
   - Upload images via web interface or API

2. **Upload Images**
   - Upload via web interface
   - Copy direct image URL
   - Use in admin panel for channels/apps

**Alternative: Google Drive Images**
```
Share link: https://drive.google.com/file/d/FILE_ID/view
Direct URL: https://drive.google.com/uc?export=view&id=FILE_ID
```

### Step 7: Frontend Configuration

Edit `frontend/config.js`:

```javascript
// For local development
const API_URL = 'http://localhost:5000/api';

// For production (after Vercel deployment)
const API_URL = 'https://your-backend.vercel.app/api';
```

### Step 8: Local Development

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev    # Uses nodemon for auto-reload
# or
npm start      # Standard start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
# Use a local server (choose one):

# Option 1: VS Code Live Server extension
# Right-click index.html → Open with Live Server

# Option 2: Python
python -m http.server 8000

# Option 3: Node http-server
npx http-server -p 8000
```

Access the application at `http://localhost:8000`

---

## 🔧 Configuration

### Vercel Configuration (`backend/vercel.json`)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/auth/(.*)",
      "dest": "/api/auth.js"
    },
    {
      "src": "/api/admin/(.*)",
      "dest": "/api/admin.js"
    },
    // ... other routes
  ]
}
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key` |
| `PORT` | Local server port | `5000` |
| `NODE_ENV` | Environment mode | `production` |

### Database Indexes (Recommended)

```javascript
// In MongoDB Atlas or via Mongoose
db.users.createIndex({ email: 1 }, { unique: true });
db.papers.createIndex({ topicName: "text" });
db.topics.createIndex({ name: 1 });
```

---

## 📖 Usage Guide

### For Students

#### 1. **Sign Up / Login**
```
1. Go to login page
2. Click "Create Account"
3. Fill in your details
4. Choose a security question
5. Login with your credentials
```

#### 2. **Taking Quizzes**

**Daily Quiz:**
- One question per day
- Answer by clicking an option
- Instant feedback (correct/incorrect)
- Can't change answer once submitted

**Competitive Quiz:**
- Choose a topic
- Answer multiple questions
- Track progress (X/Y questions attempted)
- Questions remain accessible

#### 3. **Browse Content**
- **Papers**: Search by topic or browse recent
- **Channels**: Click to visit YouTube channels
- **Apps**: Download educational apps

#### 4. **Account Settings**
```
Click "Account" → Choose option:
- Update Password
- View Help
- Delete Account
- Logout
```

### For Administrators

#### Admin Access
```
Email: admin@zeta.com
Password: [Set during signup]
```
⚠️ **Important**: Create admin account with exactly `admin@zeta.com`

#### Content Management Workflow

**1. Daily Quiz:**
```
Admin → Quiz Management → Daily Quiz
→ Add Daily Quiz OR Bulk Import
→ Fill question and options
→ Select correct answer
→ Save
```

**2. Competitive Quiz:**
```
Admin → Quiz Management → Competitive Quiz
→ Add Topic → Enter topic name
→ Click topic to expand
→ Add Question OR Bulk Import
→ Fill question details
→ Save
```

**3. Bulk Import (CSV):**
```csv
Question,Option A,Option B,Option C,Option D,Correct Answer
What is DNA?,Code of life,Protein,Vitamin,Mineral,A
What is ATP?,Energy currency,Sugar,Fat,Protein,A
```

**Upload Steps:**
```
1. Click "📥 Bulk Import"
2. Paste CSV data
3. Click "Import Questions"
4. See success/failure count
```

**4. Research Papers:**
```
Admin → Research Papers → Add Paper
→ Topic name
→ Description
→ Firebase PDF URL
→ Save
```

**5. YouTube Channels:**
```
Admin → YouTube Channels → Add Channel
→ Channel name
→ Description
→ YouTube URL
→ Photo URL (ImgBB/Drive)
→ Save
```

**6. Apps:**
```
Admin → Apps → Add App
→ App name
→ Features description
→ Download URL
→ Photo URL (ImgBB/Drive)
→ Save
```

---

## 🔌 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-backend.vercel.app/api
```

### Authentication Endpoints

#### POST `/auth/signup`
Create new user account.

**Request:**
```json
{
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "securityQuestion": "pet",
  "securityAnswer": "fluffy"
}
```

**Response:**
```json
{
  "message": "User created successfully"
}
```

#### POST `/auth/login`
User login.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "fullname": "John Doe",
    "email": "john@example.com"
  }
}
```

#### GET `/auth/security-question?email=john@example.com`
Get security question for password reset.

**Response:**
```json
{
  "securityQuestion": "pet"
}
```

#### POST `/auth/reset-password`
Reset password using security answer.

**Request:**
```json
{
  "email": "john@example.com",
  "securityQuestion": "pet",
  "securityAnswer": "fluffy",
  "newPassword": "newpassword123"
}
```

#### POST `/auth/update-password`
Update password (requires authentication).

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

#### DELETE `/auth/delete-account`
Delete user account (requires authentication).

**Headers:**
```
Authorization: Bearer {token}
```

### Quiz Endpoints

#### GET `/quiz/daily`
Get current daily quiz.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "_id": "quiz_id",
  "question": "What is H2O?",
  "optionA": "Water",
  "optionB": "Oxygen",
  "optionC": "Hydrogen",
  "optionD": "Carbon",
  "correctOption": "A",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

#### GET `/quiz/topics`
Get all competitive quiz topics.

**Response:**
```json
[
  {
    "_id": "topic_id",
    "name": "Chemistry Basics"
  }
]
```

#### GET `/quiz/topic/:topicId`
Get topic with all questions.

**Response:**
```json
{
  "_id": "topic_id",
  "name": "Chemistry Basics",
  "questions": [
    {
      "_id": "question_id",
      "question": "What is H2O?",
      "optionA": "Water",
      "optionB": "Oxygen",
      "optionC": "Hydrogen",
      "optionD": "Carbon",
      "correctOption": "A"
    }
  ]
}
```

#### POST `/quiz/answer`
Submit quiz answer.

**Request:**
```json
{
  "questionId": "question_id",
  "answer": "A",
  "type": "daily" // or "competitive"
}
```

#### GET `/quiz/user-answer?type=daily&questionId=question_id`
Get user's answer for a question.

**Response:**
```json
{
  "answer": "A"
}
```

### Content Endpoints

#### GET `/papers`
Get all research papers.

#### GET `/papers/search?q=chemistry`
Search papers by topic.

#### GET `/channels`
Get all YouTube channels.

#### GET `/apps`
Get all educational apps.

#### GET `/help`
Get help documentation.

### Admin Endpoints (Requires Admin Authentication)

All admin endpoints require:
```
Headers:
  Authorization: Bearer {admin_token}
  Content-Type: application/json
```

#### Daily Quiz Management
- `POST /admin/quiz/daily` - Add daily quiz
- `PUT /admin/quiz/daily/:id` - Update daily quiz
- `DELETE /admin/quiz/daily/:id` - Delete daily quiz

#### Topic Management
- `POST /admin/quiz/topic` - Add topic
- `DELETE /admin/quiz/topic/:id` - Delete topic
- `POST /admin/quiz/topic/:topicId/question` - Add question
- `DELETE /admin/quiz/topic/:topicId/question/:questionId` - Delete question

#### Content Management
- `POST /admin/papers` - Add paper
- `PUT /admin/papers/:id` - Update paper
- `DELETE /admin/papers/:id` - Delete paper
- `POST /admin/channels` - Add channel
- `PUT /admin/channels/:id` - Update channel
- `DELETE /admin/channels/:id` - Delete channel
- `POST /admin/apps` - Add app
- `PUT /admin/apps/:id` - Update app
- `DELETE /admin/apps/:id` - Delete app
- `POST /admin/help` - Set help PDF
- `PUT /admin/help/:id` - Update help
- `DELETE /admin/help/:id` - Delete help

---

## 🚀 Deployment

### Deploying Backend to Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy Backend:**
```bash
cd backend
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? zeta-backend
# - Directory? ./
# - Override settings? No
```

4. **Set Environment Variables:**
```bash
# Via Vercel CLI
vercel env add MONGODB_URI
vercel env add JWT_SECRET

# Or via Vercel Dashboard:
# Project Settings → Environment Variables
```

5. **Deploy Production:**
```bash
vercel --prod
```

6. **Get Backend URL:**
```
Your backend will be at:
https://zeta-backend-xxx.vercel.app
```

### Deploying Frontend to Vercel

1. **Update API URL in `frontend/config.js`:**
```javascript
const API_URL = 'https://zeta-backend-xxx.vercel.app/api';
```

2. **Deploy Frontend:**
```bash
cd frontend
vercel

# Follow prompts similar to backend
```

3. **Configure Custom Domain (Optional):**
```bash
vercel domains add yourdomain.com
```

### Alternative: Deploy Frontend to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
netlify deploy --prod

# Follow prompts
```

### Post-Deployment Checklist

- [ ] Test all authentication flows
- [ ] Verify quiz functionality
- [ ] Check paper uploads
- [ ] Test admin panel
- [ ] Validate image loading
- [ ] Test on mobile devices
- [ ] Check HTTPS certificate
- [ ] Monitor error logs
- [ ] Set up custom domain (optional)

---

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: 7-day expiration, secure signing
- **Password Hashing**: bcrypt with 10 salt rounds
- **Security Questions**: Hashed answers for recovery
- **Admin-Only Routes**: Email-based admin verification

### Data Protection
- **Input Sanitization**: XSS protection on all inputs
- **CORS Configuration**: Controlled cross-origin access
- **Environment Variables**: Sensitive data not in code
- **MongoDB Injection Prevention**: Mongoose schema validation

### Best Practices Implemented
- **HTTPS Only**: Enforced in production
- **No Sensitive Data in URLs**: POST requests for sensitive operations
- **Token Storage**: LocalStorage with XSS considerations
- **Error Messages**: Generic messages to prevent information leakage
- **Rate Limiting**: Consider implementing for production
- **Input Validation**: Client and server-side validation

### Security Recommendations

```bash
# Generate strong JWT secret
openssl rand -base64 64

# Use environment variables
# Never commit .env file

# Regular dependency updates
npm audit
npm update

# Monitor MongoDB access logs
# Enable MongoDB Atlas alerts
```

---

## ⚡ Performance Optimization

### Implemented Optimizations

#### Frontend
- **Debounced Search**: 300ms delay for paper search
- **Lazy Loading**: Questions load only when topic expanded
- **Skeleton Screens**: Loading placeholders
- **CSS Variables**: Fast theme switching
- **Event Delegation**: Efficient event handling
- **Image Optimization**: Lazy loading for images
- **Minification**: Consider for production

#### Backend
- **Serverless Functions**: Auto-scaling with Vercel
- **Connection Pooling**: Cached MongoDB connections
- **Indexed Queries**: Database indexes on common queries
- **Lean Queries**: Mongoose `.lean()` for read-only data
- **Selective Field Projection**: Only fetch needed fields

#### Database
```javascript
// Recommended indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.papers.createIndex({ topicName: "text" });
db.topics.createIndex({ name: 1 });
db.dailyquizzes.createIndex({ createdAt: -1 });
```

### Performance Monitoring

```javascript
// Add to backend for monitoring
console.time('Database Query');
// ... query ...
console.timeEnd('Database Query');
```

### Future Optimizations
- [ ] Implement Redis caching
- [ ] Add CDN for static assets
- [ ] Image compression pipeline
- [ ] Code splitting for frontend
- [ ] Service worker for offline support
- [ ] GraphQL for efficient data fetching

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Workflow

1. **Fork the Repository**
```bash
# Click "Fork" on GitHub
git clone https://github.com/YOUR_USERNAME/zeta.git
cd zeta
```

2. **Create Feature Branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Make Changes**
```bash
# Write your code
# Test thoroughly
# Follow code style
```

4. **Commit Changes**
```bash
git add .
git commit -m "Add: Amazing feature description"
```

5. **Push to GitHub**
```bash
git push origin feature/amazing-feature
```

6. **Create Pull Request**
- Go to your fork on GitHub
- Click "Pull Request"
- Describe your changes
- Submit for review

### Coding Standards

#### JavaScript
```javascript
// Use ES6+ features
const API_URL = 'https://api.example.com';

// Descriptive variable names
const userQuizAnswers = [];

// Error handling
try {
  await apiCall();
} catch (error) {
  console.error('API Error:', error);
  showMessage('Operation failed', 'error');
}

// Comments for complex logic
// Calculate quiz progress percentage
const progress = (attempted / total) * 100;
```

#### CSS
```css
/* Use CSS variables */
:root {
  --primary-color: #9333ea;
}

/* BEM naming convention */
.quiz-card__title {}
.quiz-card__title--active {}

/* Mobile-first approach */
.container {
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}
```

### Commit Message Convention

```
Type: Brief description

Types:
- Add: New feature
- Fix: Bug fix
- Update: Modify existing feature
- Remove: Delete feature/code
- Refactor: Code restructuring
- Docs: Documentation changes
- Style: CSS/formatting changes
- Test: Add tests
- Chore: Maintenance tasks

Examples:
Add: Bulk CSV import for quizzes
Fix: Image loading on channels page
Update: Improve quiz progress tracking
Docs: Add API documentation
```

### Areas for Contribution

- **Features**: New quiz types, gamification, leaderboards
- **UI/UX**: Design improvements, animations, accessibility
- **Performance**: Optimization, caching strategies
- **Testing**: Unit tests, integration tests, E2E tests
- **Documentation**: Tutorials, API docs, code comments
- **Bug Fixes**: Report and fix bugs
- **Translations**: Multi-language support

---

## 📄 License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2025 Vivek Gundu (Navodayan)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 💬 Support

### Get Help

- **📧 Email**: info@zeta.com
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/vivekgundu99/zeta/issues)
- **