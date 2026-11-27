import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
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
  Trophy,
  Flame,
} from 'lucide-react';
import { SPRING_DEFAULT, SPRING_SHEET, TAP_DETENT, emitFeedback } from '../utils/fluidMotion';

const GAMES = [
  {
    id: 'tictactoe',
    title: 'Tic-Tac-Toe',
    group: 'strategy',
    badge: 'Strategy · AI & PvP',
    desc: 'Unbeatable Minimax engine paired with instant local 2-player matches.',
    path: '/game',
    icon: Gamepad2,
    color: '#38bdf8',
  },
  {
    id: 'chess',
    title: 'Chess Arena',
    group: 'strategy',
    badge: 'Strategy · Stockfish',
    desc: 'Full Stockfish engine opponent, rated clock modes, and cloud leaderboards.',
    path: '/chess',
    icon: Crown,
    color: '#fbbf24',
  },
  {
    id: 'neon2048',
    title: 'Neon 2048',
    group: 'arcade',
    badge: 'Arcade · Gesture',
    desc: 'Swipe-and-merge sliding number puzzle with physical spring momentum.',
    path: '/2048',
    icon: Grid,
    color: '#a3e635',
  },
  {
    id: 'snake',
    title: 'Snake Arena',
    group: 'arcade',
    badge: 'Arcade · Survival',
    desc: 'High-speed grid survival with continuous score multipliers.',
    path: '/snake',
    icon: Activity,
    color: '#34d399',
  },
  {
    id: 'typing',
    title: 'Terminal Typer',
    group: 'arcade',
    badge: 'Arcade · Speed',
    desc: 'Real-time code typing benchmark with live WPM and accuracy readouts.',
    path: '/type',
    icon: Keyboard,
    color: '#60a5fa',
  },
  {
    id: 'reaction',
    title: 'Reaction Test',
    group: 'arcade',
    badge: 'Reflex · Zero-Latency',
    desc: 'F1 lights-out reflex timer measured on pointer-down without click delay.',
    path: '/reaction',
    icon: Zap,
    color: '#f59e0b',
  },
  {
    id: 'memory',
    title: 'F1 Memory',
    group: 'f1',
    badge: 'Formula 1 · Pairs',
    desc: 'Physical 3D flip deck matching Formula 1 drivers against a move budget.',
    path: '/memory',
    icon: LayoutGrid,
    color: '#f87171',
  },
  {
    id: 'f1trivia',
    title: 'F1 Trivia',
    group: 'f1',
    badge: 'Formula 1 · Stats',
    desc: 'Higher-or-lower career points, pole positions, and championship records.',
    path: '/f1',
    icon: Flag,
    color: '#c084fc',
  },
  {
    id: 'paddockdle',
    title: 'PaddockDle F1',
    group: 'f1',
    badge: 'Formula 1 · Wordle',
    desc: 'Daily mystery driver deduction with telemetry attribute clues.',
    path: '/paddockdle',
    icon: Flame,
    color: '#ef4444',
  },
  {
    id: 'paddockdle-grid',
    title: 'Paddock Grid',
    group: 'f1',
    badge: 'Formula 1 · Matrix',
    desc: '3x3 Formula 1 Immaculate Grid matching constructors and records.',
    path: '/paddockdle-grid',
    icon: Grid,
    color: '#38bdf8',
  },
  {
    id: 'paddockdle-career',
    title: 'Paddock Career',
    group: 'f1',
    badge: 'Formula 1 · Timeline',
    desc: 'Chronological seat-by-seat progression clues to identify the driver.',
    path: '/paddockdle-career',
    icon: Trophy,
    color: '#fbbf24',
  },
  {
    id: 'math',
    title: 'Math Blitz',
    group: 'strategy',
    badge: 'Speed Math · Timed',
    desc: 'Rapid mental arithmetic rounds tuned for quick keyboard entry.',
    path: '/math-game.html',
    external: true,
    icon: FileText,
    color: '#fb7185',
  },
];

const SEGMENTS = [
  { id: 'all', label: 'All Games' },
  { id: 'arcade', label: 'Arcade' },
  { id: 'f1', label: 'Formula 1' },
  { id: 'strategy', label: 'Strategy' },
];

export default function Home() {
  const [segment, setSegment] = useState('all');

  const visibleGames = useMemo(() => {
    if (segment === 'all') return GAMES;
    return GAMES.filter((g) => g.group === segment);
  }, [segment]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING_DEFAULT}
      className="glass-panel hub-container"
    >
      <header className="hub-hero">
        <div className="hub-eyebrow tabular-nums">
          React Nexus · {GAMES.length} Interactive Games · Cloud Leaderboards
        </div>
        <h1 className="hub-title">React Nexus</h1>
        <p className="hub-tagline">
          Tactile browser arcade pairing deterministic game logic, direct pointer physics, and cloud score sync across desktop and mobile.
        </p>
      </header>

      <div className="hub-toolbar">
        <div className="segmented-control" role="tablist" aria-label="Game categories">
          {SEGMENTS.map((seg) => {
            const active = segment === seg.id;
            return (
              <button
                key={seg.id}
                type="button"
                role="tab"
                aria-selected={active}
                onPointerDown={() => {
                  setSegment(seg.id);
                  emitFeedback('tap');
                }}
                className={`segmented-btn ${active ? 'active' : ''}`}
              >
                {active && (
                  <motion.span
                    layoutId="hubSegment"
                    transition={SPRING_SHEET}
                    className="segmented-indicator"
                  />
                )}
                {seg.label}
              </button>
            );
          })}
        </div>

        <span className="hub-meta-count tabular-nums">
          {visibleGames.length} of {GAMES.length} titles
        </span>
      </div>

      <main className="hub-games-grid">
        {visibleGames.map((game) => {
          const Icon = game.icon;
          const cardBody = (
            <motion.div
              layout
              whileTap={TAP_DETENT}
              transition={SPRING_DEFAULT}
              onPointerDown={() => emitFeedback('tap')}
              className="arcade-card"
            >
              <div className="arcade-card-top">
                <div
                  className="arcade-card-icon-box"
                  style={{ borderColor: `${game.color}38` }}
                >
                  <Icon size={20} strokeWidth={1.75} color={game.color} />
                </div>
                <span className="arcade-card-category">{game.badge}</span>
              </div>

              <h3 className="arcade-card-title">{game.title}</h3>
              <p className="arcade-card-desc">{game.desc}</p>
            </motion.div>
          );

          if (game.external) {
            return (
              <a
                key={game.id}
                href={game.path}
                className="arcade-card-link"
                title={`Launch ${game.title}`}
              >
                {cardBody}
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
              {cardBody}
            </Link>
          );
        })}
      </main>

      <footer className="hub-footer">
        <span>React Nexus · Spring physics & Web Audio SFX</span>
        <span className="tabular-nums">Press M anytime to mute audio</span>
      </footer>
    </motion.div>
  );
}
