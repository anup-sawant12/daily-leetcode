# DSAVerse 🚀

A premium full-stack web application designed for structured daily LeetCode practice, profile tracking, and friendly competition.

## 🔗 Live Website
Access the live application here:
👉 **[DSAVerse Login](https://daily-leetcode-ten.vercel.app/login)**

---

## 🌟 Key Features

### 1. Daily Challenge Sets
- Dynamic daily question sets containing **6 custom questions** (1 Easy, 4 Medium, 1 Hard) generated automatically.
- Custom options to adjust question counts per difficulty and filter specific topics (e.g., Dynamic Programming, Graphs) when generating or regenerating a set.
- Smart deduplication to ensure questions solved within the last 7 days are not repeated.

### 2. Algorithmic Strategy Hints Drawer
- Expandable strategy drawers for each challenge card utilizing Lucide icons and sleek micro-animations.
- Provides target time/space complexity guides and custom-tailored hints based on active topic tags (e.g., sliding window, recursive DP transitions, BST base cases).

### 3. Coders Leaderboard, Top-3 Awards, & Public Profile Cards
- Live global leaderboard showcasing the top coders.
- Interactive toggle tabs to filter rankings by **Weekly Solved**, **Monthly Solved**, or **Overall Solved** counts.
- Highlights podium ranks (1st, 2nd, 3rd) with trophy status indicators and highlights the current user's profile inline.
- Displays custom prestige title badges next to coder names for the top 3 spots: **Apex Coder** (1st), **Elite Solver** (2nd), and **Rising Star** (3rd).
- **Public Profile Cards**: Clicking any user on the leaderboard opens a sleek overlay card displaying their active streak, total solved count, solved questions difficulty breakdown (Easy/Medium/Hard) progress bars, and their top solved topic tags.

### 4. Locked LeetCode Profile Verification (Anti-Hijacking)
- Profile verification is locked backend-side to prevent profile hijacking and leaderboard spoofing.
- Connects verified public profiles securely; displays user verification status and links directly to their public LeetCode profiles.

### 5. Topic Tag Mastery Analytics
- Interactive horizontal bar charts built with Recharts in the progress tab.
- Groups solved questions dynamically by category (Arrays, Trees, Dynamic Programming, etc.) to visually chart data structure and algorithm mastery.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS v4, Framer Motion, Lucide React, Recharts
- **Backend**: Node.js, Express, JWT Authentication
- **Database**: MongoDB & Mongoose (Aggregation pipelines for timeframe queries)

---

## 💻 Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `localhost:27017` or a MongoDB Atlas connection string.

### Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed initial questions database:
   ```bash
   node utils/seedData.js
   ```
4. Start the server:
   ```bash
   node server.js
   ```
   *(Running by default on `http://localhost:5000`)*

### Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Access the web interface at the default local URL: `http://localhost:5173`.

---

## 🚀 Deployment

### Backend (Render)
- Build Command: `npm install`
- Start Command: `node server.js`
- Environment variables: `MONGO_URI`, `JWT_SECRET`, `PORT`

### Frontend (Vercel)
- Set the Root Directory to `frontend`.
- Set the Build Command to `npm run build`.
- Redirect API requests through environment variables pointing to the deployed backend endpoint.
