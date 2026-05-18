# 🚀 MockMind – AI-Powered Mock Interview Platform

MockMind is a production-grade AI-powered mock interview SaaS platform designed to help users prepare for technical and behavioral interviews through real-time AI interaction, voice-based responses, and performance analytics.

The platform simulates real interview environments using AI-generated questions, structured feedback, score analysis, and live chat-based interview sessions.

---

# ✨ Features

- 🔐 Secure JWT Authentication
- 🤖 AI-Powered Interview Generation
- 💬 Real-Time Interview Chat
- 🎤 Voice-Based Interview Responses
- 📊 Performance Analytics Dashboard
- 📚 Interview History Tracking
- 📄 PDF Interview Report Generation
- 📧 Email-Based Feedback Reports
- ⚡ WebSocket Integration
- 🌙 Modern SaaS UI with Responsive Design

---

# 🛠️ Tech Stack

## Frontend
- Next.js
- TypeScript
- Tailwind CSS

## Backend
- Node.js
- Express.js
- TypeScript

## Database
- MongoDB
- Mongoose

## Authentication
- JWT Authentication
- Refresh Tokens
- bcrypt

## Real-Time Communication
- Socket.io
- WebSockets

## AI Integration
- OpenAI-Compatible API

---

# 📂 Project Structure

```bash
MockMind/
│
├── client/
│   ├── app/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   └── utils/
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── middlewares/
│   ├── config/
│   └── utils/
│
└── README.md

# 🚀 Installation
## Clone Repository
git clone https://github.com/your-username/mockmind.git
cd mockmind

## Install Dependencies
### Client
cd client
npm install
### Server
cd server
npm install

# 🔑 Environment Variables
Create a .env file inside the server directory:
PORT=5000
MONGO_URI=YOUR_MONGODB_URI
JWT_SECRET=YOUR_SECRET_KEY
OPENAI_API_KEY=YOUR_OPENAI_API_KEY

# ▶️ Run Project
## Start Backend
cd server
npm run dev

## Start Frontend
cd client
npm run dev

# 🧪 Testing
cd Backend
npm test

# 👨‍💻 Author
Developed by Abdul Hadi  
GitHub: :contentReference[oaicite:0]{index=0}

#📜 License
This project is licensed for educational and portfolio purposes.
