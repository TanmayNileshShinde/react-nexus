import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Trophy,
  RotateCcw,
  Share2,
  HelpCircle,
  BarChart2,
  Calendar,
  Sparkles,
  Lock,
  Eye,
  Heart,
  X,
} from 'lucide-react';
import PaddockNav from '../components/PaddockNav';
import {
  F1_DRIVERS,
  getDailyCareerDriver,
  getRandomCareerDriver,
  generateCareerClues,
  generateCareerShareText,
} from '../utils/f1PaddockData';
import { useSound } from '../context/SoundContext';
import '../styles/paddockdle.css';

const MAX_STEPS = 5;

const F1PaddockCareer = () => {
  const { sound } = useSound();

  const [mode, setMode] = useState('daily');
  const [secretDriver, setSecretDriver] = useState(() => getDailyCareerDriver());
  const [currentStep, setCurrentStep] = useState(1);
  const [guesses, setGuesses] = useState([]);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [copied, setCopied] = useState(false);

  const searchInputRef = useRef(null);

  const clues = useMemo(() => {
    return generateCareerClues(secretDriver);
  }, [secretDriver]);

  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_f1_career_stats');
      return saved
        ? JSON.parse(saved)
        : { played: 0, wins: 0, totalScore: 0, currentStreak: 0, maxStreak: 0 };
    } catch {
      return { played: 0, wins: 0, totalScore: 0, currentStreak: 0, maxStreak: 0 };
    }
  });

  useEffect(() => {
    if (mode === 'daily') {
      const todayKey = `nexus_f1_career_daily_${new Date().toISOString().slice(0, 10)}`;
      const savedDaily = localStorage.getItem(todayKey);
      if (savedDaily) {
        try {
          const parsed = JSON.parse(savedDaily);
          setCurrentStep(parsed.currentStep || 1);
          setGuesses(parsed.guesses || []);
          setIsWon(parsed.isWon || false);
          setIsGameOver(parsed.isGameOver || false);
        } catch {
          // ignore
        }
      }
    }
  }, [mode]);

  const filteredDrivers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return F1_DRIVERS.filter((d) => {
      if (guesses.some((g) => g.driver.id === d.id)) return false;
      return (
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.currentTeam.toLowerCase().includes(q)
      );
    }).slice(0, 6);
  }, [searchQuery, guesses]);

  const handleGuess = (driver) => {
    if (isGameOver) return;

    const isMatch = driver.id === secretDriver.id;
    const newGuesses = [
      ...guesses,
      { driver, step: currentStep, isCorrect: isMatch },
    ];
    setGuesses(newGuesses);
    setSearchQuery('');
    setIsDropdownOpen(false);

    if (isMatch) {
      sound?.playSuccess?.();
      setIsWon(true);
      setIsGameOver(true);
      updateEndStats(true, currentStep);

      if (mode === 'daily') {
        const todayKey = `nexus_f1_career_daily_${new Date().toISOString().slice(0, 10)}`;
        localStorage.setItem(
          todayKey,
          JSON.stringify({
            currentStep,
            guesses: newGuesses,
            isWon: true,
            isGameOver: true,
          })
        );
      }
    } else {
      sound?.playGameOver?.();
      if (currentStep >= MAX_STEPS) {
        setIsGameOver(true);
        updateEndStats(false, currentStep);

        if (mode === 'daily') {
          const todayKey = `nexus_f1_career_daily_${new Date().toISOString().slice(0, 10)}`;
          localStorage.setItem(
            todayKey,
            JSON.stringify({
              currentStep,
              guesses: newGuesses,
              isWon: false,
              isGameOver: true,
            })
          );
        }
      } else {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);

        if (mode === 'daily') {
          const todayKey = `nexus_f1_career_daily_${new Date().toISOString().slice(0, 10)}`;
          localStorage.setItem(
            todayKey,
            JSON.stringify({
              currentStep: nextStep,
              guesses: newGuesses,
              isWon: false,
              isGameOver: false,
            })
          );
        }
      }
    }
  };

  const handleRevealClue = () => {
    if (currentStep >= MAX_STEPS || isGameOver) return;
    sound?.playMove?.();
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);

    if (mode === 'daily') {
      const todayKey = `nexus_f1_career_daily_${new Date().toISOString().slice(0, 10)}`;
      localStorage.setItem(
        todayKey,
        JSON.stringify({
          currentStep: nextStep,
          guesses,
          isWon: false,
          isGameOver: false,
        })
      );
    }
  };

  const updateEndStats = (won, step) => {
    const score = won ? (6 - step) * 200 : 0;
    setStats((prev) => {
      const newStreak = won ? prev.currentStreak + 1 : 0;
      const updated = {
        played: prev.played + 1,
        wins: prev.wins + (won ? 1 : 0),
        totalScore: prev.totalScore + score,
        currentStreak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
      };
      try {
        localStorage.setItem('nexus_f1_career_stats', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleResetGame = () => {
    sound?.playMove?.();
    const newDriver = getRandomCareerDriver();
    setSecretDriver(newDriver);
    setCurrentStep(1);
    setGuesses([]);
    setIsWon(false);
    setIsGameOver(false);
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const handleShare = () => {
    sound?.playBeep?.();
    const text = generateCareerShareText(
      secretDriver,
      currentStep,
      isWon,
      mode === 'daily' ? 'Daily' : 'Practice'
    );
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const currentScore = isWon ? (6 - currentStep) * 200 : 0;

  return (
    <div className="paddock-container">
      <PaddockNav activeTab="career" />

      {/* Hero Title */}
      <div className="paddock-hero">
        <h1>
          <span>PADDOCK</span>
          <span className="brand-red">CAREER</span>
        </h1>
        <p>Formula 1 Career Progression & Timeline Guesser</p>
      </div>

      {/* Controls Bar */}
      <div className="paddock-controls-bar">
        <div className="paddock-mode-toggle">
          <button
            onClick={() => {
              if (mode !== 'daily') {
                sound?.playMove?.();
                setMode('daily');
                setSecretDriver(getDailyCareerDriver());
                setCurrentStep(1);
                setGuesses([]);
                setIsWon(false);
                setIsGameOver(false);
              }
            }}
            className={`paddock-pill-btn ${mode === 'daily' ? 'active' : ''}`}
          >
            <Calendar size={13} />
            <span>Daily Driver</span>
          </button>
          <button
            onClick={() => {
              if (mode !== 'freeplay') {
                sound?.playMove?.();
                setMode('freeplay');
                handleResetGame();
              }
            }}
            className={`paddock-pill-btn ${mode === 'freeplay' ? 'active' : ''}`}
          >
            <Sparkles size={13} />
            <span>Practice Mode</span>
          </button>
        </div>

        {/* Clue & Hearts Tracker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.82rem', fontFamily: 'monospace' }}>
          <div>
            Clue: <strong style={{ color: '#ffd700' }}>{currentStep}/{MAX_STEPS}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Heart
                key={s}
                size={14}
                style={{
                  color: s <= (MAX_STEPS - (guesses.length || 0)) ? '#ef4444' : 'rgba(255,255,255,0.2)',
                  fill: s <= (MAX_STEPS - (guesses.length || 0)) ? '#ef4444' : 'transparent',
                }}
              />
            ))}
          </div>
        </div>

        <div className="paddock-actions">
          {mode === 'freeplay' && (
            <button onClick={handleResetGame} className="paddock-icon-btn" title="New Driver">
              <RotateCcw size={14} />
            </button>
          )}
          <button onClick={() => setShowHelp(true)} className="paddock-icon-btn" title="How to play">
            <HelpCircle size={14} />
          </button>
          <button onClick={() => setShowStats(true)} className="paddock-icon-btn" title="View Stats">
            <BarChart2 size={14} />
          </button>
          {isGameOver && (
            <button onClick={handleShare} className="paddock-share-btn">
              <Share2 size={13} />
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Clues Timeline Stack */}
      <div className="paddock-career-stack">
        {clues.map((clue, idx) => {
          const stepNum = idx + 1;
          const isRevealed = stepNum <= currentStep || isGameOver;
          const isCurrent = stepNum === currentStep && !isGameOver;

          return (
            <div
              key={clue.step}
              className={`paddock-clue-card ${isCurrent ? 'active' : ''} ${!isRevealed ? 'locked' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="paddock-step-badge">
                  {stepNum}
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                    {clue.title}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px' }}>
                    {isRevealed ? clue.value : '••••••••••••••••••••••••'}
                  </div>
                </div>
              </div>

              {!isRevealed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                  <Lock size={14} />
                  <span>Locked</span>
                </div>
              ) : (
                <div style={{ fontSize: '0.72rem', color: '#34d399', background: 'rgba(16,185,129,0.15)', padding: '3px 8px', borderRadius: '6px', fontFamily: 'monospace' }}>
                  {clue.hint}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Guess Input & Controls */}
      {!isGameOver ? (
        <div style={{ width: '100%', maxWidth: '580px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="paddock-search-box" style={{ maxWidth: '100%', margin: 0 }}>
            <Search size={16} className="paddock-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Type driver name (e.g. Hamilton, Vettel, Alonso)..."
              className="paddock-search-input"
            />

            {isDropdownOpen && filteredDrivers.length > 0 && (
              <div className="paddock-dropdown">
                {filteredDrivers.map((driver) => (
                  <button
                    key={driver.id}
                    onClick={() => handleGuess(driver)}
                    className="paddock-dropdown-item"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.25rem' }}>{driver.flag}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{driver.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
                          {driver.currentTeam} • #{driver.number}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {currentStep < MAX_STEPS && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleRevealClue}
                className="paddock-pill-btn"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <Eye size={14} />
                <span>Reveal Next Clue (-200 pts)</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Game Over Banner */
        <div className="paddock-banner">
          <Trophy size={36} color="#ffd700" style={{ margin: '0 auto 8px', display: 'block' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 6px', color: isWon ? '#34d399' : '#ff4757' }}>
            {isWon ? 'Career Decoded!' : 'Out of Clues (DNF)'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', margin: '0 0 16px' }}>
            {isWon
              ? `Telemetry decoded! You identified the driver on Clue ${currentStep}/${MAX_STEPS}!`
              : 'End of telemetry stream. Secret driver identity revealed below.'}
          </p>

          {/* Driver identity */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              padding: '12px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.05)',
              marginBottom: '16px',
            }}
          >
            <span style={{ fontSize: '2.5rem' }}>{secretDriver.flag}</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{secretDriver.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>
                {secretDriver.currentTeam} • Code: {secretDriver.code} (#{secretDriver.number})
              </div>
              <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700, marginTop: '2px' }}>
                Score: {currentScore} points
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <button onClick={handleShare} className="paddock-share-btn">
              <Share2 size={14} />
              <span>{copied ? 'Copied to Clipboard!' : 'Share Telemetry'}</span>
            </button>
            {mode === 'freeplay' && (
              <button
                onClick={handleResetGame}
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

      {/* Previous Guesses Log */}
      {guesses.length > 0 && (
        <div style={{ width: '100%', maxWidth: '580px', marginTop: '20px' }}>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: '8px' }}>
            Previous Attempts ({guesses.length}/{MAX_STEPS})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {guesses.map((g, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  background: g.isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)',
                  border: `1px solid ${g.isCorrect ? '#10b981' : 'rgba(239,68,68,0.3)'}`,
                  color: g.isCorrect ? '#6ee7b7' : '#fca5a5',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{g.driver.flag}</span>
                  <span>{g.driver.name}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.6, fontFamily: 'monospace' }}>(Clue {g.step})</span>
                </div>
                <span>{g.isCorrect ? '✅ Solved' : '❌ Miss'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How to Play Modal */}
      {showHelp && (
        <div className="paddock-modal-overlay">
          <div className="paddock-modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={18} color="#e10600" />
                <span>How to Play Career Timeline</span>
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
              <p>🎯 <strong>Objective:</strong> Guess the secret driver using minimal clues.</p>
              <p>⏱️ <strong>Clues:</strong> Reveal debut team, career path, nationality, stats & code.</p>
              <p>⚡ <strong>Scoring:</strong> Guessing on Clue 1 awards <strong>1,000 pts</strong>! Each extra clue deducts 200 pts.</p>
              <p>💔 <strong>Hearts:</strong> 5 maximum attempts before a DNF.</p>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="paddock-pill-btn active"
              style={{ width: '100%', marginTop: '16px', justifyContent: 'center', padding: '10px' }}
            >
              Start Guessing
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
                <BarChart2 size={18} color="#ffd700" />
                <span>Career Guesser Stats</span>
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
                <span className="paddock-stat-num" style={{ color: '#34d399' }}>{stats.wins}</span>
                <span className="paddock-stat-lbl">Wins</span>
              </div>
              <div className="paddock-stat-box">
                <span className="paddock-stat-num" style={{ color: '#f59e0b' }}>{stats.currentStreak}</span>
                <span className="paddock-stat-lbl">Streak</span>
              </div>
              <div className="paddock-stat-box">
                <span className="paddock-stat-num" style={{ color: '#60a5fa' }}>{stats.totalScore}</span>
                <span className="paddock-stat-lbl">Score</span>
              </div>
            </div>

            <button
              onClick={() => setShowStats(false)}
              className="paddock-pill-btn"
              style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
            >
              Close Stats
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default F1PaddockCareer;
