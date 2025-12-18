# Social Media Backend API

A robust RESTful API for a social media application built with **Node.js**, **Express.js**, and **MongoDB**. This backend supports features like user authentication, posts with images, likes, comments, follow system, and real-time notifications.

---

##  Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime Environment |
| **Express.js v5** | Web Framework |
| **MongoDB** | Database |
| **Mongoose** | ODM (Object Document Mapper) |
| **JWT** | Authentication (Access + Refresh Tokens) |
| **bcrypt** | Password Hashing |
| **Cloudinary** | Cloud Image Storage |
| **Multer** | File Upload Handling |
| **Cookie-Parser** | Cookie Management |

---

##  Project Structure

```
src/
├── app.js              # Express app configuration
├── index.js            # Server entry point
├── constants.js        # Database name & constants
│
├── db/
│   └── index.js        # MongoDB connection setup
│
├── models/
│   ├── user.models.js        # User schema
│   ├── Post.models.js        # Post schema
│   ├── Comment.models.js     # Comment schema
│   ├── Like.models.js        # Like schema
│   ├── Follow.models.js      # Follow schema
│   └── Notification.models.js # Notification schema
│
├── controllers/
│   ├── user.controllers.js        # User logic
│   ├── post.controllers.js        # Post logic
│   ├── comment.controllers.js     # Comment logic
│   ├── like.controllers.js        # Like logic
│   ├── follow.controllers.js      # Follow logic
│   └── notification.controllers.js # Notification logic
│
├── routes/
│   ├── user.routes.js        # User endpoints
│   ├── post.routes.js        # Post endpoints
│   ├── comment.routes.js     # Comment endpoints
│   ├── like.routes.js        # Like endpoints
│   ├── follow.routes.js      # Follow endpoints
│   └── notification.routes.js # Notification endpoints
│
├── middleware/
│   ├── auth.middleware.js    # JWT verification
│   └── multer.middleware.js  # File upload config
│
└── utils/
    ├── ApiError.js       # Custom error class
    ├── ApiResponse.js    # Standardized response
    ├── asyncHandler.js   # Async error wrapper
    └── cloudinary.js     # Cloudinary upload utility
```

---

##  Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd MyBackendProjectwithFrontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file
Create a `.env` file in the root directory with the following variables:

```env
PORT=8000
MONGODB_URL=mongodb://localhost:27017
CORS_ORIGIN=*

ACCESS_TOKEN_SECRET=your_access_token_secret_key
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Run the server
```bash
# Development mode (with hot reload)
npm run dev

# The server will start on http://localhost:8000
```

---

##  Database Models

### User Model
| Field | Type | Description |
|-------|------|-------------|
| username | String | Unique username |
| email | String | User email (unique, lowercase) |
| password | String | Hashed password |
| bio | String | User bio (default: "") |
| avatarUrl | String | Profile picture URL |
| followersCount | Number | Number of followers |
| followingCount | Number | Number of following |
| refreshToken | String | JWT refresh token |

### Post Model
| Field | Type | Description |
|-------|------|-------------|
| author | ObjectId | Reference to User |
| imageUrl | String | Cloudinary image URL |
| caption | String | Post caption |
| likesCount | Number | Number of likes |
| commentsCount | Number | Number of comments |

### Comment Model
| Field | Type | Description |
|-------|------|-------------|
| user | ObjectId | Reference to User |
| post | ObjectId | Reference to Post |
| text | String | Comment content |

### Like Model
| Field | Type | Description |
|-------|------|-------------|
| user | ObjectId | Reference to User |
| post | ObjectId | Reference to Post |

> **Note:** Unique index on `{user, post}` prevents duplicate likes

### Follow Model
| Field | Type | Description |
|-------|------|-------------|
| follower | ObjectId | User who follows |
| following | ObjectId | User being followed |

> **Note:** Unique index on `{follower, following}` prevents duplicate follows

### Notification Model
| Field | Type | Description |
|-------|------|-------------|
| user | ObjectId | User receiving notification |
| actor | ObjectId | User who performed action |
| type | String | "follow", "like", or "comment" |
| post | ObjectId | Related post (optional) |
| isRead | Boolean | Read status |

---

## 🔗 API Endpoints

### Base URL: `http://localhost:8000/api/v1`

