import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  RotateCcw,
  Share2,
  HelpCircle,
  BarChart2,
  Check,
  X,
  Flame,
  Calendar,
  Sparkles,
  AlertCircle,
  Search,
  Trophy,
} from 'lucide-react';
import PaddockNav from '../components/PaddockNav';
import { FlagIcon } from '../components/PaddockEmblems';
import {
  F1_DRIVERS,
  GRID_CATEGORIES,
  getDailyGrid,
  getRandomGrid,
  validateDriverForCell,
  generateGridShareText,
  getLocalDateKey,
} from '../utils/f1PaddockData';
import { useSound } from '../context/SoundContext';
import '../styles/paddockdle.css';

const MAX_GUESSES = 9;

const F1PaddockGrid = () => {
  const { sound } = useSound();

  const [mode, setMode] = useState('daily');
  const [activeGrid, setActiveGrid] = useState(() => getDailyGrid());
  const [solvedCells, setSolvedCells] = useState({});
  const [guessesLeft, setGuessesLeft] = useState(MAX_GUESSES);
  const [usedDriverIds, setUsedDriverIds] = useState(new Set());

  const [selectedCell, setSelectedCell] = useState(null); // { r, c }
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchInputRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);
  const isSubmittingRef = useRef(false);

  const clearFeedbackTimer = () => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
    isSubmittingRef.current = false;
    setIsSubmitting(false);
  };

  useEffect(() => () => clearFeedbackTimer(), []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (selectedCell) {
        clearFeedbackTimer();
        setSelectedCell(null);
        setFeedback(null);
      } else if (showHelp) {
        setShowHelp(false);
      } else if (showStats) {
        setShowStats(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, showHelp, showStats]);

  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_f1_grid_stats');
      return saved
        ? JSON.parse(saved)
        : { played: 0, perfectWins: 0, totalSolved: 0, currentStreak: 0, maxStreak: 0 };
    } catch {
      return { played: 0, perfectWins: 0, totalSolved: 0, currentStreak: 0, maxStreak: 0 };
    }
  });

  useEffect(() => {
    if (mode === 'daily') {
      const todayKey = `nexus_f1_grid_daily_${getLocalDateKey()}`;
      const savedDaily = localStorage.getItem(todayKey);
      if (savedDaily) {
        try {
          const parsed = JSON.parse(savedDaily);
          setSolvedCells(parsed.solvedCells || {});
          setGuessesLeft(parsed.guessesLeft ?? MAX_GUESSES);
          setUsedDriverIds(new Set(parsed.usedDriverIds || []));
          setIsGameOver(parsed.isGameOver || false);
        } catch {
          // ignore
        }
      }
    }
  }, [mode]);

  useEffect(() => {
    if (selectedCell && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [selectedCell]);

  const filteredDrivers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return F1_DRIVERS.filter((d) => {
      if (usedDriverIds.has(d.id)) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.currentTeam.toLowerCase().includes(q) ||
        d.nationality.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, usedDriverIds]);

  const solvedCount = Object.keys(solvedCells).length;

  const handleCellClick = (r, c) => {
    if (isGameOver || isSubmittingRef.current) return;
    const key = `${r}-${c}`;
    if (solvedCells[key]) return;
    if (guessesLeft <= 0) return;

    sound?.playMove?.();
    setSelectedCell({ r, c });
    setSearchQuery('');
    setFeedback(null);
  };

  const handleSelectDriver = (driver) => {
    if (!selectedCell || isGameOver || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const { r, c } = selectedCell;
    const cellKey = `${r}-${c}`;

    const rowCategoryKey = activeGrid.rows[r];
    const colCategoryKey = activeGrid.cols[c];
    const rowCategory = GRID_CATEGORIES[rowCategoryKey];
    const colCategory = GRID_CATEGORIES[colCategoryKey];

    const isValid = validateDriverForCell(driver, rowCategoryKey, colCategoryKey);
    const newGuessesLeft = guessesLeft - 1;
    setGuessesLeft(newGuessesLeft);

    if (isValid) {
      sound?.playSuccess?.();
      const updatedCells = { ...solvedCells, [cellKey]: driver };
      const updatedUsedIds = new Set(usedDriverIds).add(driver.id);
      setSolvedCells(updatedCells);
      setUsedDriverIds(updatedUsedIds);

      setFeedback({
        type: 'success',
        text: `Match! ${driver.name} satisfies ${rowCategory.label} & ${colCategory.label}!`,
      });

      const newSolvedCount = Object.keys(updatedCells).length;
      const gameFinished = newSolvedCount === 9 || newGuessesLeft <= 0;

      if (gameFinished) {
        setIsGameOver(true);
        updateEndStats(newSolvedCount === 9, newSolvedCount);
      }

      if (mode === 'daily') {
        const todayKey = `nexus_f1_grid_daily_${getLocalDateKey()}`;
        try {
          localStorage.setItem(
            todayKey,
            JSON.stringify({
              solvedCells: updatedCells,
              guessesLeft: newGuessesLeft,
              usedDriverIds: Array.from(updatedUsedIds),
              isGameOver: gameFinished,
            })
          );
        } catch {
          // ignore storage quota errors
        }
      }

      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = setTimeout(() => {
        feedbackTimeoutRef.current = null;
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        setSelectedCell(null);
        setFeedback(null);
      }, 700);
    } else {
      sound?.playGameOver?.();
      setFeedback({
        type: 'error',
        text: `Miss! ${driver.name} did not match both criteria.`,
      });

      if (newGuessesLeft <= 0) {
        setIsGameOver(true);
        updateEndStats(false, solvedCount);
      }

      if (mode === 'daily') {
        const todayKey = `nexus_f1_grid_daily_${getLocalDateKey()}`;
        try {
          localStorage.setItem(
            todayKey,
            JSON.stringify({
              solvedCells,
              guessesLeft: newGuessesLeft,
              usedDriverIds: Array.from(usedDriverIds),
              isGameOver: newGuessesLeft <= 0,
            })
          );
        } catch {
          // ignore storage quota errors
        }
      }

      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = setTimeout(() => {
        feedbackTimeoutRef.current = null;
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        setSelectedCell(null);
        setFeedback(null);
      }, 1000);
    }
  };

  const updateEndStats = (isPerfect, totalSolved) => {
    setStats((prev) => {
      const newStreak = isPerfect ? prev.currentStreak + 1 : 0;
      const updated = {
        played: prev.played + 1,
        perfectWins: prev.perfectWins + (isPerfect ? 1 : 0),
        totalSolved: prev.totalSolved + totalSolved,
        currentStreak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
      };
      try {
        localStorage.setItem('nexus_f1_grid_stats', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleResetGame = () => {
    clearFeedbackTimer();
    sound?.playMove?.();
    const newGrid = getRandomGrid();
    setActiveGrid(newGrid);
    setSolvedCells({});
    setGuessesLeft(MAX_GUESSES);
    setUsedDriverIds(new Set());
    setIsGameOver(false);
    setSelectedCell(null);
    setFeedback(null);
  };

  const handleShare = async () => {
    sound?.playBeep?.();
    const text = generateGridShareText(
      solvedCells,
      solvedCount,
      mode === 'daily' ? 'Daily' : 'Practice'
    );
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Ignore clipboard permission errors
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="paddock-container">
      <PaddockNav activeTab="grid" onOpenStats={() => setShowStats(true)} />

      {/* Mode Switcher & Compact Telemetry Bar */}
      <div className="paddock-mode-pill-wrap">
        <div className="paddock-mode-pill">
          <button
            type="button"
            onClick={() => {
              if (mode !== 'daily') {
                sound?.playMove?.();
                setMode('daily');
                setActiveGrid(getDailyGrid());
                setSolvedCells({});
                setGuessesLeft(MAX_GUESSES);
                setUsedDriverIds(new Set());
                setIsGameOver(false);
              }
            }}
            className={`paddock-pill-btn ${mode === 'daily' ? 'active' : ''}`}
          >
            <Calendar size={13} />
            <span>Daily Grid</span>
          </button>
          <button
            type="button"
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
            <span>Unlimited</span>
          </button>
        </div>

        <div className="paddock-substatus-strip">
          <span>
            Solved <strong style={{ color: '#4ade80' }}>{solvedCount}/9</strong>
          </span>
          <span>
            Left <strong style={{ color: guessesLeft <= 2 ? '#f87171' : '#f4f4f5' }}>{guessesLeft}</strong>
          </span>
          <div className="paddock-toolbar-icons">
            {mode === 'freeplay' && (
              <button type="button" onClick={handleResetGame} className="paddock-icon-btn" title="New Grid" style={{ width: '32px', height: '32px' }}>
                <RotateCcw size={14} />
              </button>
            )}
            <button type="button" onClick={() => setShowHelp(true)} className="paddock-icon-btn" title="How to play" style={{ width: '32px', height: '32px' }}>
              <HelpCircle size={15} />
            </button>
            <button type="button" onClick={() => setShowStats(true)} className="paddock-icon-btn" title="View Stats" style={{ width: '32px', height: '32px' }}>
              <BarChart2 size={15} />
            </button>
            {(isGameOver || solvedCount > 0) && (
              <button type="button" onClick={handleShare} className="paddock-share-btn" style={{ padding: '6px 12px' }}>
                <Share2 size={13} />
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3x3 Grid Board */}
      <div className="paddock-grid-card">
        <div className="paddock-grid-matrix">
          {/* Top-left corner */}
          <div className="paddock-grid-header">
            <Flame size={20} color="#e10600" />
            <span className="header-tag">3×3 GRID</span>
          </div>

          {/* Column Headers */}
          {activeGrid.cols.map((colKey, colIdx) => {
            const cat = GRID_CATEGORIES[colKey];
            return (
              <div
                key={`col-${colIdx}`}
                className="paddock-grid-header"
                style={{ borderTop: `3px solid ${cat.color}` }}
              >
                {cat.type === 'nationality' ? (
                  <FlagIcon country={cat.badge} size={20} />
                ) : (
                  <span className="header-tag">COL {colIdx + 1}</span>
                )}
                <span className="header-label">{cat.label}</span>
              </div>
            );
          })}

          {/* Rows & Cells */}
          {activeGrid.rows.map((rowKey, rowIdx) => {
            const rowCat = GRID_CATEGORIES[rowKey];
            return (
              <React.Fragment key={`row-${rowIdx}`}>
                {/* Row Header */}
                <div
                  className="paddock-grid-header"
                  style={{ borderLeft: `3px solid ${rowCat.color}` }}
                >
                  {rowCat.type === 'nationality' ? (
                    <FlagIcon country={rowCat.badge} size={20} />
                  ) : (
                    <span className="header-tag">ROW {rowIdx + 1}</span>
                  )}
                  <span className="header-label">{rowCat.label}</span>
                </div>

                {/* 3 Cells */}
                {[0, 1, 2].map((colIdx) => {
                  const cellKey = `${rowIdx}-${colIdx}`;
                  const driver = solvedCells[cellKey];

                  return (
                    <button
                      key={cellKey}
                      onClick={() => handleCellClick(rowIdx, colIdx)}
                      disabled={!!driver || isGameOver}
                      className={`paddock-grid-cell ${driver ? 'solved' : ''}`}
                    >
                      {driver ? (
                        <>
                          <FlagIcon country={driver.nationality} size={24} />
                          <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#4ade80' }}>
                            {driver.name}
                          </span>
                          <span style={{ fontSize: '0.64rem', fontFamily: 'monospace', color: 'rgba(244,244,245,0.72)' }}>
                            #{driver.number} · {driver.code}
                          </span>
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span>
                          <span style={{ fontSize: '0.65rem', fontFamily: 'monospace' }}>SELECT</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Game Over Banner */}
      {isGameOver && (
        <div className="paddock-banner">
          <Trophy size={36} color="#ffd700" style={{ margin: '0 auto 8px', display: 'block' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 6px' }}>
            {solvedCount === 9 ? '🏆 Immaculate Grid Master!' : `Grid Finished: ${solvedCount}/9 Solved`}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', margin: '0 0 16px' }}>
            {solvedCount === 9
              ? 'Flawless driving! You completed all 9 intersections across the grid.'
              : `Great session! You matched ${solvedCount} out of 9 driver intersections.`}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <button onClick={handleShare} className="paddock-share-btn">
              <Share2 size={14} />
              <span>{copied ? 'Copied to Clipboard!' : 'Share Grid'}</span>
            </button>
            {mode === 'freeplay' && (
              <button
                onClick={handleResetGame}
                className="paddock-pill-btn"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                <RotateCcw size={14} />
                <span>Next Grid</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Driver Selection Modal */}
      {selectedCell && (
        <div className="paddock-modal-overlay">
          <div className="paddock-modal-content" style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
                  Intersection Cell R{selectedCell.r + 1} × C{selectedCell.c + 1}
                </span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '2px 0 0' }}>
                  {GRID_CATEGORIES[activeGrid.rows[selectedCell.r]].label} ✕{' '}
                  {GRID_CATEGORIES[activeGrid.cols[selectedCell.c]].label}
                </h4>
              </div>
              <button
                onClick={() => {
                  clearFeedbackTimer();
                  setSelectedCell(null);
                  setFeedback(null);
                }}
                className="paddock-icon-btn"
                style={{ width: '28px', height: '28px' }}
              >
                <X size={14} />
              </button>
            </div>

            {feedback && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  marginBottom: '10px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: feedback.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                  border: `1px solid ${feedback.type === 'success' ? '#10b981' : '#ef4444'}`,
                  color: feedback.type === 'success' ? '#6ee7b7' : '#fca5a5',
                }}
              >
                {feedback.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                <span>{feedback.text}</span>
              </div>
            )}

            <div className="paddock-search-box" style={{ maxWidth: '100%', marginBottom: '10px' }}>
              <Search size={14} className="paddock-search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search driver by name, code, or team..."
                className="paddock-search-input"
                style={{ padding: '8px 12px 8px 36px', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '4px' }}>
              {filteredDrivers.length > 0 ? (
                filteredDrivers.map((driver) => (
                  <button
                    key={driver.id}
                    disabled={isSubmitting}
                    onClick={() => handleSelectDriver(driver)}
                    className="paddock-dropdown-item"
                    style={{
                      padding: '8px 10px',
                      border: '1px solid rgba(255,255,255,0.06)',
                      opacity: isSubmitting ? 0.6 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FlagIcon country={driver.nationality} size={22} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{driver.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#8f8f99', fontFamily: 'monospace' }}>
                          {driver.currentTeam} · #{driver.number}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                  No available driver matches "{searchQuery}"
                </div>
              )}
            </div>
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
                <span>How to Play Paddock Grid</span>
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
              <p>🎯 <strong>Objective:</strong> Complete all 9 cells of the 3×3 matrix.</p>
              <p>⚡ <strong>Intersection:</strong> The chosen driver must satisfy <em>both</em> the row criteria and the column criteria.</p>
              <p>🔒 <strong>Immaculate Rule:</strong> Each driver can only be picked <strong>once</strong> across the entire grid.</p>
              <p>🚫 <strong>9 Guesses:</strong> A wrong guess burns a guess without solving the cell.</p>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="paddock-pill-btn active"
              style={{ width: '100%', marginTop: '16px', justifyContent: 'center', padding: '10px' }}
            >
              Start Racing
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
                <span>Grid Telemetry Stats</span>
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
                  {stats.perfectWins}
                </span>
                <span className="paddock-stat-lbl">9/9 Solved</span>
              </div>
              <div className="paddock-stat-box">
                <span className="paddock-stat-num" style={{ color: '#f59e0b' }}>
                  {stats.currentStreak}
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
              type="button"
              onClick={() => setShowStats(false)}
              className="paddock-pill-btn"
              style={{ width: '100%', justifyContent: 'center', padding: '10px', background: '#27272a', color: '#f4f4f5' }}
            >
              Close Telemetry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default F1PaddockGrid;
