<div style="display: flex; justify-content: center;">
  <h1 style="display: flex; align-items: center; gap: 12px;">
    <img 
      src="https://github.com/user-attachments/assets/fc2eee37-046d-404c-b40f-2ee43f5fd220" 
      alt="Milanio Logo" 
      width="48" 
      height="48"
    />
    Milanio – Video Calling Platform
  </h1>
</div>

<p><strong>Milanio</strong> is a <strong>real-time WebRTC-based chat platform</strong> with video/audio calling, room management, and dynamic user interactions. Designed to deliver a seamless and fast communication experience, Milanio is built with performance, modularity, and scalability in mind.</p>

## 🚀 Features

### Core Functionality
- **Real-Time Video Calling**: High-quality peer-to-peer video communication
- **Screen Sharing**: Share your screen with participants seamlessly
- **Live Chat**: Integrated real-time messaging during video calls
- **Group Calling**: Support for multiple participants in a single room
- **Room Management**: Create and join rooms with unique room codes
- **User Authentication**: Secure login and registration system

### User Experience
- **Dark/Light Theme**: Toggle between dark and light modes
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Framer Motion powered transitions and interactions
- **Interactive Carousel**: Swiper-powered feature showcase
- **Real-time Notifications**: Instant feedback for user actions

### Technical Features
- **Socket.IO Integration**: Real-time bidirectional communication
- **Prisma ORM**: Type-safe database operations
- **JWT Authentication**: Secure token-based authentication
- **Email Integration**: User verification and notifications
- **RESTful API**: Well-structured backend endpoints

## 🏗 System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Web Client │  │ Mobile Web  │  │   Desktop   │             │
│  │  (Browser)  │  │  (Browser)  │  │  (Browser)  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│              Next.js 15 (React 19) Application                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │    Pages    │  │ Components  │  │   Context   │             │
│  │   Routing   │  │   UI/UX     │  │   State     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  WebRTC     │  │ Socket.IO   │  │   Axios     │             │
│  │   Client    │  │   Client    │  │  HTTP Calls │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY                               │
├─────────────────────────────────────────────────────────────────┤
│                    Load Balancer                               │
│              Authentication Middleware                         │
│                   Rate Limiting                                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│              Node.js + Express.js Application                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Routes    │  │ Controllers │  │ Middleware  │             │
│  │    API      │  │   Business  │  │    Auth     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Socket.IO   │  │   Prisma    │  │   Email     │             │
│  │   Server    │  │    ORM      │  │  Service    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ PostgreSQL  │  │    Redis    │  │   File      │             │
│  │  Database   │  │   Cache     │  │  Storage    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### Component Architecture
```
Frontend Architecture (Next.js)
├── App Layer
│   ├── layout.tsx (Root Layout)
│   ├── page.tsx (Home Page)
│   ├── Loby/ (Lobby Pages)
│   └── api/ (API Routes)
│
├── Component Layer
│   ├── HomeClient.tsx (Landing Page)
│   ├── Login.tsx (Authentication)
│   ├── Register.tsx (User Registration)
│   ├── Carousel.tsx (Feature Showcase)
│   └── UI Components
│
├── Context Layer
│   ├── ThemeContext (Theme Management)
│   ├── AuthContext (User Authentication)
│   └── SocketContext (Real-time Communication)
│
└── Utility Layer
    ├── API Clients
    ├── Helper Functions
    └── Constants

Backend Architecture (Node.js + Express)
├── Application Layer
│   ├── app.ts (Express Configuration)
│   ├── server.ts (Server Initialization)
│   └── Socket Handlers
│
├── Controller Layer
│   ├── user.controller.ts
│   ├── room.controller.ts
│   └── auth.controller.ts
│
├── Service Layer
│   ├── User Service
│   ├── Room Service
│   ├── Email Service
│   └── Authentication Service
│
├── Data Access Layer
│   ├── Prisma Client
│   ├── Database Models
│   └── Repository Pattern
│
└── Infrastructure Layer
    ├── Middleware (Auth, CORS, etc.)
    ├── Utilities
    └── Configuration
```

## 🔄 Application Workflow

### User Registration & Authentication Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │  Frontend   │    │   Backend   │    │  Database   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │                  │
       │ 1. Register      │                  │                  │
       ├─────────────────▶│                  │                  │
       │                  │ 2. Validate &    │                  │
       │                  │    Submit        │                  │
       │                  ├─────────────────▶│                  │
       │                  │                  │ 3. Hash Password │
       │                  │                  │    & Store User  │
       │                  │                  ├─────────────────▶│
       │                  │                  │                  │
       │                  │                  │ 4. User Created  │
       │                  │                  │◀─────────────────┤
       │                  │ 5. Send Email    │                  │
       │                  │    Verification  │                  │
       │                  │◀─────────────────┤                  │
       │ 6. Registration  │                  │                  │
       │    Success       │                  │                  │
       │◀─────────────────┤                  │                  │
       │                  │                  │                  │
       │ 7. Login Request │                  │                  │
       ├─────────────────▶│                  │                  │
       │                  │ 8. Authenticate  │                  │
       │                  ├─────────────────▶│                  │
       │                  │                  │ 9. Verify User   │
       │                  │                  ├─────────────────▶│
       │                  │                  │ 10. User Data    │
       │                  │                  │◀─────────────────┤
       │                  │ 11. Generate JWT │                  │
       │                  │◀─────────────────┤                  │
       │ 12. Auth Token   │                  │                  │
       │◀─────────────────┤                  │                  │