### 👤 User Routes (`/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | Login user | ❌ |
| POST | `/logout` | Logout user | ✅ |
| POST | `/refresh-token` | Refresh access token | ❌ |
| POST | `/change-password` | Change password | ✅ |
| GET | `/current-user` | Get logged in user | ✅ |
| PATCH | `/update-account` | Update bio/avatar | ✅ |
| GET | `/profile/:username` | Get user profile | ❌ |

### 📝 Post Routes (`/posts`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| POST | `/` | Create new post | ✅ |
| GET | `/feed` | Get personalized feed | ✅ |
| GET | `/:id` | Get post by ID | ❌ |
| DELETE | `/:id` | Delete post | ✅ |
| GET | `/user/:userId` | Get user's posts | ❌ |

### ❤️ Like Routes (`/likes`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| POST | `/:postId/like` | Like a post | ✅ |
| DELETE | `/:postId/unlike` | Unlike a post | ✅ |

### 💬 Comment Routes (`/comments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| POST | `/:postId` | Add comment | ✅ |
| GET | `/:postId` | Get post comments | ❌ |
| DELETE | `/:id` | Delete comment | ✅ |

### 👥 Follow Routes (`/follows`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| POST | `/:userId` | Follow user | ✅ |
| DELETE | `/:userId` | Unfollow user | ✅ |
| GET | `/:userId/followers` | Get followers | ❌ |
| GET | `/:userId/following` | Get following | ❌ |

### 🔔 Notification Routes (`/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| GET | `/` | Get all notifications | ✅ |
| PATCH | `/:id/read` | Mark as read | ✅ |

---

## 📋 API Usage Examples

### Register User
```bash
curl -X POST http://localhost:8000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login User
```bash
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Post (with image)
```bash
curl -X POST http://localhost:8000/api/v1/posts \
  -H "Authorization: Bearer <access_token>" \
  -F "image=@/path/to/image.jpg" \
  -F "caption=My first post!"
```

### Get Feed
```bash
curl -X GET "http://localhost:8000/api/v1/posts/feed?page=1&limit=10" \
  -H "Authorization: Bearer <access_token>"
```

### Like a Post
```bash
curl -X POST http://localhost:8000/api/v1/likes/<postId>/like \
  -H "Authorization: Bearer <access_token>"
```

### Follow a User
```bash
curl -X POST http://localhost:8000/api/v1/follows/<userId> \
  -H "Authorization: Bearer <access_token>"
```

---

## 🔐 Authentication Flow

This API uses **JWT (JSON Web Tokens)** with a dual-token system:

1. **Access Token** - Short-lived token (1 day) for API requests
2. **Refresh Token** - Long-lived token (10 days) stored in database

### How it works:
1. User logs in → receives both tokens (stored in HTTP-only cookies)
2. Access token is sent with each request in `Authorization` header or cookies
3. When access token expires, use `/refresh-token` endpoint to get new tokens
4. On logout, refresh token is invalidated in database

---

## ✨ Key Features

- ✅ **Secure Authentication** - JWT with refresh token rotation
- ✅ **Password Security** - bcrypt hashing with salt rounds
- ✅ **Image Upload** - Local temp storage → Cloudinary cloud storage
- ✅ **Feed System** - Shows posts from followed users + own posts
- ✅ **Pagination** - Feed supports `page` and `limit` query params
- ✅ **Notification System** - Real-time notifications for follow, like, comment
- ✅ **Duplicate Prevention** - Unique indexes prevent duplicate likes/follows
- ✅ **Standardized Responses** - Consistent API response format

---

## 📦 Response Format

### Success Response
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Success message",
  "success": true
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error message",
  "success": false,
  "errors": []
}
```

---

## 🛠️ Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server with nodemon (hot reload) |

---

## 👨‍💻 Author

**Sabir Ali**

---

## 📄 License

ISC License

