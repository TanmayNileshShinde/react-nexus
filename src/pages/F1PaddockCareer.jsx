import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  GitBranch,
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
  Lock,
  Eye,
  Award,
  Globe,
  Flag,
  Heart,
  ChevronRight,
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

const MAX_STEPS = 5;

const F1PaddockCareer = () => {
  const { sound } = useSound();

  const [mode, setMode] = useState('daily');
  const [secretDriver, setSecretDriver] = useState(() => getDailyCareerDriver());
  const [currentStep, setCurrentStep] = useState(1); // 1 to 5
  const [guesses, setGuesses] = useState([]); // [{ driver, step, isCorrect }]
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [copied, setCopied] = useState(false);

  const searchInputRef = useRef(null);

  // Clues for current secret driver
  const clues = useMemo(() => {
    return generateCareerClues(secretDriver);
  }, [secretDriver]);

  // Persistent stats
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

  // Daily persistence
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

  // Filter drivers for guess autocomplete
  const filteredDrivers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return F1_DRIVERS.filter((d) => {
      // Exclude already guessed
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
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center px-3 sm:px-6 py-6 font-sans">
      <PaddockNav activeTab="career" />

      {/* Main Wrapper */}
      <div className="w-full max-w-3xl flex flex-col items-center">
        {/* Controls Bar */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-6 bg-white/[0.03] border border-white/10 p-3 sm:p-4 rounded-2xl backdrop-blur-md">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (mode !== 'daily') {
                  setMode('daily');
                  setSecretDriver(getDailyCareerDriver());
                  setCurrentStep(1);
                  setGuesses([]);
                  setIsWon(false);
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
              <span>Daily Career</span>
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
              <span>Practice Mode</span>
            </button>
          </div>

          {/* Clues & Hearts */}
          <div className="flex items-center gap-4 text-xs sm:text-sm font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-white/50">Clue:</span>
              <span className="font-bold text-yellow-400">
                {currentStep}/{MAX_STEPS}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Heart
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= (MAX_STEPS - (guesses.length || 0))
                      ? 'text-red-500 fill-red-500'
                      : 'text-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2">
            {mode === 'freeplay' && (
              <button
                onClick={handleResetGame}
                title="New Random Driver"
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
              title="Career Telemetry"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
            {isGameOver && (
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

        {/* Clues Timeline Stack */}
        <div className="w-full space-y-3 mb-6">
          {clues.map((clue, idx) => {
            const stepNum = idx + 1;
            const isRevealed = stepNum <= currentStep || isGameOver;
            const isCurrent = stepNum === currentStep && !isGameOver;

            return (
              <div
                key={clue.step}
                className={`relative rounded-2xl p-4 transition-all duration-300 border ${
                  isRevealed
                    ? isCurrent
                      ? 'bg-gradient-to-r from-red-950/40 via-white/[0.04] to-red-950/40 border-red-500/60 shadow-lg shadow-red-950/30'
                      : 'bg-white/[0.03] border-white/15'
                    : 'bg-black/30 border-white/5 opacity-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                        isRevealed
                          ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {stepNum}
                    </div>
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-white/40">
                        {clue.title}
                      </div>
                      <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                        {isRevealed ? (
                          clue.value
                        ) : (
                          <span className="blur-sm select-none text-white/40 font-mono">
                            ••••••••••••••••••••••••
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isRevealed ? (
                    <div className="flex items-center gap-1.5 text-xs text-white/30 font-mono shrink-0">
                      <Lock className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Locked</span>
                    </div>
                  ) : (
                    <div className="text-[11px] font-mono text-emerald-400/80 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                      {clue.hint}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Guess Input & Controls (When Active) */}
        {!isGameOver ? (
          <div className="w-full max-w-xl flex flex-col gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
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
                className="w-full bg-white/5 border border-white/20 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-xl"
              />

              {/* Autocomplete Dropdown */}
              {isDropdownOpen && filteredDrivers.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-[#0d121c] border border-white/20 rounded-2xl p-1.5 shadow-2xl z-40 max-h-60 overflow-y-auto">
                  {filteredDrivers.map((driver) => (
                    <button
                      key={driver.id}
                      onClick={() => handleGuess(driver)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-red-600/20 hover:border-red-500/40 border border-transparent transition-all text-left group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{driver.flag}</span>
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-red-300">
                            {driver.name}
                          </div>
                          <div className="text-[10px] text-white/40 font-mono">
                            {driver.currentTeam} • #{driver.number}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Skip / Next Clue Button */}
            {currentStep < MAX_STEPS && (
              <div className="flex justify-center">
                <button
                  onClick={handleRevealClue}
                  className="flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Reveal Next Clue (-200 pts)</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Game Over / Win Card */
          <div className="w-full max-w-xl p-6 rounded-3xl bg-gradient-to-r from-red-950/60 via-black/80 to-red-950/60 border border-red-500/40 text-center animate-fade-in backdrop-blur-md shadow-2xl">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3 animate-bounce" />
            <h3 className="text-2xl font-bold text-white mb-1">
              {isWon ? 'Career Decoded!' : 'Out of Clues (DNF)'}
            </h3>
            <p className="text-xs sm:text-sm text-white/70 mb-4">
              {isWon
                ? `Incredible telemetry analysis! You identified the mystery driver on Clue ${currentStep}/${MAX_STEPS}.`
                : 'Hard luck on the telemetry! The secret driver was revealed below.'}
            </p>

            {/* Driver Identity Card */}
            <div className="flex items-center justify-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl mb-6 max-w-md mx-auto">
              <span className="text-4xl">{secretDriver.flag}</span>
              <div className="text-left">
                <h4 className="text-lg font-bold text-white">
                  {secretDriver.name}
                </h4>
                <div className="text-xs text-white/60 font-mono">
                  {secretDriver.currentTeam} • Code: {secretDriver.code} (#{secretDriver.number})
                </div>
                <div className="text-xs text-emerald-400 font-semibold mt-1">
                  Score: {currentScore} points
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>{copied ? 'Copied to Clipboard!' : 'Share Result'}</span>
              </button>
              {mode === 'freeplay' && (
                <button
                  onClick={handleResetGame}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Next Driver</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Guesses Log */}
        {guesses.length > 0 && (
          <div className="w-full max-w-xl mt-6">
            <div className="text-xs font-mono uppercase text-white/40 mb-2">
              Previous Guesses ({guesses.length}/{MAX_STEPS})
            </div>
            <div className="space-y-1.5">
              {guesses.map((g, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold ${
                    g.isCorrect
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                      : 'bg-red-950/40 border-red-500/30 text-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{g.driver.flag}</span>
                    <span>{g.driver.name}</span>
                    <span className="text-[10px] opacity-60 font-mono">
                      (Clue {g.step})
                    </span>
                  </div>
                  <div>{g.isCorrect ? '✅ Match' : '❌ Miss'}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* How to Play Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0c1017] border border-white/20 rounded-3xl p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-red-500" />
                <span>How to Play Career Timeline</span>
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
                🎯 <strong>Goal:</strong> Guess the secret Formula 1 driver using
                as few career timeline clues as possible.
              </p>
              <p>
                ⏱️ <strong>Progressive Clues:</strong> The game starts with Clue 1
                (Debut Team & Year). An incorrect guess unlocks the next clue.
              </p>
              <p>
                ⚡ <strong>Maximum Score:</strong> Solving on Clue 1 awards
                <strong> 1,000 points</strong>! Each subsequent clue deducts 200
                points.
              </p>
              <p>
                💔 <strong>5 Total Guesses:</strong> You have 5 chances before
                a DNF (Did Not Finish).
              </p>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full mt-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs sm:text-sm transition-colors"
            >
              Start Guessing
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
                <span>Career Guesser Stats</span>
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
                  {stats.wins}
                </div>
                <div className="text-[10px] text-white/50 uppercase font-mono mt-1">
                  Wins
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
                  {stats.totalScore}
                </div>
                <div className="text-[10px] text-white/50 uppercase font-mono mt-1">
                  Score
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowStats(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition-colors"
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