```

### Video Call Establishment Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User A    │    │   Server    │    │   User B    │    │   WebRTC    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │                  │
       │ 1. Create Room   │                  │                  │
       ├─────────────────▶│                  │                  │
       │                  │ 2. Room Created  │                  │
       │◀─────────────────┤                  │                  │
       │                  │                  │                  │
       │                  │ 3. Share Room ID │                  │
       │                  │                  │                  │
       │                  │                  │ 4. Join Room     │
       │                  │◀─────────────────┤                  │
       │                  │                  │                  │
       │ 5. User Joined   │                  │                  │
       │    Notification  │                  │                  │
       │◀─────────────────┤                  │                  │
       │                  │                  │                  │
       │ 6. Initiate Call │                  │                  │
       ├─────────────────▶│                  │                  │
       │                  │ 7. Call Signal   │                  │
       │                  ├─────────────────▶│                  │
       │                  │                  │                  │
       │ 8. Create Offer  │                  │                  │
       ├─────────────────────────────────────────────────────▶│
       │                  │                  │                  │
       │                  │ 9. Send Offer    │                  │
       ├─────────────────▶│                  │                  │
       │                  │ 10. Forward      │                  │
       │                  │     Offer        │                  │
       │                  ├─────────────────▶│                  │
       │                  │                  │ 11. Create       │
       │                  │                  │     Answer       │
       │                  │                  ├─────────────────▶│
       │                  │                  │                  │
       │                  │ 12. Send Answer  │                  │
       │                  │◀─────────────────┤                  │
       │ 13. Forward      │                  │                  │
       │     Answer       │                  │                  │
       │◀─────────────────┤                  │                  │
       │                  │                  │                  │
       │ 14. ICE Candidates Exchange         │                  │
       │◀─────────────────────────────────────────────────────▶│
       │                  │                  │                  │
       │ 15. Video Stream Established        │                  │
       │◀═══════════════════════════════════════════════════▶│
```

### Real-Time Chat & Screen Sharing Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Participant │    │   Server    │    │   Other     │
│      A      │    │ (Socket.IO) │    │Participants │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │
       │ 1. Send Message  │                  │
       ├─────────────────▶│                  │
       │                  │ 2. Broadcast     │
       │                  │    Message       │
       │                  ├─────────────────▶│
       │                  │                  │
       │ 3. Start Screen  │                  │
       │    Sharing       │                  │
       ├─────────────────▶│                  │
       │                  │ 4. Notify Screen │
       │                  │    Share Start   │
       │                  ├─────────────────▶│
       │                  │                  │
       │ 5. Screen Stream │                  │
       │    via WebRTC    │                  │
       │══════════════════════════════════▶│
       │                  │                  │
       │ 6. Stop Screen   │                  │
       │    Sharing       │                  │
       ├─────────────────▶│                  │
       │                  │ 7. Notify Screen │
       │                  │    Share Stop    │
       │                  ├─────────────────▶│
```

### Room Management Workflow
```
Room Lifecycle:
┌─────────────┐
│   Created   │ ──┐
└─────────────┘   │
                  ▼
┌─────────────┐   ┌─────────────┐
│   Active    │◀─▶│   Waiting   │
│(Has Users)  │   │ (No Users)  │
└─────────────┘   └─────────────┘
       │                  │
       ▼                  ▼
┌─────────────┐   ┌─────────────┐
│  Destroyed  │◀──│   Expired   │
│(Manual/Auto)│   │(Timeout)    │
└─────────────┘   └─────────────┘

