import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Trophy,
  RotateCcw,
  Share2,
  HelpCircle,
  BarChart2,
  ChevronUp,
  ChevronDown,
  Radio,
  X,
  Award,
  Clock,
  Infinity as InfinityIcon,
} from 'lucide-react';
import {
  F1_DRIVERS,
  getDailyDriver,
  getLocalDateKey,
  compareDrivers,
  generateShareGrid,
} from '../utils/f1PaddockData';
import { useSound } from '../context/SoundContext';
import PaddockNav from '../components/PaddockNav';
import { FlagIcon, TeamBadge } from '../components/PaddockEmblems';
import '../styles/paddockdle.css';

const MAX_GUESSES = 6;
const COLUMN_LABELS = ['DRIVER', 'NATIONALITY', 'TEAM', 'AGE', 'DEBUT', 'WINS'];

const F1PaddockClassic = () => {
  const { sound } = useSound();

  const [mode, setMode] = useState('daily');
  const [secretDriver, setSecretDriver] = useState(() => getDailyDriver());
  const [guesses, setGuesses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [copied, setCopied] = useState(false);

  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_f1_classic_stats');
      return saved
        ? JSON.parse(saved)
        : {
            played: 0,
            won: 0,
            streak: 0,
            maxStreak: 0,
            distribution: [0, 0, 0, 0, 0, 0],
          };
    } catch {
      return {
        played: 0,
        won: 0,
        streak: 0,
        maxStreak: 0,
        distribution: [0, 0, 0, 0, 0, 0],
      };
    }
  });

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (mode === 'daily') {
      const todayKey = `nexus_f1_classic_daily_${getLocalDateKey()}`;
      const savedDaily = localStorage.getItem(todayKey);
      if (savedDaily) {
        try {
          const parsed = JSON.parse(savedDaily);
          setGuesses(parsed.guesses || []);
          setIsWon(parsed.isWon || false);
          setIsGameOver(parsed.isGameOver || false);
        } catch {
          // ignore corrupted storage
        }
      }
    }
  }, [mode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (isDropdownOpen) setIsDropdownOpen(false);
      else if (showHelp) setShowHelp(false);
      else if (showStats) setShowStats(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDropdownOpen, showHelp, showStats]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const availableDrivers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return [];

    return F1_DRIVERS.filter((driver) => {
      const hasGuessed = guesses.some((g) => g.id === driver.id);
      if (hasGuessed) return false;

      return (
        driver.name.toLowerCase().includes(query) ||
        driver.code.toLowerCase().includes(query) ||
        driver.currentTeam.toLowerCase().includes(query) ||
        driver.nationality.toLowerCase().includes(query)
      );
    }).slice(0, 6);
  }, [searchQuery, guesses]);

  const saveDailyState = (currentGuesses, won, over) => {
    if (mode === 'daily') {
      const todayKey = `nexus_f1_classic_daily_${getLocalDateKey()}`;
      try {
        localStorage.setItem(
          todayKey,
          JSON.stringify({
            guesses: currentGuesses,
            isWon: won,
            isGameOver: over,
          })
        );
      } catch {
        // ignore storage quota errors
      }
    }
  };

  const updateEndGameStats = (won, guessCount) => {
    setStats((prev) => {
      const newStreak = won ? prev.streak + 1 : 0;
      const newMaxStreak = Math.max(prev.maxStreak, newStreak);
      const newDistribution = [...prev.distribution];
      if (won && guessCount >= 1 && guessCount <= MAX_GUESSES) {
        newDistribution[guessCount - 1] += 1;
      }

      const newStats = {
        played: prev.played + 1,
        won: prev.won + (won ? 1 : 0),
        streak: newStreak,
        maxStreak: newMaxStreak,
        distribution: newDistribution,
      };

      try {
        localStorage.setItem('nexus_f1_classic_stats', JSON.stringify(newStats));
      } catch {
        // ignore storage failures
      }
      return newStats;
    });
  };

  const handleMakeGuess = (driver) => {
    if (isGameOver || guesses.length >= MAX_GUESSES) return;

    sound?.playMove?.();
    const newGuesses = [...guesses, driver];
    setGuesses(newGuesses);
    setSearchQuery('');
    setIsDropdownOpen(false);

    const won = driver.id === secretDriver.id;

    if (won) {
      sound?.playSuccess?.();
      setIsWon(true);
      setIsGameOver(true);
      updateEndGameStats(true, newGuesses.length);
      saveDailyState(newGuesses, true, true);
    } else if (newGuesses.length >= MAX_GUESSES) {
      sound?.playGameOver?.();
      setIsWon(false);
      setIsGameOver(true);
      updateEndGameStats(false, newGuesses.length);
      saveDailyState(newGuesses, false, true);
    } else {
      saveDailyState(newGuesses, false, false);
    }
  };

  const handleRestartFreeplay = () => {
    sound?.playMove?.();
    const randomIndex = Math.floor(Math.random() * F1_DRIVERS.length);
    setSecretDriver(F1_DRIVERS[randomIndex]);
    setGuesses([]);
    setIsWon(false);
    setIsGameOver(false);
    setShowHint(false);
    setSearchQuery('');
  };

  const handleShare = () => {
    sound?.playBeep?.();
    const text = generateShareGrid(
      guesses,
      secretDriver,
      isWon,
      mode === 'daily' ? 'Daily' : 'Infinite'
    );
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const renderMetricTile = (field, label) => {
    const statusClass =
      field.status === 'exact'
        ? 'exact'
        : field.status === 'higher'
        ? 'higher'
        : 'lower';

    return (
      <div
        className={`paddock-tile ${statusClass}`}
        title={
          field.status === 'exact'
            ? `${label}: Exact match`
            : field.status === 'higher'
            ? `${label}: Target is higher than ${field.value}`
            : `${label}: Target is lower than ${field.value}`
        }
      >
        <span className="paddock-tile-num">{field.value}</span>
        {field.status === 'higher' && <ChevronUp size={14} strokeWidth={2.5} />}
        {field.status === 'lower' && <ChevronDown size={14} strokeWidth={2.5} />}
      </div>
    );
  };

  return (
    <div className="paddock-container">
      <PaddockNav activeTab="classic" onOpenStats={() => setShowStats(true)} />

      {/* Centered Compact Mode Selector */}
      <div className="paddock-mode-pill-wrap">
        <div className="paddock-mode-pill">
          <button
            type="button"
            onClick={() => {
              if (mode === 'daily') return;
              sound?.playMove?.();
              setMode('daily');
              setSecretDriver(getDailyDriver());
              setGuesses([]);
              setIsWon(false);
              setIsGameOver(false);
              setShowHint(false);
            }}
            className={`paddock-pill-btn ${mode === 'daily' ? 'active' : ''}`}
          >
            <Clock size={13} strokeWidth={2.2} />
            <span>Daily</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sound?.playMove?.();
              setMode('freeplay');
              handleRestartFreeplay();
            }}
            className={`paddock-pill-btn ${mode === 'freeplay' ? 'active' : ''}`}
          >
            <InfinityIcon size={13} strokeWidth={2.2} />
            <span>Infinite</span>
          </button>
        </div>
      </div>

      {/* Search Row */}
      <div className="paddock-search-row">
        <div className="paddock-search-box" ref={dropdownRef}>
          <Search size={16} className="paddock-search-icon" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            disabled={isGameOver}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder={
              isGameOver
                ? 'Game complete'
                : `Guess driver (${guesses.length}/${MAX_GUESSES})...`
            }
            className="paddock-search-input"
          />

          {!isGameOver && isDropdownOpen && availableDrivers.length > 0 && (
            <div className="paddock-dropdown">
              {availableDrivers.map((driver) => (
                <button
                  type="button"
                  key={driver.id}
                  onClick={() => handleMakeGuess(driver)}
                  className="paddock-dropdown-item"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FlagIcon country={driver.nationality} size={22} />
                    <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                      {driver.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#71717a' }}>
                    {driver.currentTeam}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="paddock-toolbar-icons">
          <button
            type="button"
            onClick={() => {
              sound?.playMove?.();
              setShowHelp(true);
            }}
            className="paddock-icon-btn"
            title="How to play"
            aria-label="How to play"
          >
            <HelpCircle size={17} strokeWidth={1.9} />
          </button>
          <button
            type="button"
            onClick={() => {
              sound?.playMove?.();
              setShowStats(true);
            }}
            className="paddock-icon-btn"
            title="View statistics"
            aria-label="View statistics"
          >
            <BarChart2 size={17} strokeWidth={1.9} />
          </button>
        </div>
      </div>

      {/* 6-Column Wordle Board */}
      <div className="paddock-board">
        <div className="paddock-board-headers">
          {COLUMN_LABELS.map((col) => (
            <div key={col} className="paddock-col-head">
              {col}
            </div>
          ))}
        </div>

        <div className="paddock-board-rows">
          {Array.from({ length: MAX_GUESSES }).map((_, rowIdx) => {
            const guess = guesses[rowIdx];

            if (!guess) {
              return (
                <div key={`empty-${rowIdx}`} className="paddock-board-row">
                  {COLUMN_LABELS.map((col) => (
                    <div key={`${rowIdx}-${col}`} className="paddock-tile empty" />
                  ))}
                </div>
              );
            }

            const comp = compareDrivers(guess, secretDriver);
            const teamClass =
              comp.team.status === 'exact'
                ? 'exact'
                : comp.team.status === 'partial'
                ? 'partial'
                : 'miss';

            return (
              <div key={guess.id} className="paddock-board-row">
                <div className="paddock-tile driver" title={guess.name}>
                  {guess.code}
                </div>
                <div
                  className={`paddock-tile ${
                    comp.nationality.status === 'exact' ? 'exact' : 'miss'
                  }`}
                  title={guess.nationality}
                >
                  <FlagIcon country={guess.nationality} size={32} />
                </div>
                <div className={`paddock-tile ${teamClass}`} title={guess.currentTeam}>
                  <TeamBadge team={guess.currentTeam} />
                </div>
                {renderMetricTile(comp.age, 'Age')}
                {renderMetricTile(comp.debutYear, 'Debut')}
                {renderMetricTile(comp.raceWins, 'Wins')}
              </div>
            );
          })}
        </div>
      </div>

      {/* Compact Color Key */}
      <div className="paddock-legend">
        <span className="paddock-legend-item">
          <span className="paddock-legend-dot" style={{ background: '#22c55e' }} />
          Exact
        </span>
        <span className="paddock-legend-item">
          <span className="paddock-legend-dot" style={{ background: '#fb923c' }} />
          Higher / Former Team
        </span>
        <span className="paddock-legend-item">
          <span className="paddock-legend-dot" style={{ background: '#c084fc' }} />
          Lower
        </span>
        <span className="paddock-legend-item">
          <span className="paddock-legend-dot" style={{ background: '#ef4444' }} />
          Miss
        </span>
      </div>

      {/* Pit Wall Radio Hint */}
      {!isGameOver && guesses.length >= 3 && (
        <div className="paddock-hint-card">
          <Radio size={15} style={{ color: '#fb923c', flexShrink: 0 }} />
          {!showHint ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>
                Radio clue unlocked
              </span>
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="paddock-pill-btn active"
                style={{ padding: '5px 12px', fontSize: '0.7rem' }}
              >
                Reveal Clue
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '0.82rem' }}>
              Team: <strong>{secretDriver.currentTeam}</strong> ({secretDriver.engine} power unit)
            </div>
          )}
        </div>
      )}

      {/* Game Over Banner */}
      {isGameOver && (
        <div className="paddock-banner">
          <Trophy size={28} color="#fbbf24" style={{ margin: '0 auto 8px', display: 'block' }} />
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              margin: '0 0 8px',
              color: isWon ? '#4ade80' : '#f87171',
            }}
          >
            {isWon ? `Solved in ${guesses.length}/${MAX_GUESSES}` : 'Out of guesses'}
          </h2>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px',
              fontSize: '0.9rem',
              color: '#e4e4e7',
            }}
          >
            <FlagIcon country={secretDriver.nationality} size={24} />
            <span>
              <strong>{secretDriver.name}</strong> ({secretDriver.currentTeam})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <button type="button" onClick={handleShare} className="paddock-share-btn">
              <Share2 size={14} />
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
            {mode === 'freeplay' && (
              <button
                type="button"
                onClick={handleRestartFreeplay}
                className="paddock-pill-btn"
                style={{ background: '#27272a', color: '#f4f4f5' }}
              >
                <RotateCcw size={14} />
                <span>Next Driver</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="paddock-modal-overlay">
          <div className="paddock-modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={18} color="#ff2400" />
                <span>How to play PaddockDle</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="paddock-icon-btn"
                style={{ width: '30px', height: '30px' }}
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ fontSize: '0.84rem', color: '#d4d4d8', lineHeight: 1.65 }}>
              <p style={{ marginTop: 0 }}>
                Guess the mystery Formula 1 driver within <strong>6 guesses</strong>.
              </p>
              <p>
                <strong style={{ color: '#4ade80' }}>Green:</strong> Exact match for nationality, team, age, debut year, or Grand Prix wins.
              </p>
              <p>
                <strong style={{ color: '#fb923c' }}>Orange:</strong> Driver previously raced for that team, or numeric target is <strong>higher</strong> (up arrow).
              </p>
              <p>
                <strong style={{ color: '#c084fc' }}>Purple:</strong> Numeric target is <strong>lower</strong> (down arrow).
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong style={{ color: '#f87171' }}>Red:</strong> Does not match.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="paddock-pill-btn active"
              style={{ width: '100%', marginTop: '18px', justifyContent: 'center', padding: '10px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStats && (
        <div className="paddock-modal-overlay">
          <div className="paddock-modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#fbbf24" />
                <span>Statistics</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowStats(false)}
                className="paddock-icon-btn"
                style={{ width: '30px', height: '30px' }}
              >
                <X size={14} />
              </button>
            </div>

            <div className="paddock-stats-grid">
              <div className="paddock-stat-box">
                <span className="paddock-stat-num">{stats.played}</span>
                <span className="paddock-stat-lbl">Played</span>
              </div>
              <div className="paddock-stat-box">
                <span className="paddock-stat-num" style={{ color: '#4ade80' }}>
                  {stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%
                </span>
                <span className="paddock-stat-lbl">Win %</span>
              </div>
              <div className="paddock-stat-box">
                <span className="paddock-stat-num" style={{ color: '#fb923c' }}>
                  {stats.streak}
                </span>
                <span className="paddock-stat-lbl">Streak</span>
              </div>
              <div className="paddock-stat-box">
                <span className="paddock-stat-num" style={{ color: '#c084fc' }}>
                  {stats.maxStreak}
                </span>
                <span className="paddock-stat-lbl">Best</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowStats(false)}
              className="paddock-pill-btn"
              style={{ width: '100%', justifyContent: 'center', padding: '10px', background: '#27272a', color: '#f4f4f5' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default F1PaddockClassic;
