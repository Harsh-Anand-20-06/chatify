#  Real-Time Chat Application

A full-stack real-time chat application built with **React, Node.js, Express, MongoDB, and native WebSockets**. The application provides secure authentication, multi-device session management, real-time messaging, presence tracking, and API protection without relying on Socket.IO.

##  Features

###  Authentication & Authorization

* Access token + refresh token based authentication
* Short-lived access tokens for API authorization
* Refresh token based session renewal
* Multiple concurrent user sessions
* Session management across devices
* Secure logout and session revocation
* Protected API routes using authentication middleware

###  Real-Time Communication

* Native WebSocket implementation without Socket.IO
* Real-time message delivery
* Online / offline presence
* Typing indicators
* Message delivery status
* Read receipts
* Persistent WebSocket connections
* Connection and disconnection handling
* Real-time event-based communication
* Real-time UI synchronization across connected clients

###  Security

* Password hashing
* Authentication middleware
* API rate limiting
* Protected routes
* Input validation
* CORS configuration
* Secure token handling

###  Frontend

* React-based user interface
* Zustand for global state management
* Axios for REST API communication
* Responsive chat interface
* Real-time UI updates through WebSockets

###  Backend

* Node.js + Express
* Native WebSocket server
* REST APIs for authentication and application data
* MongoDB for persistent storage
* Middleware-based request processing
* Rate-limited API endpoints
* Real-time event handling

---

#  Screenshots

## Login

![Login](https://github.com/user-attachments/assets/eefada7e-e2b0-4de9-987a-092d947c53cc)

## Register

![Register](https://github.com/user-attachments/assets/a8e5f1ec-b96b-416e-8c7c-58c85a1c27d2)

## Chat Interface

![Chat](https://github.com/user-attachments/assets/8e9db7c3-eb3a-423f-b7ab-8b8b12a1c7e2)

---

# 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │      React UI       │
                    │                     │
                    │  Zustand + Axios    │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
             HTTP/REST                    WebSocket
                │                             │
                ▼                             ▼
       ┌─────────────────┐          ┌─────────────────┐
       │ Express Server  │          │ WebSocket Server│
       │                 │          │                 │
       │ Auth / APIs     │          │ Real-time Events│
       │ Rate Limiting   │          │ Connections     │
       └────────┬────────┘          └────────┬────────┘
                │                            │
                └─────────────┬──────────────┘
                              ▼
                    ┌──────────────────┐
                    │     MongoDB      │
                    │                  │
                    │ Users            │
                    │ Sessions         │
                    │ Messages         │
                    └──────────────────┘
```

---

#  Authentication Flow

The application uses an access token + refresh token architecture.

```text
User
 │
 │ Login
 ▼
Backend
 │
 ├── Verify credentials
 │
 ├── Generate access token
 │
 ├── Generate refresh token
 │
 └── Create session
 │
 ▼
Client
```

When the access token expires:

```text
Client
  │
  │ API request
  ▼
Backend
  │
  │ Access token expired
  ▼
Client
  │
  │ Refresh request
  ▼
Backend
  │
  │ Validate refresh token
  │
  │ Issue new access token
  ▼
Client
```

Multiple sessions are maintained independently, allowing users to remain logged in across different devices and revoke individual sessions when required.

---

#  WebSocket Architecture

Instead of using Socket.IO, the application implements WebSocket communication directly.

```text
             WebSocket Connection
                     │
                     ▼
              ┌─────────────┐
              │   Server    │
              └──────┬──────┘
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       User A      User B     User C
```

Messages and real-time events are exchanged using structured WebSocket messages.

### Real-Time Events

```text
┌──────────────────────┐
│    WebSocket Server  │
└──────────┬───────────┘
           │
     ┌─────┼─────┬──────────┬────────────┐
     ▼     ▼     ▼          ▼            ▼
  Message Typing Presence  Delivered     Read
   Event    Event   Event     Event      Event
```

Example message event:

```json
{
  "type": "message",
  "conversationId": "conversation_id",
  "senderId": "user_id",
  "content": "Hello!"
}
```

Example typing event:

```json
{
  "type": "typing",
  "conversationId": "conversation_id",
  "userId": "user_id"
}
```

Example delivery event:

```json
{
  "type": "message_delivered",
  "messageId": "message_id"
}
```

Example read receipt event:

```json
{
  "type": "message_read",
  "messageId": "message_id"
}
```

The server processes these events and forwards them to the appropriate connected clients, enabling real-time synchronization without polling.

---

#  Rate Limiting

API endpoints are protected using rate limiting to prevent excessive requests and basic abuse.

Example:

```text
Client
  │
  │ Multiple requests
  ▼
Rate Limiter
  │
  ├── Within limit ──► API
  │
  └── Exceeded ──────► 429 Too Many Requests
```

Different endpoints can use different request limits depending on their sensitivity.

---

#  Tech Stack

### Frontend

* React
* Zustand
* Axios
* JavaScript / TypeScript
* HTML
* CSS

### Backend

* Node.js
* Express.js
* WebSocket
* REST API

### Database

* MongoDB

### Security

* JWT
* Refresh Tokens
* Password Hashing
* Rate Limiting
* Authentication Middleware

---

#  Project Structure

```text
chat-app/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── websocket/
│   ├── utils/
│   └── server.js
│
├── .env.example
├── README.md
└── package.json
```

---

#  Installation

### 1. Clone the repository

```bash
git clone https://github.com/Harsh-Anand-20-06/chatify.git
cd real-time-chat-app
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

### 4. Configure environment variables

Create `.env` files according to `.env.example`.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLIENT_URL=http://localhost:5173
```

### 5. Start the backend

```bash
cd server
npm run dev
```

### 6. Start the frontend

```bash
cd client
npm run dev
```

---

# Application Flow

```text
                    ┌──────────────┐
                    │     User     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Authentication│
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Access Token │
                    │ + Refresh    │
                    │    Token     │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
        REST API Calls            WebSocket
              │                         │
              ▼                         ▼
        Express Server            Real-Time Events
              │                         │
              └────────────┬────────────┘
                           ▼
                      MongoDB
```

---

#  Key Engineering Decisions

### Why native WebSockets instead of Socket.IO?

The project uses the WebSocket protocol directly to understand and control the underlying real-time communication layer instead of relying on Socket.IO's abstraction.

This provides direct experience with:

* WebSocket connections
* Connection lifecycle
* Event/message handling
* Broadcasting
* Client disconnections
* Real-time state synchronization
* Presence management
* Delivery and read acknowledgements

### Why Zustand?

Zustand provides lightweight global state management with minimal boilerplate and is used to manage client-side application and chat state.

### Why access + refresh tokens?

Short-lived access tokens limit the lifetime of an exposed access token, while refresh tokens allow users to maintain authenticated sessions without repeatedly logging in.

### Why multiple sessions?

Sessions are tracked independently so users can manage authentication across multiple devices and revoke individual sessions when required.

---

#  Future Improvements

* Image and file sharing
* Group conversations
* Message search
* Message editing and deletion
* Redis-based WebSocket scaling
* Push notifications
* Docker-based deployment

---

#  Author

**Harsh Anand**

* GitHub: https://https://github.com/Harsh-Anand-20-06

---

 If you found this project interesting, consider giving the repository a star.
