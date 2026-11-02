import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Trophy,
  RotateCcw,
  Share2,
  HelpCircle,
  BarChart2,
  Check,
  ChevronUp,
  ChevronDown,
  Flag,
  Radio,
  X,
  Award,
  Calendar,
  Flame,
  Sparkles,
} from 'lucide-react';
import {
  F1_DRIVERS,
  getDailyDriver,
  compareDrivers,
  generateShareGrid,
} from '../utils/f1PaddockData';
import { useSound } from '../context/SoundContext';
import PaddockNav from '../components/PaddockNav';
import '../styles/paddockdle.css';

const MAX_GUESSES = 6;

const F1PaddockClassic = () => {
  const { sound } = useSound();

  // Game mode: 'daily' or 'freeplay'
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

  // Local storage stats
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

  // Load daily game progress if available
  useEffect(() => {
    if (mode === 'daily') {
      const todayKey = `nexus_f1_classic_daily_${new Date().toISOString().slice(0, 10)}`;
      const savedDaily = localStorage.getItem(todayKey);
      if (savedDaily) {
        try {
          const parsed = JSON.parse(savedDaily);
          setGuesses(parsed.guesses || []);
          setIsWon(parsed.isWon || false);
          setIsGameOver(parsed.isGameOver || false);
        } catch {
          // ignore
        }
      }
    }
  }, [mode]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter available drivers for autocomplete
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

  const saveDailyState = (currentGuesses, won, over) => {
    if (mode === 'daily') {
      const todayKey = `nexus_f1_classic_daily_${new Date().toISOString().slice(0, 10)}`;
      localStorage.setItem(
        todayKey,
        JSON.stringify({
          guesses: currentGuesses,
          isWon: won,
          isGameOver: over,
        })
      );
    }
  };

  const updateEndGameStats = (won, guessCount) => {
    setStats((prev) => {
      const newStreak = won ? prev.streak + 1 : 0;
      const newMaxStreak = Math.max(prev.maxStreak, newStreak);
      const newDistribution = [...prev.distribution];
      if (won && guessCount >= 1 && guessCount <= 6) {
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
        localStorage.setItem(
          'nexus_f1_classic_stats',
          JSON.stringify(newStats)
        );
      } catch {
        // ignore
      }
      return newStats;
    });
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
      mode === 'daily' ? 'Daily' : 'Practice'
    );
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Render comparison badge
  const renderBadge = (field, label) => {
    const isExact = field.status === 'exact';
    const isPartial = field.status === 'partial';
    const isHigher = field.status === 'higher';
    const isLower = field.status === 'lower';

    let statusClass = 'miss';
    if (isExact) statusClass = 'exact';
    else if (isPartial) statusClass = 'partial';

    return (
      <div className={`paddock-badge ${statusClass}`}>
        <span className="badge-label">{label}</span>
        <span className="badge-val">
          {field.value}
          {isHigher && <ChevronUp size={14} color="#00f3ff" />}
          {isLower && <ChevronDown size={14} color="#ff4757" />}
        </span>
      </div>
    );
  };

  return (
    <div className="paddock-container">
      {/* PaddockDle Shared Nav */}
      <PaddockNav activeTab="classic" />

      {/* Hero Title */}
      <div className="paddock-hero">
        <h1>
          <span>PADDOCK</span>
          <span className="brand-red">DLE</span>
        </h1>
        <p>Formula 1 Mystery Driver Guesser</p>
      </div>

      {/* Controls Bar */}
      <div className="paddock-controls-bar">
        <div className="paddock-mode-toggle">
          <button
            onClick={() => {
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
            <Calendar size={13} />
            <span>Daily Grand Prix</span>
          </button>
          <button
            onClick={() => {
              sound?.playMove?.();
              setMode('freeplay');
              handleRestartFreeplay();
            }}
            className={`paddock-pill-btn ${mode === 'freeplay' ? 'active' : ''}`}
          >
            <Sparkles size={13} />
            <span>Infinite Paddock</span>
          </button>
        </div>

        <div className="paddock-actions">
          <button
            onClick={() => {
              sound?.playMove?.();
              setShowHelp(true);
            }}
            className="paddock-icon-btn"
            title="How to play"
          >
            <HelpCircle size={16} />
          </button>
          <button
            onClick={() => {
              sound?.playMove?.();
              setShowStats(true);
            }}
            className="paddock-icon-btn"
            title="View Statistics"
          >
            <BarChart2 size={16} />
          </button>
          {isGameOver && (
            <button onClick={handleShare} className="paddock-share-btn">
              <Share2 size={14} />
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Input Area */}
      {!isGameOver && (
        <div className="paddock-search-box" ref={dropdownRef}>
          <Search size={16} className="paddock-search-icon" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder={`Guess ${guesses.length + 1} of ${MAX_GUESSES}: Type driver or team...`}
            className="paddock-search-input"
          />

          {isDropdownOpen && availableDrivers.length > 0 && (
            <div className="paddock-dropdown">
              {availableDrivers.map((driver) => (
                <button
                  key={driver.id}
                  onClick={() => handleMakeGuess(driver)}
                  className="paddock-dropdown-item"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.25rem' }}>{driver.flag}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                        {driver.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
                        {driver.currentTeam} • Code: {driver.code} (#{driver.number})
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pit Wall Radio Hint */}
      {!isGameOver && guesses.length >= 3 && (
        <div className="paddock-hint-card">
          <Radio size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
          {!showHint ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ fontSize: '0.8rem' }}>Pit Wall Radio Telemetry ready!</span>
              <button
                onClick={() => setShowHint(true)}
                style={{
                  background: '#f59e0b',
                  color: '#000',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                Listen to Radio Clue
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem' }}>
              <strong>Radio Clue:</strong> This driver currently represents{' '}
              <strong>{secretDriver.currentTeam}</strong> ({secretDriver.engine} engine).
            </div>
          )}
        </div>
      )}

      {/* Game Over Banner */}
      {isGameOver && (
        <div className="paddock-banner">
          <Trophy size={36} color="#ffd700" style={{ margin: '0 auto 8px', display: 'block' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 6px', color: isWon ? '#34d399' : '#ff4757' }}>
            {isWon ? 'P1 FINISH! CHECKERED FLAG!' : 'DNF - OUT OF GUESSES'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', margin: '0 0 16px' }}>
            {isWon
              ? `You identified ${secretDriver.flag} ${secretDriver.name} in ${guesses.length} attempts!`
              : `The secret driver was ${secretDriver.flag} ${secretDriver.name} (${secretDriver.currentTeam}).`}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <button onClick={handleShare} className="paddock-share-btn">
              <Share2 size={14} />
              <span>{copied ? 'Copied to Clipboard!' : 'Share Telemetry'}</span>
            </button>
            {mode === 'freeplay' && (
              <button
                onClick={handleRestartFreeplay}
                className="paddock-pill-btn"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                <RotateCcw size={14} />
                <span>Next Driver</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Guess Telemetry Board */}
      <div className="paddock-guess-list">
        {guesses.length > 0 ? (
          guesses.map((guess, idx) => {
            const comp = compareDrivers(guess, secretDriver);
            return (
              <div key={idx} className="paddock-guess-row">
                <div className="paddock-badge" style={{ minWidth: '90px' }}>
                  <span className="badge-label">Driver</span>
                  <span className="badge-val">
                    {guess.flag} {guess.code}
                  </span>
                </div>
                {renderBadge(comp.nationality, 'Country')}
                {renderBadge(comp.team, 'Team')}
                {renderBadge(comp.engine, 'Engine')}
                {renderBadge(comp.championships, 'Titles')}
                {renderBadge(comp.podiums, 'Podiums')}
                {renderBadge(comp.debutYear, 'Debut')}
                {renderBadge(comp.age, 'Age')}
              </div>
            );
          })
        ) : (
          <div className="paddock-empty-state">
            <Flag size={24} style={{ opacity: 0.5 }} />
            <span style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}>
              No telemetry yet. Search and select an F1 driver above to begin!
            </span>
          </div>
        )}
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="paddock-modal-overlay">
          <div className="paddock-modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={18} color="#e10600" />
                <span>How to Play PaddockDle</span>
              </h3>
              <button
                onClick={() => setShowHelp(false)}
                className="paddock-icon-btn"
                style={{ width: '28px', height: '28px' }}
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
              <p>🎯 Guess the secret Formula 1 driver in <strong>6 guesses</strong>.</p>
              <p>🟩 <strong>Green:</strong> Exact match on nationality, team, engine, podiums, titles, or debut.</p>
              <p>🟨 <strong>Yellow:</strong> Partial match (the driver raced for this team in their career).</p>
              <p>⬆️ / ⬇️ <strong>Arrows:</strong> Stat is higher or lower than your guess.</p>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="paddock-pill-btn active"
              style={{ width: '100%', marginTop: '16px', justifyContent: 'center', padding: '10px' }}
            >
              Back to Track
            </button>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStats && (
        <div className="paddock-modal-overlay">
          <div className="paddock-modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#ffd700" />
                <span>Career Telemetry Stats</span>
              </h3>
              <button
                onClick={() => setShowStats(false)}
                className="paddock-icon-btn"
                style={{ width: '28px', height: '28px' }}
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
                <span className="paddock-stat-num" style={{ color: '#34d399' }}>
                  {stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%
                </span>
                <span className="paddock-stat-lbl">Win %</span>
              </div>
              <div className="paddock-stat-box">
                <span className="paddock-stat-num" style={{ color: '#f59e0b' }}>
                  {stats.streak}
                </span>
                <span className="paddock-stat-lbl">Streak</span>
              </div>
              <div className="paddock-stat-box">
                <span className="paddock-stat-num" style={{ color: '#60a5fa' }}>
                  {stats.maxStreak}
                </span>
                <span className="paddock-stat-lbl">Max Streak</span>
              </div>
            </div>

            <button
              onClick={() => setShowStats(false)}
              className="paddock-pill-btn"
              style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
            >
              Close Telemetry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default F1PaddockClassic;