State Transitions:
1. Room Created → Waiting
2. First User Joins → Active
3. Last User Leaves → Waiting
4. Timeout Reached → Expired
5. Manual Delete → Destroyed
```

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15.3.4 (React 19.0.0)
- **Styling**: Tailwind CSS 4.x
- **Animations**: Framer Motion 12.23.5
- **UI Components**: Custom components with Lucide React icons
- **Carousel**: Swiper 11.2.10
- **Animations**: Lottie React 2.4.1
- **HTTP Client**: Axios 1.10.0
- **Real-time**: Socket.IO Client 4.8.1

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Email**: Custom email utility
- **Development**: Nodemon for hot reloading

## 📁 Project Structure

```
WebVideo/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── Loby/           # Main lobby page
│   │   │   ├── api/auth/       # Authentication API routes
│   │   │   └── layout.tsx      # Root layout
│   │   ├── component/
│   │   │   ├── HomeClient.tsx  # Landing page component
│   │   │   ├── Login.tsx       # Login modal
│   │   │   ├── Register.tsx    # Registration modal
│   │   │   └── Carousel.tsx    # Feature carousel
│   │   ├── context/
│   │   │   └── themeContext.tsx # Theme management
│   │   ├── img/                # Static images
│   │   └── utility/            # Helper functions
│   ├── public/                 # Static assets
│   ├── .next/                  # Next.js build output
│   └── package.json
│
└── backend/
    ├── controllers/
    │   └── user.controller.ts  # User management logic
    ├── routes/
    │   └── user.routes.ts      # API route definitions
    ├── Middleware/
    │   └── auth.ts             # Authentication middleware
    ├── prisma/
    │   ├── schema.prisma       # Database schema
    │   ├── client.ts           # Prisma client setup
    │   └── migrations/         # Database migrations
    ├── socketHandlers/
    │   └── socket.ts           # Socket.IO event handlers
    ├── utility/
    │   └── email.ts            # Email functionality
    ├── app.ts                  # Express app configuration
    └── package.json
```

## 📊 Data Flow Architecture

### Request-Response Pattern
```
Client Request → Next.js API Routes → Backend Controllers → Services → Database
           ↓                                                           ↑
     Client Response ← JSON Response ← HTTP Response ← Query Results ←
```

### Real-Time Communication Pattern
```
Client A → Socket.IO Client → Socket.IO Server → Socket.IO Client → Client B
    ↑                                                                   ↓
    ←─────────────────── Real-time Events ──────────────────────────────
```

### WebRTC Signaling Pattern
```
Peer A → Socket.IO → Signaling Server → Socket.IO → Peer B
   ↓                                                    ↓
Direct P2P Connection (Audio/Video/Data) ←─────────────→
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd WebVideo
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Environment Configuration**
Create a `.env` file in the backend directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/webvideo"
JWT_SECRET="your-jwt-secret"
EMAIL_USER="your-email@example.com"
EMAIL_PASS="your-email-password"
PORT=5000
```

4. **Database Setup**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Frontend Setup**
```bash
cd ../frontend
npm install
```

6. **Start Development Servers**

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🎯 Usage

### Creating a Room
1. Navigate to the lobby page
2. Click "Create Room"
3. Share the generated room code with participants

### Joining a Room
1. Enter a valid room code
2. Click "Join Room"
3. Grant camera and microphone permissions

### Features in Video Call
- Toggle camera/microphone
- Screen sharing
- Real-time chat
- Participant management

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Room Management
- `POST /api/rooms/create` - Create new room
- `POST /api/rooms/join` - Join existing room
- `GET /api/rooms/:id` - Get room details

## 🎨 Components Overview

### HomeClient Component
- Landing page with feature showcase
- Authentication modals integration
- Theme toggle functionality
- Responsive design with animations

### Authentication Components
- **Login**: Modal-based login form with validation
- **Register**: Registration form with password validation
- Secure form handling with error management

### Lobby Component
- Room creation and joining interface
- Real-time room status updates
- Feature carousel display

### Carousel Component
- Swiper-powered feature showcase
- Auto-play functionality
- Responsive breakpoints

## 🌐 Real-Time Features

### Socket.IO Events
- Room creation and joining
- Video call signaling
- Chat messaging
- User presence tracking
- Screen sharing coordination

### WebRTC Integration
- Peer-to-peer video streaming
- Audio/video controls
- Screen capture API
- Connection quality monitoring

## 🎨 Styling & Theming

### Tailwind CSS Configuration
- Custom color schemes for dark/light themes
- Responsive design utilities
- Custom component classes
- Neumorphic design elements

### Theme System
- Context-based theme management
- Persistent theme preferences
- Smooth theme transitions
- System preference detection

## 📱 Responsive Design

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile Optimizations
- Touch-friendly interface
- Optimized video layouts
- Collapsible navigation
- Gesture support

## 🔒 Security Features

### Authentication
- JWT token-based authentication
- Secure password hashing
- Email verification
- Session management

### Data Protection
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Secure headers

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy to Vercel
```

### Backend (Your preferred platform)
```bash
cd backend
npm run build
# Deploy to your hosting platform
```

### Environment Variables
Ensure all environment variables are properly configured in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Socket.IO for real-time communication
- Framer Motion for smooth animations
- Tailwind CSS for utility-first styling
- Prisma for type-safe database operations

## 📞 Support

For support, email mayurlaxkar76@gmail.com.

---

**Milanio** - Connecting people through seamless video communication 🎥✨
