# Daily LeetCode Generator

A full-stack web application to generate a daily set of LeetCode questions for structured practice.

## Tech Stack
- Frontend: React (Vite), Tailwind CSS v4, Lucide React, Framer Motion
- Backend: Node.js, Express
- Database: MongoDB (Mongoose)

## Features
- Daily generation of 6 questions (1 Easy, 4 Medium, 1 Hard) at midnight via Cron Jobs.
- Questions chosen from targeted topics.
- Does not repeat questions from the last 7 days.
- User streak tracking.
- Dark mode modern UI.
- JWT Authentication.
- MongoDB schema structure designed for scale.

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB installed and running on `localhost:27017`

### Backend Setup
1. `cd backend`
2. `npm install`
3. Make sure MongoDB is running.
4. Run `node utils/seedData.js` to seed the database with initial LeetCode questions.
5. Run `node server.js` to start the backend on port 5000.

### Frontend Setup
1. Open a new terminal.
2. `cd frontend`
3. `npm install`
4. Run `npm run dev` to start the Vite dev server.
5. Open your browser to the URL provided by Vite (usually `http://localhost:5173`).

## Deployment Instructions

### MongoDB Atlas
1. Create a MongoDB Atlas cluster.
2. Get the connection string.
3. Replace the `MONGO_URI` in `backend/.env` with your Atlas string.

### Backend (Render)
1. Push your code to GitHub.
2. Create a new Web Service on Render.
3. Connect your GitHub repository.
4. Set Build Command: `npm install`
5. Set Start Command: `node server.js`
6. Add Environment Variables: `MONGO_URI`, `PORT=5000`, `JWT_SECRET`.

### Frontend (Vercel)
1. Push your code to GitHub.
2. Import the project in Vercel.
3. Set the Root Directory to `frontend`.
4. Vercel will automatically detect Vite and set the build command to `npm run build`.
5. Deploy!
