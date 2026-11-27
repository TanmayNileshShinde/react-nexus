import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
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
import { emitFeedback } from './utils/fluidMotion';

import './styles/App.css';

const ROUTE_TITLES = {
  '/': 'Arcade Suite',
  '/game': 'Tic-Tac-Toe',
  '/chess': 'Chess Arena',
  '/2048': 'Neon 2048',
  '/snake': 'Snake Arena',
  '/type': 'Terminal Typer',
  '/reaction': 'Reaction Test',
  '/memory': 'F1 Memory',
  '/f1': 'F1 Trivia',
  '/paddockdle': 'PaddockDle F1',
  '/f1-wordle': 'PaddockDle F1',
  '/paddockdle-grid': 'Paddock Grid',
  '/paddockdle-career': 'Paddock Career',
};

function TopChromeBar() {
  const location = useLocation();
  const isPaddockRoute =
    location.pathname.startsWith('/paddockdle') || location.pathname === '/f1-wordle';
  if (isPaddockRoute) return null;

  const isHome = location.pathname === '/';
  const routeTitle = ROUTE_TITLES[location.pathname] || 'React Nexus';

  return (
    <header className="arcade-topbar">
      <div className="arcade-topbar-inner">
        {isHome ? (
          <div className="arcade-topbar-brand">
            <Gamepad2 size={16} strokeWidth={1.75} color="#38bdf8" />
            <span>React Nexus</span>
          </div>
        ) : (
          <Link
            to="/"
            onPointerDown={() => emitFeedback('tap')}
            className="arcade-topbar-back"
            title="Back to React Nexus Arcade Hub"
          >
            <ArrowLeft size={15} strokeWidth={1.75} />
            <span>Library</span>
          </Link>
        )}

        <div className="arcade-topbar-title">{isHome ? '12 Games · Local & AI' : routeTitle}</div>

        <AudioController />
      </div>
    </header>
  );
}

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SoundProvider>
        <Router>
          <TopChromeBar />
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
            <Route path="*" element={<Home />} />
          </Routes>
        </Router>
      </SoundProvider>
    </MotionConfig>
  );
}

export default App;
