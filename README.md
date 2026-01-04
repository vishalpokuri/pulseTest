# Pulse Video Platform - Monorepo

A comprehensive full-stack video platform with HLS adaptive streaming, AI-powered content sensitivity analysis, real-time processing updates, and enterprise-grade multi-tenant architecture with role-based access control.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Features Implemented](#features-implemented)
- [Project Structure](#project-structure)
- [Module Descriptions](#module-descriptions)
- [User Flows](#user-flows)
- [Setup & Installation](#setup--installation)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

---

## 🎯 Overview

Pulse is a production-ready video platform that enables users to upload videos, automatically processes them for adaptive bitrate streaming (HLS), performs AI-powered content sensitivity analysis using AWS Rekognition, and provides seamless video playback with real-time progress tracking.

### Key Capabilities

- **Video Upload & Storage**: Secure S3-based storage with presigned URL uploads
- **HLS Transcoding**: Automatic multi-resolution transcoding (240p, 360p, 480p, 720p)
- **Content Moderation**: AWS Rekognition-powered sensitivity analysis with adaptive frame sampling
- **Real-Time Updates**: Live processing progress via WebSocket (Socket.io)
- **Multi-Tenant Architecture**: Complete user isolation and data segregation
- **Role-Based Access Control**: Granular permissions (Admin, Editor, Viewer)
- **Responsive UI**: Modern, YouTube-inspired interface with Tailwind CSS

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Dashboard  │  │  Video Player │  │ Admin Panel  │         │
│  │   (Upload)   │  │   (HLS.js)    │  │ (User Mgmt)  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │               │
            HTTP/REST          WebSocket
                    │               │
┌───────────────────▼───────────────▼─────────────────────────────┐
│                       BACKEND (Express)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   Auth   │  │  Videos  │  │  Users   │  │ Socket.io│       │
│  │   API    │  │   API    │  │   API    │  │  Server  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  Middleware: JWT Auth, RBAC, Error Handling          │      │
│  └──────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────────┘
            │                           │
    ┌───────▼────────┐         ┌────────▼────────┐
    │   MongoDB      │         │  PROCESSING      │
    │   (Metadata)   │         │  WORKER          │
    └────────────────┘         │  (Express)       │
                               └──────────────────┘
                                        │
                              ┌─────────┴─────────┐
                              │                   │
                        ┌─────▼──────┐    ┌──────▼────────┐
                        │   FFmpeg   │    │ AWS Rekognition│
                        │    (HLS)   │    │  (Moderation)  │
                        └────────────┘    └────────────────┘
                                   │
                          ┌────────▼─────────┐
                          │    AWS S3        │
                          │  (Video Storage) │
                          └──────────────────┘
```

### Data Flow

1. **Upload Flow**: Client → Backend → S3 (presigned URL) → Backend (metadata save) → Worker (processing)
2. **Processing Flow**: Worker → FFmpeg (HLS) → S3 → MongoDB (status update) → Socket.io → Client
3. **Streaming Flow**: Client → Backend → S3 (HLS manifest) → HLS.js Player
4. **Analysis Flow**: Worker → Rekognition (frame analysis) → MongoDB (results) → Socket.io → Client

---

## 🛠️ Technology Stack

### Backend (`/backend`)

| Technology     | Version  | Purpose                               |
| -------------- | -------- | ------------------------------------- |
| **Node.js**    | 20.x LTS | Runtime environment                   |
| **Express**    | 4.x      | Web framework & REST API              |
| **MongoDB**    | 6.x      | Primary database (Mongoose ODM)       |
| **Socket.io**  | 4.x      | Real-time bidirectional communication |
| **JWT**        | 9.x      | Authentication & token management     |
| **AWS SDK**    | 3.x      | S3 operations (presigned URLs)        |
| **TypeScript** | 5.x      | Type safety & developer experience    |
| **bcrypt**     | 5.x      | Password hashing                      |

### Processing Worker (`/processing-worker`)

| Technology           | Version  | Purpose                            |
| -------------------- | -------- | ---------------------------------- |
| **Node.js**          | 20.x LTS | Runtime environment                |
| **FFmpeg**           | Latest   | Video transcoding & HLS generation |
| **AWS Rekognition**  | Latest   | Content moderation & detection     |
| **Socket.io Client** | 4.x      | Progress updates to backend        |
| **Express**          | 4.x      | HTTP server for triggers           |
| **TypeScript**       | 5.x      | Type safety                        |

### Frontend (`/frontend`)

| Technology           | Version | Purpose                         |
| -------------------- | ------- | ------------------------------- |
| **React**            | 18.x    | UI framework                    |
| **Vite**             | 5.x     | Build tool & dev server         |
| **TypeScript**       | 5.x     | Type safety                     |
| **Tailwind CSS**     | 3.x     | Utility-first styling           |
| **HLS.js**           | 1.x     | Adaptive bitrate video playback |
| **Socket.io Client** | 4.x     | Real-time updates               |
| **React Router**     | 6.x     | Client-side routing             |
| **React Hot Toast**  | 2.x     | Toast notifications             |
| **Lucide React**     | Latest  | Icon library                    |
| **shadcn/ui**        | Latest  | Accessible component library    |

### Infrastructure

| Service             | Purpose                          |
| ------------------- | -------------------------------- |
| **AWS S3**          | Video & thumbnail storage        |
| **AWS Rekognition** | AI-powered content moderation    |
| **MongoDB Atlas**   | Cloud database hosting           |
| **Docker**          | Containerization & orchestration |

---

## ✅ Features Implemented

### Core Video Features

- ✅ **Multi-format Upload**: Support for various video formats
- ✅ **S3 Presigned Upload**: Secure, direct-to-S3 uploads with progress tracking
- ✅ **HLS Transcoding**: Adaptive bitrate streaming (4 quality levels)
- ✅ **Thumbnail Generation**: Auto-generated video thumbnails
- ✅ **Video Player**: HLS.js-powered player with quality selection
- ✅ **Video Management**: Upload, view, delete with ownership validation

### Content Moderation

- ✅ **AWS Rekognition Integration**: Automated content detection
- ✅ **Adaptive Frame Sampling**:
  - Videos >60s: Frame every 3 seconds
  - Videos ≤60s: 15 evenly distributed frames
- ✅ **Manual Trigger**: User-initiated sensitivity analysis
- ✅ **Classification System**: Safe/Flagged/Unsafe labels with visual indicators
- ✅ **Detailed Results**: Moderation labels, confidence scores, timestamps

### Real-Time Features

- ✅ **Upload Progress**: Live S3 upload percentage
- ✅ **Processing Progress**: HLS transcoding status (0-100%)
- ✅ **Sensitivity Progress**: Frame-by-frame analysis tracking
- ✅ **Auto-Refresh**: Dashboard updates on completion
- ✅ **Socket.io Integration**: Bidirectional WebSocket communication

### Authentication & Authorization

- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **Password Hashing**: bcrypt with salt rounds
- ✅ **Protected Routes**: Frontend route guards
- ✅ **Token Middleware**: Backend request validation
- ✅ **Multi-Tenant Architecture**: Complete user isolation
- ✅ **Role-Based Access Control (RBAC)**:
  - **Viewer**: Read-only access to videos
  - **Editor**: Upload, manage own videos, trigger analysis
  - **Admin**: Full access + user management

### User Management (Admin)

- ✅ **User List**: View all users in system
- ✅ **Role Management**: Change user roles via dropdown
- ✅ **Self-Protection**: Prevent admins from demoting themselves
- ✅ **Clean Table UI**: shadcn table component integration

### UI/UX

- ✅ **Responsive Design**: Mobile, tablet, desktop support
- ✅ **YouTube-Inspired Layout**: Familiar video grid interface
- ✅ **Loading States**: Skeleton screens and spinners
- ✅ **Error Handling**: Toast notifications for feedback
- ✅ **Two-Column Player**: Video on left, details on right
- ✅ **Status Badges**: Visual indicators for processing states
- ✅ **Modular Components**: Reusable UI component library

### DevOps

- ✅ **Docker Compose**: Full-stack orchestration
- ✅ **Environment Variables**: Secure configuration management
- ✅ **TypeScript**: End-to-end type safety
- ✅ **Git Version Control**: Clean commit history
- ✅ **Monorepo Structure**: Organized workspace

---

## 📁 Project Structure

```
pulseMonorepo/
│
├── backend/                    # Express API Server
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts          # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.ts       # Login/Register
│   │   │   ├── userController.ts       # User management (admin)
│   │   │   ├── videoController.ts      # Video CRUD
│   │   │   └── sensitivityController.ts # Analysis trigger
│   │   ├── middleware/
│   │   │   ├── auth.ts        # JWT verification
│   │   │   └── rbac.ts        # Role-based access control
│   │   ├── models/
│   │   │   ├── userSchema.ts  # User model (username, password, role)
│   │   │   └── videoSchema.ts # Video model (metadata, status, userId)
│   │   ├── routes/
│   │   │   ├── authRoutes.ts  # /api/auth/*
│   │   │   ├── userRoutes.ts  # /api/users/*
│   │   │   └── videoRoutes.ts # /api/videos/*
│   │   ├── utils/
│   │   │   ├── s3Creds.ts     # AWS S3 client
│   │   │   ├── getPresignedUrl.ts
│   │   │   ├── putObject.ts
│   │   │   └── deleteObject.ts
│   │   └── app.ts             # Express app entry
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── processing-worker/          # Video Processing Service
│   ├── src/
│   │   ├── models/
│   │   │   └── Video.ts       # Video schema (matches backend)
│   │   ├── utils/
│   │   │   ├── ffmpeg.ts      # HLS transcoding logic
│   │   │   ├── s3Client.ts    # AWS S3 operations
│   │   │   ├── s3Operations.ts
│   │   │   ├── sensitivityAnalysis.ts # Rekognition integration
│   │   │   ├── socket.ts      # Socket.io client
│   │   │   └── fileSystem.ts  # Temp file management
│   │   ├── processor.ts       # Main processing logic
│   │   └── index.ts           # Express server entry
│   ├── temp/                  # Temporary processing directory
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React Client
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginComponent.tsx
│   │   │   │   ├── RegisterComponent.tsx
│   │   │   │   └── AuthForm.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── DHeader.tsx         # Top navigation bar
│   │   │   │   ├── DContent.tsx        # Tab content router
│   │   │   │   └── content/
│   │   │   │       ├── ExploreContent.tsx  # Video grid
│   │   │   │       ├── UploadContent.tsx   # Upload + progress
│   │   │   │       └── UsersContent.tsx    # Admin user mgmt
│   │   │   ├── player/
│   │   │   │   ├── VideoPlayerHLS.tsx      # HLS player
│   │   │   │   ├── VideoControls.tsx       # Playback controls
│   │   │   │   ├── SensitivityAnalysisCard.tsx
│   │   │   │   └── VideoDetailsCard.tsx
│   │   │   ├── protected/
│   │   │   │   └── ProtectedRoute.tsx  # Auth guard
│   │   │   └── ui/                     # shadcn components
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── table.tsx
│   │   │       ├── select.tsx
│   │   │       └── ...
│   │   ├── contexts/
│   │   │   ├── VideoContext.tsx    # Video state management
│   │   │   └── SocketContext.tsx   # WebSocket connection
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── VideoPlayer.tsx
│   │   ├── services/
│   │   │   ├── authService.ts      # Login/register API
│   │   │   └── userService.ts      # User management API
│   │   ├── utils/
│   │   │   ├── videoUtils.ts       # Duration, formatting
│   │   │   ├── thumbnailUtils.ts
│   │   │   └── validationUtils.ts
│   │   ├── types/
│   │   │   ├── video.ts
│   │   │   └── declaration.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── docker-compose.yml          # Container orchestration
├── .env.example                # Environment template
├── IMPLEMENTATION_STATUS.md    # Feature tracking
└── README.md                   # This file
```

---

## 🔧 Module Descriptions

### Backend Modules

#### **Controllers**

- `authController.ts`: Handles user authentication (login, register, JWT generation)
- `videoController.ts`: CRUD operations for videos (create, read, delete, presigned URLs)
- `sensitivityController.ts`: Triggers sensitivity analysis on uploaded videos
- `userController.ts`: Admin user management (list, update role, delete)

#### **Middleware**

- `auth.ts`: JWT token verification, extracts userId from token
- `rbac.ts`: Role-based access control (checkRole, isAdmin, isEditor, isViewer)

#### **Models**

- `userSchema.ts`: User document (username, password, role, timestamps)
- `videoSchema.ts`: Video document (title, s3Key, userId, status, sensitivity, duration, etc.)

#### **Utils**

- `s3Creds.ts`: AWS S3 client initialization
- `getPresignedUrl.ts`: Generate presigned URLs for uploads/downloads
- `putObject.ts`: Direct S3 upload helper
- `deleteObject.ts`: S3 object deletion

### Processing Worker Modules

#### **Utils**

- `ffmpeg.ts`: HLS transcoding with multi-resolution outputs
- `sensitivityAnalysis.ts`: AWS Rekognition frame analysis with adaptive sampling
- `s3Operations.ts`: Download from S3, upload results
- `socket.ts`: Socket.io client for progress updates
- `fileSystem.ts`: Temporary file management

#### **Core**

- `processor.ts`: Main processing pipeline (download → transcode → analyze → upload)
- `index.ts`: Express server that listens for processing triggers

### Frontend Modules

#### **Contexts**

- `VideoContext.tsx`: Global video state (upload, fetch, delete)
- `SocketContext.tsx`: WebSocket connection and event handling

#### **Services**

- `authService.ts`: Authentication API calls
- `userService.ts`: User management API calls

#### **Utils**

- `videoUtils.ts`: Duration formatting, sensitivity color mapping
- `thumbnailUtils.ts`: Thumbnail URL generation
- `validationUtils.ts`: Form validation helpers

---

## 👤 User Flows

### 1. **New User Registration & First Upload**

```
1. Navigate to /register
2. Enter username and password
3. Submit registration → JWT token stored in localStorage
4. Redirect to /dashboard/explore (empty state)
5. Click "Upload" tab
6. Select video file and enter title
7. Click "Upload Video"
   ├─ Phase 1: S3 Upload (progress bar 0-100%)
   ├─ Phase 2: HLS Processing (progress bar 0-100% via Socket.io)
   └─ Auto-redirect to /player/:id when complete
8. Video plays automatically with HLS adaptive streaming
9. Click "Analyze Sensitivity" button
   └─ Watch real-time frame analysis progress
10. View results: Safe/Flagged badge with confidence scores
```

### 2. **Existing User Login & Video Management**

```
1. Navigate to /login
2. Enter credentials → JWT token stored
3. Redirect to /dashboard/explore
4. See grid of own uploaded videos (multi-tenant isolation)
5. Click video thumbnail → Navigate to player
6. Watch video with quality selector (240p-720p)
7. View video details (duration, upload date, file size)
8. Check sensitivity analysis results
9. Delete video (ownership verified) → Returns to dashboard
```

### 3. **Admin User Management**

```
1. Login as admin user
2. See "Users" tab in dashboard header (admin-only)
3. Click "Users" tab
4. View table of all users with roles
5. Select dropdown next to username
6. Change role: Viewer → Editor → Admin
7. Save automatically (toast notification)
8. User's permissions update immediately
```

### 4. **Video Processing Pipeline (Behind the Scenes)**

```
Backend:
1. User uploads → Generate S3 presigned URL
2. Frontend uploads directly to S3
3. Save metadata to MongoDB with status: "uploaded"
4. Trigger processing worker

Processing Worker:
5. Download video from S3 to temp directory
6. Run FFmpeg transcoding → Generate HLS playlist + 4 resolutions
7. Upload HLS files to S3
8. Update MongoDB: status → "completed"
9. Emit Socket.io event → Frontend refreshes

Sensitivity Analysis (Manual Trigger):
10. User clicks "Analyze Sensitivity"
11. Worker downloads video
12. Extract frames (adaptive sampling based on duration)
13. Send frames to AWS Rekognition
14. Aggregate results (labels, confidence, timestamps)
15. Save to MongoDB: sensitivityStatus → "completed"
16. Emit Socket.io progress updates (0-100%)
17. Frontend displays results in real-time
```

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js**: v20.x or higher
- **MongoDB**: Local instance or MongoDB Atlas
- **AWS Account**: S3 bucket + Rekognition access
- **FFmpeg**: Installed on system (for processing worker)
- **Docker** (optional): For containerized setup

### Local Development Setup

#### 1. Clone Repository

```bash
git clone <repository-url>
cd pulseMonorepo
```

#### 2. Environment Variables

Create `.env` files in each service:

**Backend** (`/backend/.env`):

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/pulse
JWT_SECRET=your_secure_jwt_secret_here
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=your-s3-bucket-name
```

**Processing Worker** (`/processing-worker/.env`):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pulse
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=your-s3-bucket-name
BACKEND_URL=http://localhost:4000
```

**Frontend** (`/frontend/.env`):

```env
VITE_BACKEND_URL=http://localhost:4000/api
```

#### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Processing Worker
cd ../processing-worker
npm install

# Frontend
cd ../frontend
npm install
```

#### 4. Start Services

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Processing Worker:**

```bash
cd processing-worker
npm run dev
```

**Terminal 3 - Frontend:**

```bash
cd frontend
npm run dev
```

#### 5. Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000/api
- **Processing Worker**: http://localhost:5000

### Docker Setup

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

See [README.docker.md](README.docker.md) for detailed Docker instructions.

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response: 201
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "username"
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response: 200
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "username"
  }
}
```

### Video Endpoints

#### Get Presigned Upload URL

```http
POST /api/videos/presigned-upload
Authorization: Bearer <token>
Content-Type: application/json

{
  "filename": "video.mp4",
  "contentType": "video/mp4"
}

Response: 200
{
  "presignedUrl": "https://s3.amazonaws.com/...",
  "key": "videos/uuid-video.mp4",
  "videoId": "uuid"
}
```

#### Create Video Metadata

```http
POST /api/videos
Authorization: Bearer <token>
Content-Type: application/json

{
  "videoId": "uuid",
  "title": "My Video",
  "s3Key": "videos/uuid-video.mp4",
  "fileSize": 10485760,
  "duration": 120
}

Response: 201
{
  "message": "Video created successfully",
  "video": { /* video object */ }
}
```

#### Get User Videos

```http
GET /api/videos
Authorization: Bearer <token>

Response: 200
{
  "videos": [
    {
      "_id": "mongodb_id",
      "videoId": "uuid",
      "title": "My Video",
      "userId": "user_id",
      "status": "completed",
      "sensitivityStatus": "analyzed",
      "sensitivity": "safe",
      "duration": 120,
      "fileSize": 10485760,
      "thumbnailUrl": "https://...",
      "hlsUrl": "https://...",
      "createdAt": "2026-01-05T...",
      "updatedAt": "2026-01-05T..."
    }
  ]
}
```

#### Get Single Video

```http
GET /api/videos/:id
Authorization: Bearer <token>

Response: 200
{
  "video": { /* video object */ }
}
```

#### Delete Video

```http
DELETE /api/videos/:id
Authorization: Bearer <token>

Response: 200
{
  "message": "Video deleted successfully"
}
```

#### Trigger Sensitivity Analysis

```http
POST /api/videos/:id/analyze-sensitivity
Authorization: Bearer <token>

Response: 200
{
  "message": "Sensitivity analysis started"
}
```

### User Management Endpoints (Admin Only)

#### Get Current User

```http
GET /api/users/me
Authorization: Bearer <token>

Response: 200
{
  "user": {
    "_id": "user_id",
    "username": "username",
    "role": "admin"
  }
}
```

#### Get All Users

```http
GET /api/users
Authorization: Bearer <token>

Response: 200
{
  "users": [
    {
      "_id": "user_id",
      "username": "username",
      "role": "admin"
    }
  ]
}
```

#### Update User Role

```http
PUT /api/users/:id/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "editor"
}

Response: 200
{
  "message": "User role updated successfully"
}
```

#### Delete User

```http
DELETE /api/users/:id
Authorization: Bearer <token>

Response: 200
{
  "message": "User deleted successfully"
}
```

---

## 🔐 Environment Variables

### Required AWS Setup

1. **Create S3 Bucket**:

   - Enable CORS for web uploads
   - Set public read access for HLS files
   - Create folders: `videos/`, `thumbnails/`, `hls/`

2. **Enable AWS Rekognition**:

   - Ensure IAM user has `rekognition:DetectModerationLabels` permission

3. **IAM Permissions**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    },
    {
      "Effect": "Allow",
      "Action": ["rekognition:DetectModerationLabels"],
      "Resource": "*"
    }
  ]
}
```

---

## 🚢 Deployment

### Recommended Stack

- **Frontend**: Vercel or Netlify
- **Backend**: Heroku, Railway, or AWS EC2
- **Processing Worker**: AWS EC2 (requires FFmpeg)
- **Database**: MongoDB Atlas
- **Storage**: AWS S3

### Deployment Checklist

- [ ] Set production environment variables
- [ ] Configure CORS for production domains
- [ ] Enable MongoDB IP whitelist for production servers
- [ ] Set up SSL certificates (HTTPS)
- [ ] Configure S3 bucket policies for production
- [ ] Set up monitoring and logging
- [ ] Create backup strategy for MongoDB
- [ ] Test Socket.io with production URLs
- [ ] Update frontend API URL to production backend

---

## 📊 Performance Metrics

- **Upload Speed**: Direct S3 upload (no backend bottleneck)
- **HLS Transcoding**: ~1-2x video duration (depends on length/resolution)
- **Sensitivity Analysis**: ~2-5 seconds per frame (AWS Rekognition)
- **Video Playback**: Adaptive bitrate 240p-720p with HLS.js
- **Real-Time Updates**: <100ms Socket.io latency

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT token expiration (24 hours)
- ✅ Protected API routes with authentication middleware
- ✅ Role-based access control (RBAC)
- ✅ User isolation (multi-tenant architecture)
- ✅ Ownership validation on delete/analyze operations
- ✅ Presigned URLs with expiration
- ✅ CORS configuration
- ✅ Input validation on all endpoints
- ✅ MongoDB injection prevention (Mongoose)

---

## 🎨 UI Features

- **Modern Design**: Clean, minimalist interface
- **Responsive Layout**: Mobile-first approach
- **Loading States**: Skeleton screens for better UX
- **Error Handling**: User-friendly toast notifications
- **Real-Time Feedback**: Live progress indicators
- **Accessibility**: Keyboard navigation, ARIA labels
- **Status Badges**: Color-coded video states
- **Quality Selector**: Manual bitrate selection

---

## 🤝 Contributing

This project is part of an academic assignment. For any questions or issues, please contact the development team.

---

## 📝 License

Proprietary - Academic Assignment

---

## 👨‍💻 Developer Notes

### Default User Roles

- New users default to **Viewer** role (read-only)
- First registered user should be manually promoted to **Admin** via MongoDB

### MongoDB User Role Update

```javascript
db.users.updateOne({ username: "admin_username" }, { $set: { role: "admin" } });
```

### FFmpeg Installation (Processing Worker)

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**

```bash
brew install ffmpeg
```

### Socket.io Events

**Client → Server:**

- N/A (all triggers via REST API)

**Server → Client:**

- `hls-progress`: HLS transcoding progress (0-100)
- `hls-complete`: HLS transcoding finished
- `sensitivity-progress`: Analysis progress (0-100)
- `sensitivity-complete`: Analysis finished

---

## 📞 Support

For technical support or questions about this project, please refer to the assignment guidelines or contact your instructor.

---

**Built with ❤️ for Video Processing & Content Moderation**
