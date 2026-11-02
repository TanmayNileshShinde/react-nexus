import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { Gamepad2, ArrowLeft } from 'lucide-react';
import Home from './pages/Home';
import TicTacToe from './pages/TicTacToe';
import MemoryGame from './pages/MemoryGame';
import ReactionGame from './pages/ReactionGame';
import ChessGame from './pages/ChessGame';
import SnakeGame from './pages/SnakeGame';
import TypingMaster from './pages/TypingMaster';
import F1HigherLower from './pages/F1HigherLower';
import F1PaddockClassic from './pages/F1PaddockClassic';
import F1PaddockGrid from './pages/F1PaddockGrid';
import F1PaddockCareer from './pages/F1PaddockCareer';
import Neon2048 from './pages/Neon2048';
import { SoundProvider } from './context/SoundContext';
import AudioController from './components/AudioController';

import './styles/App.css';

function FloatingHubNav() {
  const location = useLocation();
  if (location.pathname === '/') return null;

  return (
    <nav className="arcade-floating-nav" aria-label="Quick Hub Navigation">
      <Link to="/" className="arcade-floating-nav-pill" title="Back to React Nexus Arcade Hub">
        <ArrowLeft size={14} />
        <Gamepad2 size={16} color="#00f3ff" />
        <span>Nexus Hub</span>
      </Link>
    </nav>
  );
}

function App() {
  return (
    <SoundProvider>
      <Router>
        <FloatingHubNav />
        <AudioController />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<TicTacToe />} />
          <Route path="/memory" element={<MemoryGame />} />
          <Route path="/reaction" element={<ReactionGame />} />
          <Route path="/chess" element={<ChessGame />} />
          <Route path="/snake" element={<SnakeGame />} />
          <Route path="/f1" element={<F1HigherLower />} />
          <Route path="/paddockdle" element={<F1PaddockClassic />} />
          <Route path="/f1-wordle" element={<F1PaddockClassic />} />
          <Route path="/paddockdle-grid" element={<F1PaddockGrid />} />
          <Route path="/paddockdle-career" element={<F1PaddockCareer />} />
          <Route path="/type" element={<TypingMaster />} />
          <Route path="/2048" element={<Neon2048 />} />
        </Routes>
      </Router>
    </SoundProvider>
  );
}

export default App;
