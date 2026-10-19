import React from 'react';
import { Link } from 'react-router-dom';
import {
  Gamepad2,
  Crown,
  Grid,
  Activity,
  Keyboard,
  Zap,
  LayoutGrid,
  Flag,
  FileText,
  Sparkles,
  Trophy,
  Cpu,
  Flame,
} from 'lucide-react';

const GAMES = [
  {
    id: 'tictactoe',
    title: 'Tic-Tac-Toe',
    category: 'Strategy',
    desc: 'Unbeatable Minimax AI engine and local 2-player PvP showdown.',
    path: '/game',
    icon: Gamepad2,
    color: '#00f3ff',
    badge: 'AI & PvP',
  },
  {
    id: 'chess',
    title: 'Chess Arena',
    category: 'Grandmaster',
    desc: 'Full Stockfish engine AI, ranked matches, and cloud leaderboards.',
    path: '/chess',
    icon: Crown,
    color: '#ffd700',
    badge: 'Stockfish',
  },
  {
    id: 'neon2048',
    title: 'Neon 2048',
    category: 'Puzzle',
    desc: 'Dynamic sliding tile numbers with cyberpunk kinetic effects.',
    path: '/2048',
    icon: Grid,
    color: '#d3fe13',
    badge: 'Brain Bender',
  },
  {
    id: 'snake',
    title: 'Snake Arena',
    category: 'Survival',
    desc: 'Classic high-speed arcade survival with dynamic multipliers.',
    path: '/snake',
    icon: Activity,
    color: '#00ff88',
    badge: 'Retro Classic',
  },
  {
    id: 'typing',
    title: 'Terminal Typer',
    category: 'Rhythm',
    desc: 'Real-time code typing speed test with WPM and accuracy tracking.',
    path: '/type',
    icon: Keyboard,
    color: '#00b8ff',
    badge: 'WPM Test',
  },
  {
    id: 'reaction',
    title: 'Reaction Test',
    category: 'Reflex',
    desc: 'Benchmark your nervous system latency in sub-millisecond precision.',
    path: '/reaction',
    icon: Zap,
    color: '#f59e0b',
    badge: 'Miliseconds',
  },
  {
    id: 'memory',
    title: 'F1 Memory',
    category: 'Memory',
    desc: 'Match Formula 1 driver pairs and constructors against the clock.',
    path: '/memory',
    icon: LayoutGrid,
    color: '#ff4444',
    badge: 'Grid Match',
  },
  {
    id: 'f1trivia',
    title: 'F1 Trivia',
    category: 'Trivia',
    desc: 'Higher or lower career points, pole positions, and championship stats.',
    path: '/f1',
    icon: Flag,
    color: '#bc13fe',
    badge: 'F1 Stats',
  },
  {
    id: 'math',
    title: 'Math Blitz',
    category: 'Speed Math',
    desc: 'Rapid-fire mental arithmetic quiz challenge designed to test agility.',
    path: '/math-game.html',
    external: true,
    icon: FileText,
    color: '#ff758c',
    badge: 'Quiz Blitz',
  },
];

const Home = () => {
  return (
    <div className="glass-panel hub-container">
      {/* Hero Header */}
      <header className="hub-hero">
        <div className="hub-badge">
          <Sparkles size={14} />
          <span>Next-Gen Web Arcade Hub</span>
        </div>

        <h1 className="hub-title">React Nexus</h1>

        <p className="hub-tagline">
          Code &bull; Play &bull; Compete &mdash; An ultra-responsive collection of interactive
          browser games, featuring smart AI opponents, real-time physics, and global leaderboards.
        </p>

        <div className="hub-stats-strip">
          <span className="hub-stat-item">
            <Cpu size={14} color="#00f3ff" />
            <span><strong>9</strong> Games</span>
          </span>
          <span>&bull;</span>
          <span className="hub-stat-item">
            <Flame size={14} color="#ffd700" />
            <span>AI Opponents & PvP</span>
          </span>
          <span>&bull;</span>
          <span className="hub-stat-item">
            <Trophy size={14} color="#bc13fe" />
            <span>Cloud Leaderboards</span>
          </span>
        </div>
      </header>

      {/* 3x3 Responsive Game Grid */}
      <main className="hub-games-grid">
        {GAMES.map((game) => {
          const Icon = game.icon;
          const cardContent = (
            <div
              className="arcade-card"
              style={{
                borderColor: `${game.color}35`,
                boxShadow: `0 8px 30px rgba(0, 0, 0, 0.25)`,
              }}
            >
              {/* Radial glow background */}
              <div
                className="arcade-card-glow"
                style={{ backgroundColor: game.color }}
              />

              <div className="arcade-card-top">
                <div
                  className="arcade-card-icon-box"
                  style={{
                    backgroundColor: `${game.color}18`,
                    border: `1px solid ${game.color}50`,
                  }}
                >
                  <Icon size={24} color={game.color} />
                </div>
                <span
                  className="arcade-card-category"
                  style={{
                    color: game.color,
                    border: `1px solid ${game.color}40`,
                    background: `${game.color}12`,
                  }}
                >
                  {game.badge}
                </span>
              </div>

              <h3 className="arcade-card-title">{game.title}</h3>
              <p className="arcade-card-desc">{game.desc}</p>
            </div>
          );

          if (game.external) {
            return (
              <a
                key={game.id}
                href={game.path}
                className="arcade-card-link"
                title={`Launch ${game.title}`}
              >
                {cardContent}
              </a>
            );
          }

          return (
            <Link
              key={game.id}
              to={game.path}
              className="arcade-card-link"
              title={`Play ${game.title}`}
            >
              {cardContent}
            </Link>
          );
        })}
      </main>

      {/* Hub Footer */}
      <footer className="hub-footer">
        <div>
          <span>React Nexus v2.0 &bull; Built with React 19, Vite & Firebase</span>
        </div>
        <div className="hub-footer-links">
          <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Arcade Suite</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;