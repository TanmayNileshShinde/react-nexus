# 🚀 React Nexus

**React Nexus** is a full-stack, web-based arcade hub featuring 8 custom-built mini-games. Built as a culmination of my Computer Engineering diploma studies, this platform combines retro gaming nostalgia with modern web architecture, including real-time global leaderboards and a custom "Glassmorphism" UI.

**🌐 Live Demo:** [Play React Nexus Here](https://reactnexus.vercel.app)

---

## 🎮 The Arcade

React Nexus features 8 distinct games with seamless navigation:

* 🏎️ **F1 Higher / Lower:** A custom trivia game challenging users to guess driver podium counts, complete with a live global "Hall of Fame" leaderboard.
* 🏁 **F1 Memory Game:** Match pairs of Formula 1 drivers in a classic memory grid format.
* 🐍 **Snake Arena:** A classic, retro-style snake survival game.
* 🔢 **Neon 2048:** A glowing, stylized version of the classic sliding tile puzzle.
* ⌨️ **Terminal Typer:** A coding speed test for developers.
* ⚡ **Reaction Test:** Test your reflexes with a visual response challenge.
* ❌ **Tic-Tac-Toe:** Classic competitive gameplay (Vs AI & PvP).
* 🧮 **Math Blitz:** A rapid-fire math quiz challenge.

---

## ✨ Key Features

* **Global Leaderboards:** Real-time database reads/writes track user streaks and high scores for the F1 trivia game.
* **Authentication:** Secure Google Sign-in integration via Firebase.
* **Complex State Management:** Handles unique game logic, card-matching states, and victory conditions natively within React.
* **Custom UI/UX:** Designed with a cohesive, dark-themed "Glassmorphism" interface utilizing `lucide-react` icons.
* **Lightning Fast:** Bundled with Vite for instant server starts and optimized production builds.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, Vite, React Router DOM
* **Backend & Auth:** Firebase Authentication, Cloud Firestore
* **Styling:** Custom CSS modules (Glassmorphism design)
* **Icons:** Lucide React

---

## 🚀 Getting Started

Follow these steps to run the arcade locally.

### Prerequisites
* Node.js (v18 or higher recommended)
* npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone [https://github.com/TanmayNileshShinde/react-nexus.git(https://github.com/TanmayNileshShinde/react-nexus.git)
   cd react-nexus
   ```

2. Install dependencies
   ```bash
   npm install
   ```
      

3. Set up Firebase Environment  
Create a .env file in the root directory and add your Firebase configuration credentials:
   ```bash
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ``` 
  (Note: You will need to update src/firebase.js to utilize these environment variables).
    
4. Start the Development Server

   ```
   npm run dev
   ```
The app will run at http://localhost:5173

---

## 📂 Architecture Overview
The application utilizes a flat routing structure managed by React Router. The main UI acts as a portal, loading individual game components on demand to keep the initial bundle size light. Firebase logic is centralized, allowing multiple games to tap into the same authentication state and Firestore collections without redundant code.

---
## 👤 Contact
Tanmay Nilesh Shinde

GitHub: https://github.com/TanmayNileshShinde

LinkedIn: https://www.linkedin.com/in/tanmay-shinde-9b07753bb
