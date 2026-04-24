# 🚀 InternX - Professional Internship & Task Platform

A modern, full-stack platform where companies post real tasks and students solve them to gain verified experience and build a professional portfolio. Think LinkedIn meets Upwork for internships!

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Java](https://img.shields.io/badge/Java-17-orange)]()
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.x-green)]()
[![React](https://img.shields.io/badge/React-18-blue)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

## ✨ Key Features

### 🎯 Core Functionality
- **Task Management** - Companies post real-world tasks with deadlines and rewards
- **Application System** - Students browse, apply, and get accepted for tasks
- **Submission & Review** - Submit work, get rated, build your portfolio
- **Skills Tracking** - Build and showcase your skill profile
- **Leaderboard** - Compete with peers based on ratings and completed tasks

### 💬 Social Features
- **Feed System** - Share updates, achievements, and thoughts
- **Rich Reactions** - Express yourself with 6 emoji reactions (👍 ❤️ 😂 😮 😢 🎉)
- **Comments** - Engage with posts through comments
- **Connections** - Build your professional network
- **Real-Time Notifications** - Get instant toast popups for likes, comments, connections
- **Smart Deep-Linking** - Click notifications to jump directly to relevant posts/tasks

### 📱 User Experience
- **Mobile-First Design** - WhatsApp-style messaging with perfect mobile responsiveness
- **Dark/Light Theme** - Seamless theme switching with system preference detection
- **Real-Time Updates** - 15-second polling for notifications and messages
- **Infinite Scroll** - Smooth feed pagination with intersection observer
- **Image Upload** - Cloudinary integration with crop/resize support

### 🛡️ Admin Panel
- **User Management** - Ban/unban/delete users with role-based access
- **Reports System** - Handle user reports with status tracking
- **Task Moderation** - Delete inappropriate tasks
- **Statistics Dashboard** - View platform metrics and user counts

## 🏗️ Tech Stack

### Backend
- **Java 17** - Modern Java with latest features
- **Spring Boot 4.x** - Enterprise-grade framework
- **Spring Security + JWT** - Secure authentication & authorization
- **Spring Data JPA** - Database abstraction layer
- **PostgreSQL** - Production database
- **Cloudinary** - Image storage and optimization
- **Swagger/OpenAPI** - Interactive API documentation

### Frontend
- **React 18** - Modern UI library with hooks
- **React Router v6** - Client-side routing
- **Vite** - Lightning-fast build tool
- **Axios** - HTTP client with interceptors
- **Context API** - State management (Auth, Theme, Toast, Notifications)
- **CSS Variables** - Dynamic theming system

## 📁 Project Structure

```
internx-project/
├── src/main/java/com/chanderparkash/internx/
│   ├── config/          # Security, JWT, Cloudinary, WebSocket
│   ├── controller/      # REST API endpoints
│   ├── service/         # Business logic
│   ├── Entities/        # JPA entities
│   ├── Repository/      # Data access layer
│   └── DTO/            # Data transfer objects
├── internx-frontend/
│   ├── src/
│   │   ├── api/        # Axios configuration
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # React context providers
│   │   ├── pages/      # Route components
│   │   └── assets/     # Images and static files
│   └── dist/           # Production build
└── database-migration.sql  # Schema updates
```

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 18 or higher
- PostgreSQL 14 or higher
- Cloudinary account (for image uploads)

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/internx-project.git
cd internx-project
```

2. **Configure database**
```bash
# Create PostgreSQL database
createdb internx
```

3. **Set environment variables**
```bash
# Create application.properties or set environment variables
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/internx
SPRING_DATASOURCE_USERNAME=your_username
SPRING_DATASOURCE_PASSWORD=your_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret_key_min_256_bits
```

4. **Run database migrations**
```bash
psql -U your_username -d internx -f database-migration.sql
```

5. **Build and run**
```bash
./mvnw clean install
./mvnw spring-boot:run
```

Backend will start at `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd internx-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure API URL**
```bash
# Create .env file
VITE_API_URL=http://localhost:8080
```

4. **Run development server**
```bash
npm run dev
```

Frontend will start at `http://localhost:5173`

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8080/swagger-ui/index.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

#### Tasks
- `GET /api/tasks` - Get all tasks (paginated)
- `POST /api/tasks` - Create task (COMPANY only)
- `GET /api/tasks/{id}` - Get task details
- `DELETE /api/tasks/{id}` - Delete task (COMPANY/ADMIN)

#### Applications
- `POST /api/applications/{taskId}` - Apply for task
- `GET /api/applications/my` - View my applications
- `GET /api/applications/task/{taskId}` - View task applicants
- `PUT /api/applications/{id}/accept` - Accept application
- `PUT /api/applications/{id}/reject` - Reject application

#### Feed & Social
- `GET /api/feed/paged` - Get feed posts (connections)
- `GET /api/feed/all/paged` - Get all posts
- `POST /api/posts` - Create post
- `POST /api/posts/{id}/like` - Like/react to post
- `DELETE /api/posts/{id}/like` - Unlike post
- `POST /api/posts/{id}/comments` - Add comment
- `GET /api/posts/{id}/comments` - Get comments

#### Connections
- `POST /api/connections/request/{userId}` - Send connection request
- `POST /api/connections/accept/{userId}` - Accept request
- `POST /api/connections/reject/{userId}` - Reject request
- `GET /api/connections/my` - Get my connections

#### Notifications
- `GET /api/notifications` - Get all notifications
- `PUT /api/notifications` - Mark all as read
- `GET /api/notifications/unread-count` - Get unread count

#### Messages
- `GET /api/messages/conversations` - Get conversation list
- `GET /api/messages/{userId}` - Get messages with user
- `POST /api/messages/send` - Send message
- `GET /api/messages/unread-count` - Get unread count

## 🎨 Features Showcase

### 1. Rich Post Reactions
Users can express emotions with 6 different reactions:
- 👍 Like
- ❤️ Love
- 😂 Haha
- 😮 Wow
- 😢 Sad
- 🎉 Celebrate

Hover over the Like button for 400ms to see the reaction picker!

### 2. Smart Notifications
- **Real-time popups** - Toast notifications appear instantly
- **Deep-linking** - Click to jump directly to the related post/task
- **Auto-read** - Notifications marked as read when viewed
- **Badge counts** - Real-time unread counts in navigation

### 3. Mobile-Responsive Messaging
- **WhatsApp-style UI** - Familiar conversation list + chat view
- **Full-screen panels** - Optimized for mobile screens
- **Touch scrolling** - Smooth iOS/Android scrolling
- **Safe area support** - Works perfectly on notched phones

### 4. Professional Admin Panel
- **User management** - Ban, unban, delete users
- **Reports handling** - Review and resolve user reports
- **Statistics** - View platform metrics
- **Task moderation** - Delete inappropriate content

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Role-Based Access Control** - STUDENT, COMPANY, ADMIN roles
- **Password Encryption** - BCrypt hashing
- **CORS Configuration** - Secure cross-origin requests
- **Input Validation** - Server-side validation on all endpoints
- **XSS Protection** - Sanitized user inputs
- **CSRF Protection** - Spring Security CSRF tokens

## 🧪 Testing

### Backend Tests
```bash
./mvnw test
```

### Frontend Tests
```bash
cd internx-frontend
npm run test
```

## 📦 Building for Production

### Backend
```bash
./mvnw clean package -DskipTests
# JAR file: target/internx-project-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd internx-frontend
npm run build
# Static files: dist/
```

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions for:
- Railway
- Render
- Vercel
- Netlify
- Docker
- AWS

## 📊 Database Schema

### Core Tables
- `users` - User accounts with roles
- `tasks` - Company-posted tasks
- `applications` - Student applications to tasks
- `submissions` - Student work submissions
- `ratings` - Company ratings of students
- `skills` - Student skills

### Social Tables
- `posts` - Feed posts
- `post_likes` - Post reactions (with emoji type)
- `post_comments` - Post comments
- `connections` - User connections
- `notifications` - User notifications (with deep-linking)
- `messages` - Direct messages
- `reports` - User reports

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Chander Parkash**
- GitHub: [@chanderparkash](https://github.com/chanderparkash)

## 🙏 Acknowledgments

- Spring Boot team for the amazing framework
- React team for the powerful UI library
- Cloudinary for image hosting
- All contributors and testers

## 📞 Support

For support, email chanderparkash@example.com or open an issue on GitHub.

## 🗺️ Roadmap

- [ ] WebSocket for real-time messaging
- [ ] Video call integration for interviews
- [ ] Payment integration for paid tasks
- [ ] Mobile apps (React Native)
- [ ] AI-powered task recommendations
- [ ] Resume builder
- [ ] Certificate generation
- [ ] Analytics dashboard for companies

## 📈 Stats

- **Backend**: 111 Java files, ~15,000 lines of code
- **Frontend**: 20+ React components, ~8,000 lines of code
- **API Endpoints**: 50+ REST endpoints
- **Database Tables**: 20+ tables
- **Build Time**: Backend 39s, Frontend 4.8s

---

**Built with ❤️ by Chander Parkash**

*Last Updated: April 24, 2026*
