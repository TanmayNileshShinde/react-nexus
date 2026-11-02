import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Grid,
  Search,
  Trophy,
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
  ChevronRight,
} from 'lucide-react';
import PaddockNav from '../components/PaddockNav';
import {
  F1_DRIVERS,
  GRID_CATEGORIES,
  getDailyGrid,
  getRandomGrid,
  validateDriverForCell,
  generateGridShareText,
} from '../utils/f1PaddockData';
import { useSound } from '../context/SoundContext';

const MAX_GUESSES = 9;

const F1PaddockGrid = () => {
  const { sound } = useSound();

  // Mode: 'daily' or 'freeplay'
  const [mode, setMode] = useState('daily');
  const [activeGrid, setActiveGrid] = useState(() => getDailyGrid());
  const [solvedCells, setSolvedCells] = useState({});
  const [guessesLeft, setGuessesLeft] = useState(MAX_GUESSES);
  const [usedDriverIds, setUsedDriverIds] = useState(new Set());

  // Modal / selector state
  const [selectedCell, setSelectedCell] = useState(null); // { r, c }
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', text }

  const searchInputRef = useRef(null);

  // Persistent stats
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

  // Load saved state for daily
  useEffect(() => {
    if (mode === 'daily') {
      const todayKey = `nexus_f1_grid_daily_${new Date().toISOString().slice(0, 10)}`;
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

  // Focus search input when cell modal opens
  useEffect(() => {
    if (selectedCell && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [selectedCell]);

  // Filter available drivers for picker
  const filteredDrivers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return F1_DRIVERS.filter((d) => {
      // Exclude already picked drivers
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
    if (isGameOver) return;
    const key = `${r}-${c}`;
    if (solvedCells[key]) return; // Already solved
    if (guessesLeft <= 0) return;

    sound?.playMove?.();
    setSelectedCell({ r, c });
    setSearchQuery('');
    setFeedback(null);
  };

  const handleSelectDriver = (driver) => {
    if (!selectedCell || isGameOver) return;
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
      const updatedCells = {
        ...solvedCells,
        [cellKey]: driver,
      };
      const updatedUsedIds = new Set(usedDriverIds).add(driver.id);
      setSolvedCells(updatedCells);
      setUsedDriverIds(updatedUsedIds);

      setFeedback({
        type: 'success',
        text: `Correct! ${driver.name} fits ${rowCategory.label} & ${colCategory.label}!`,
      });

      const newSolvedCount = Object.keys(updatedCells).length;
      const gameFinished = newSolvedCount === 9 || newGuessesLeft <= 0;

      if (gameFinished) {
        setIsGameOver(true);
        updateEndStats(newSolvedCount === 9, newSolvedCount);
      }

      // Save daily state
      if (mode === 'daily') {
        const todayKey = `nexus_f1_grid_daily_${new Date().toISOString().slice(0, 10)}`;
        localStorage.setItem(
          todayKey,
          JSON.stringify({
            solvedCells: updatedCells,
            guessesLeft: newGuessesLeft,
            usedDriverIds: Array.from(updatedUsedIds),
            isGameOver: gameFinished,
          })
        );
      }

      // Close modal after brief flash
      setTimeout(() => {
        setSelectedCell(null);
        setFeedback(null);
      }, 700);
    } else {
      sound?.playGameOver?.();
      setFeedback({
        type: 'error',
        text: `Miss! ${driver.name} did not match both ${rowCategory.label} and ${colCategory.label}.`,
      });

      if (newGuessesLeft <= 0) {
        setIsGameOver(true);
        updateEndStats(false, solvedCount);
      }

      if (mode === 'daily') {
        const todayKey = `nexus_f1_grid_daily_${new Date().toISOString().slice(0, 10)}`;
        localStorage.setItem(
          todayKey,
          JSON.stringify({
            solvedCells,
            guessesLeft: newGuessesLeft,
            usedDriverIds: Array.from(usedDriverIds),
            isGameOver: newGuessesLeft <= 0,
          })
        );
      }

      setTimeout(() => {
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

  const handleShare = () => {
    sound?.playBeep?.();
    const text = generateGridShareText(
      solvedCells,
      solvedCount,
      mode === 'daily' ? 'Daily' : 'Practice'
    );
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center px-3 sm:px-6 py-6 font-sans">
      <PaddockNav activeTab="grid" />

      {/* Main Wrapper */}
      <div className="w-full max-w-4xl flex flex-col items-center">
        {/* Subheader & Controls */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-6 bg-white/[0.03] border border-white/10 p-3 sm:p-4 rounded-2xl backdrop-blur-md">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (mode !== 'daily') {
                  setMode('daily');
                  setActiveGrid(getDailyGrid());
                  setSolvedCells({});
                  setGuessesLeft(MAX_GUESSES);
                  setUsedDriverIds(new Set());
                  setIsGameOver(false);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'daily'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Daily Grid</span>
            </button>
            <button
              onClick={() => {
                if (mode !== 'freeplay') {
                  setMode('freeplay');
                  handleResetGame();
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'freeplay'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Practice / Unlimited</span>
            </button>
          </div>

          {/* Guesses & Solved Counter */}
          <div className="flex items-center gap-4 text-xs sm:text-sm font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-white/50">Solved:</span>
              <span className="font-bold text-emerald-400">
                {solvedCount}/9
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-white/50">Guesses:</span>
              <span
                className={`font-bold ${
                  guessesLeft <= 2 ? 'text-red-400 animate-pulse' : 'text-yellow-400'
                }`}
              >
                {guessesLeft} left
              </span>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2">
            {mode === 'freeplay' && (
              <button
                onClick={handleResetGame}
                title="New Random Grid"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowHelp(true)}
              title="How to Play"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowStats(true)}
              title="Stats"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
            {(isGameOver || solvedCount > 0) && (
              <button
                onClick={handleShare}
                title="Share Result"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Share'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 3x3 Grid Matrix Board */}
        <div className="w-full max-w-2xl bg-black/60 p-3 sm:p-5 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {/* Corner Cell (Nexus F1 Logo) */}
            <div className="aspect-square flex flex-col items-center justify-center p-2 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <Flame className="w-6 h-6 text-red-500 animate-pulse mb-1" />
              <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">
                F1 GRID
              </span>
            </div>

            {/* Column Headers (Cols 0, 1, 2) */}
            {activeGrid.cols.map((colKey, colIdx) => {
              const cat = GRID_CATEGORIES[colKey];
              return (
                <div
                  key={`col-${colIdx}`}
                  className="aspect-square flex flex-col items-center justify-center p-2 text-center rounded-2xl bg-white/[0.04] border border-white/10 transition-all shadow-inner"
                  style={{ borderTop: `3px solid ${cat.color}` }}
                >
                  <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-white/50 mb-0.5">
                    COL {colIdx + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white line-clamp-2">
                    {cat.label}
                  </span>
                  <span className="text-[9px] text-white/40 hidden sm:block mt-1 font-mono">
                    {cat.badge}
                  </span>
                </div>
              );
            })}

            {/* Row 0, 1, 2 + Cells */}
            {activeGrid.rows.map((rowKey, rowIdx) => {
              const rowCat = GRID_CATEGORIES[rowKey];
              return (
                <React.Fragment key={`row-${rowIdx}`}>
                  {/* Row Header */}
                  <div
                    className="aspect-square flex flex-col items-center justify-center p-2 text-center rounded-2xl bg-white/[0.04] border border-white/10 shadow-inner"
                    style={{ borderLeft: `3px solid ${rowCat.color}` }}
                  >
                    <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-white/50 mb-0.5">
                      ROW {rowIdx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white line-clamp-2">
                      {rowCat.label}
                    </span>
                    <span className="text-[9px] text-white/40 hidden sm:block mt-1 font-mono">
                      {rowCat.badge}
                    </span>
                  </div>

                  {/* 3 Grid Cells for this row */}
                  {[0, 1, 2].map((colIdx) => {
                    const cellKey = `${rowIdx}-${colIdx}`;
                    const driver = solvedCells[cellKey];
                    const isSelected =
                      selectedCell?.r === rowIdx && selectedCell?.c === colIdx;

                    return (
                      <button
                        key={cellKey}
                        onClick={() => handleCellClick(rowIdx, colIdx)}
                        disabled={!!driver || isGameOver}
                        className={`aspect-square rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center text-center transition-all relative overflow-hidden group ${
                          driver
                            ? 'bg-emerald-950/40 border-2 border-emerald-500/80 shadow-lg shadow-emerald-950/50'
                            : isSelected
                            ? 'bg-red-500/20 border-2 border-red-500 scale-[0.98]'
                            : 'bg-white/[0.02] border border-white/10 hover:border-red-500/50 hover:bg-white/[0.06] cursor-pointer'
                        }`}
                      >
                        {driver ? (
                          <div className="flex flex-col items-center justify-center gap-1 w-full animate-fade-in">
                            <span className="text-lg sm:text-2xl">{driver.flag}</span>
                            <span className="text-xs sm:text-sm font-bold text-emerald-200 line-clamp-1">
                              {driver.name}
                            </span>
                            <span className="text-[9px] font-mono text-emerald-400/80 px-1.5 py-0.5 rounded bg-emerald-900/60 uppercase">
                              #{driver.number} • {driver.code}
                            </span>
                            <div className="absolute top-1.5 right-1.5 text-emerald-400">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-white/30 group-hover:text-red-400 transition-colors">
                            <span className="text-xl sm:text-2xl font-light">
                              +
                            </span>
                            <span className="text-[10px] sm:text-xs font-mono tracking-wider uppercase">
                              Select
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Game Completed Banner */}
        {isGameOver && (
          <div className="w-full max-w-2xl mt-6 p-5 rounded-2xl bg-gradient-to-r from-red-950/60 via-black/80 to-red-950/60 border border-red-500/40 text-center animate-fade-in backdrop-blur-md">
            <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-2 animate-bounce" />
            <h3 className="text-xl font-bold text-white mb-1">
              {solvedCount === 9
                ? '🏆 Immaculate Grid Master!'
                : `Grid Session Complete: ${solvedCount}/9 Solved`}
            </h3>
            <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto mb-4">
              {solvedCount === 9
                ? 'Flawless execution! You filled every single intersection across the Formula 1 grid.'
                : `Solid effort! You found ${solvedCount} out of 9 driver intersections.`}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>{copied ? 'Copied to Clipboard!' : 'Share Immaculate Grid'}</span>
              </button>
              {mode === 'freeplay' && (
                <button
                  onClick={handleResetGame}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Next Grid</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Driver Selection Modal */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="w-full max-w-md bg-[#0c1017] border border-white/20 rounded-3xl p-5 shadow-2xl animate-fade-in flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div>
                <span className="text-[10px] font-mono text-white/40 uppercase">
                  Cell Selection (R{selectedCell.r + 1} × C{selectedCell.c + 1})
                </span>
                <h4 className="text-sm font-bold text-white">
                  {GRID_CATEGORIES[activeGrid.rows[selectedCell.r]].label} ✕{' '}
                  {GRID_CATEGORIES[activeGrid.cols[selectedCell.c]].label}
                </h4>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Feedback alert inside modal if clicked */}
            {feedback && (
              <div
                className={`mb-3 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300'
                    : 'bg-red-950/80 border border-red-500 text-red-300'
                }`}
              >
                {feedback.type === 'success' ? (
                  <Check className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search driver by name, code, or team..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Driver list */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredDrivers.length > 0 ? (
                filteredDrivers.map((driver) => (
                  <button
                    key={driver.id}
                    onClick={() => handleSelectDriver(driver)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-red-600/20 hover:border-red-500/50 border border-white/5 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{driver.flag}</span>
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-red-300 transition-colors">
                          {driver.name}
                        </div>
                        <div className="text-[10px] text-white/50 font-mono">
                          {driver.currentTeam} • {driver.championships > 0 ? `${driver.championships}x Champion` : `${driver.podiums} Podiums`}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/80 transition-colors" />
                  </button>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-white/40">
                  No unused drivers found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* How to Play Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0c1017] border border-white/20 rounded-3xl p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-red-500" />
                <span>How to Play PaddockDle Grid</span>
              </h4>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-white/70">
              <p>
                🎯 <strong>Goal:</strong> Fill all 9 cells of the 3×3 matrix using
                real Formula 1 drivers.
              </p>
              <p>
                ⚡ <strong>Intersection Criteria:</strong> Each driver you pick must
                satisfy <em>both</em> the Row criterion and the Column criterion for that cell.
              </p>
              <p>
                🔒 <strong>Immaculate Rule:</strong> A driver can only be used
                <strong> once</strong> across the entire grid.
              </p>
              <p>
                🚫 <strong>9 Guesses:</strong> You have exactly 9 total guesses.
                Every wrong pick costs a guess and leaves the cell unsolved!
              </p>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full mt-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs sm:text-sm transition-colors"
            >
              Ready to Race
            </button>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStats && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0c1017] border border-white/20 rounded-3xl p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-red-500" />
                <span>PaddockDle Grid Career Telemetry</span>
              </h4>
              <button
                onClick={() => setShowStats(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center mb-6">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="text-xl font-bold text-white">{stats.played}</div>
                <div className="text-[10px] text-white/50 uppercase font-mono mt-1">
                  Played
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="text-xl font-bold text-emerald-400">
                  {stats.perfectWins}
                </div>
                <div className="text-[10px] text-white/50 uppercase font-mono mt-1">
                  9/9 Wins
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="text-xl font-bold text-yellow-400">
                  {stats.currentStreak}
                </div>
                <div className="text-[10px] text-white/50 uppercase font-mono mt-1">
                  Streak
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="text-xl font-bold text-red-400">
                  {stats.maxStreak}
                </div>
                <div className="text-[10px] text-white/50 uppercase font-mono mt-1">
                  Max Streak
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowStats(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition-colors"
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
