import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Sparkles,
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
} from 'lucide-react';
import {
  F1_DRIVERS,
  getDailyDriver,
  compareDrivers,
  generateShareGrid,
} from '../utils/f1PaddockData';
import { useSound } from '../context/SoundContext';

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
      const saved = localStorage.getItem('paddockdle-classic-stats');
      return saved
        ? JSON.parse(saved)
        : { played: 0, won: 0, streak: 0, maxStreak: 0, distribution: [0, 0, 0, 0, 0, 0] };
    } catch {
      return { played: 0, won: 0, streak: 0, maxStreak: 0, distribution: [0, 0, 0, 0, 0, 0] };
    }
  });

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Initialize or reset game based on mode
  useEffect(() => {
    if (mode === 'daily') {
      const daily = getDailyDriver();
      setSecretDriver(daily);

      // Check daily saved game
      const todayKey = `paddockdle-daily-${new Date().toISOString().slice(0, 10)}`;
      try {
        const savedToday = localStorage.getItem(todayKey);
        if (savedToday) {
          const parsed = JSON.parse(savedToday);
          setGuesses(parsed.guesses || []);
          setIsWon(parsed.isWon || false);
          setIsGameOver(parsed.isGameOver || false);
          return;
        }
      } catch {
        // Fallback
      }
      setGuesses([]);
      setIsWon(false);
      setIsGameOver(false);
    } else {
      // Free play: choose random
      const random = F1_DRIVERS[Math.floor(Math.random() * F1_DRIVERS.length)];
      setSecretDriver(random);
      setGuesses([]);
      setIsWon(false);
      setIsGameOver(false);
    }
    setShowHint(false);
    setSearchQuery('');
  }, [mode]);

  // Save daily state
  useEffect(() => {
    if (mode === 'daily' && guesses.length > 0) {
      const todayKey = `paddockdle-daily-${new Date().toISOString().slice(0, 10)}`;
      localStorage.setItem(
        todayKey,
        JSON.stringify({ guesses, isWon, isGameOver })
      );
    }
  }, [guesses, isWon, isGameOver, mode]);

  // Click outside to close autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered available drivers for search
  const availableDrivers = useMemo(() => {
    const guessedIds = new Set(guesses.map((g) => g.id));
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return F1_DRIVERS.filter(
      (d) =>
        !guessedIds.has(d.id) &&
        (d.name.toLowerCase().includes(query) ||
          d.code.toLowerCase().includes(query) ||
          d.nationality.toLowerCase().includes(query) ||
          d.currentTeam.toLowerCase().includes(query))
    ).slice(0, 8);
  }, [searchQuery, guesses]);

  const handleMakeGuess = (driver) => {
    if (isGameOver || guesses.length >= MAX_GUESSES) return;

    sound?.playMove();
    const newGuesses = [...guesses, driver];
    setGuesses(newGuesses);
    setSearchQuery('');
    setIsDropdownOpen(false);

    if (driver.id === secretDriver.id) {
      // Won!
      setIsWon(true);
      setIsGameOver(true);
      sound?.playWin();
      updateGameStats(true, newGuesses.length);
    } else if (newGuesses.length >= MAX_GUESSES) {
      // Lost
      setIsGameOver(true);
      sound?.playGameOver();
      updateGameStats(false, newGuesses.length);
    } else {
      sound?.playScore();
    }
  };

  const updateGameStats = (won, attempts) => {
    setStats((prev) => {
      const played = prev.played + 1;
      const wonCount = won ? prev.won + 1 : prev.won;
      const streak = won ? prev.streak + 1 : 0;
      const maxStreak = Math.max(prev.maxStreak, streak);
      const distribution = [...prev.distribution];
      if (won && attempts >= 1 && attempts <= 6) {
        distribution[attempts - 1] += 1;
      }
      const newStats = { played, won: wonCount, streak, maxStreak, distribution };
      localStorage.setItem('paddockdle-classic-stats', JSON.stringify(newStats));
      return newStats;
    });
  };

  const handleRestartFreeplay = () => {
    sound?.playClick();
    const random = F1_DRIVERS[Math.floor(Math.random() * F1_DRIVERS.length)];
    setSecretDriver(random);
    setGuesses([]);
    setIsWon(false);
    setIsGameOver(false);
    setShowHint(false);
    setSearchQuery('');
  };

  const handleShare = () => {
    sound?.playClick();
    const text = generateShareGrid(guesses, secretDriver, isWon, mode === 'daily' ? 'Daily' : 'Freeplay');
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

    let bgStyle = 'bg-slate-800/80 border-slate-700 text-slate-300';
    if (isExact) {
      bgStyle = 'bg-emerald-600/90 border-emerald-400 text-white font-bold shadow-[0_0_12px_rgba(16,185,129,0.35)]';
    } else if (isPartial) {
      bgStyle = 'bg-amber-600/90 border-amber-400 text-white font-semibold shadow-[0_0_12px_rgba(245,158,11,0.35)]';
    } else if (isHigher || isLower) {
      bgStyle = 'bg-slate-800/90 border-cyan-500/30 text-cyan-300';
    }

    return (
      <div
        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all duration-300 min-w-[64px] sm:min-w-[80px] ${bgStyle}`}
      >
        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
          {label}
        </span>
        <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold mt-0.5 truncate max-w-full">
          <span className="truncate">{field.value}</span>
          {isHigher && <ChevronUp size={16} className="text-cyan-400 shrink-0 animate-bounce" />}
          {isLower && <ChevronDown size={16} className="text-rose-400 shrink-0 animate-bounce" />}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-6 px-3 sm:px-6 relative text-white select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #e10600 0%, #00f3ff 60%, transparent 100%)' }}
        />
      </div>

      {/* Navigation Header */}
      <div className="w-full max-w-4xl flex items-center justify-between pb-4 border-b border-white/10 mb-6 gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          onClick={() => sound?.playClick()}
        >
          <ArrowLeft size={14} />
          <span>Arcade Hub</span>
        </Link>

        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-500 shadow-[0_0_15px_rgba(225,6,0,0.3)]">
            <Flag size={18} />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black font-syne tracking-tight flex items-center gap-2">
              <span>PADDOCK</span>
              <span className="text-red-500">DLE</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400 font-mono">
              Formula 1 Mystery Driver Guesser
            </p>
          </div>
        </div>

        {/* Tools (Help, Stats) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sound?.playClick();
              setShowHelp(true);
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="How to play"
          >
            <HelpCircle size={16} />
          </button>
          <button
            onClick={() => {
              sound?.playClick();
              setShowStats(true);
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="View Statistics"
          >
            <BarChart2 size={16} />
          </button>
        </div>
      </div>

      {/* Mode Selector Pill */}
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/50 border border-white/10 mb-6">
        <button
          onClick={() => {
            sound?.playClick();
            setMode('daily');
          }}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            mode === 'daily'
              ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(225,6,0,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar size={13} />
          <span>Daily Grand Prix</span>
        </button>
        <button
          onClick={() => {
            sound?.playClick();
            setMode('freeplay');
          }}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            mode === 'freeplay'
              ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(0,243,255,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles size={13} />
          <span>Infinite Paddock</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-4xl flex flex-col items-center gap-6">
        {/* Search & Input Area */}
        {!isGameOver ? (
          <div className="w-full max-w-lg relative" ref={dropdownRef}>
            <div className="relative flex items-center">
              <Search
                size={16}
                className="absolute left-3.5 text-slate-400 pointer-events-none"
              />
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
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#0f172a]/90 border border-cyan-500/30 text-white text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 shadow-lg transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Dropdown Suggestions */}
            {isDropdownOpen && availableDrivers.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-[#0a0f1d]/95 backdrop-blur-xl border border-cyan-500/30 shadow-2xl overflow-hidden animate-in fade-in duration-150">
                {availableDrivers.map((driver) => (
                  <button
                    key={driver.id}
                    onClick={() => handleMakeGuess(driver)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-cyan-500/15 border-b border-white/5 last:border-0 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{driver.flag}</span>
                      <span className="text-sm font-semibold text-white group-hover:text-cyan-300">
                        {driver.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                        {driver.code}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-white font-medium">
                      {driver.currentTeam}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Game Over Result Banner */
          <div className="w-full max-w-lg p-5 rounded-3xl bg-gradient-to-b from-[#0f172a] to-[#090d16] border border-white/10 flex flex-col items-center gap-3 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            {isWon ? (
              <>
                <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                  <Trophy size={28} />
                </div>
                <h2 className="text-xl font-black text-emerald-400 font-syne">
                  P1 FINISH! CHECKERED FLAG!
                </h2>
                <p className="text-xs text-slate-300">
                  You identified{' '}
                  <span className="font-bold text-white">
                    {secretDriver.flag} {secretDriver.name}
                  </span>{' '}
                  in {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}!
                </p>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                  <X size={28} />
                </div>
                <h2 className="text-xl font-black text-rose-400 font-syne">
                  DNF - OUT OF GUESSES
                </h2>
                <p className="text-xs text-slate-300">
                  The mystery driver was{' '}
                  <span className="font-bold text-white">
                    {secretDriver.flag} {secretDriver.name}
                  </span>{' '}
                  ({secretDriver.currentTeam}).
                </p>
              </>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(0,243,255,0.35)] transition-all active:scale-95"
              >
                {copied ? <Check size={14} /> : <Share2 size={14} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Share Result'}</span>
              </button>
              {mode === 'freeplay' && (
                <button
                  onClick={handleRestartFreeplay}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-all active:scale-95"
                >
                  <RotateCcw size={14} />
                  <span>Next Driver</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pit Wall Hint (Unlocked after 3 attempts) */}
        {!isGameOver && guesses.length >= 3 && (
          <div className="w-full max-w-lg flex flex-col items-center gap-1.5">
            {!showHint ? (
              <button
                onClick={() => {
                  sound?.playClick();
                  setShowHint(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all animate-pulse"
              >
                <Radio size={14} />
                <span>Radio Pit Wall for a Hint</span>
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 text-center font-mono">
                📻 <b>Pit Wall Telemetry:</b> Driver initials:{' '}
                <span className="text-white font-bold">{secretDriver.code}</span> | Career
                teams include:{' '}
                <span className="text-white font-bold">
                  {secretDriver.teams.slice(0, 2).join(', ')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Guesses Board */}
        <div className="w-full flex flex-col gap-2.5 overflow-x-auto pb-4">
          {guesses.length > 0 ? (
            guesses.map((guess, idx) => {
              const comp = compareDrivers(guess, secretDriver);
              return (
                <div
                  key={idx}
                  className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md gap-2 overflow-x-auto min-w-[620px] animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  {/* Driver Name Column */}
                  <div className="flex items-center gap-2 min-w-[140px] sm:min-w-[160px]">
                    <span className="text-base font-black text-slate-500 font-mono">
                      #{idx + 1}
                    </span>
                    <span className="text-lg">{guess.flag}</span>
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[120px]">
                        {guess.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {guess.code} • #{guess.number}
                      </span>
                    </div>
                  </div>

                  {/* Attribute Comparison Badges */}
                  <div className="flex items-center gap-2">
                    {renderBadge(comp.nationality, 'Nationality')}
                    {renderBadge(comp.team, 'Team')}
                    {renderBadge(comp.engine, 'Engine')}
                    {renderBadge(comp.championships, 'Titles')}
                    {renderBadge(comp.podiums, 'Podiums')}
                    {renderBadge(comp.debutYear, 'Debut')}
                    {renderBadge(comp.age, 'Age')}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="w-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl text-slate-500 gap-2">
              <Flag size={24} className="opacity-40" />
              <p className="text-xs font-mono">
                No telemetry yet. Enter an F1 driver above to start guessing!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0f172a] border border-cyan-500/30 text-white shadow-2xl relative">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
            <h3 className="text-base font-bold font-syne mb-2 flex items-center gap-2 text-cyan-400">
              <HelpCircle size={18} />
              <span>How to Play PaddockDle</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Guess the mystery Formula 1 driver in <b>6 attempts</b>. Each guess reveals comparison telemetry against the target driver.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <span className="w-4 h-4 rounded bg-emerald-500 shrink-0" />
                <span><b>Green:</b> Exact match (Correct team, nationality, engine, or number).</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-amber-950/40 border border-amber-500/30">
                <span className="w-4 h-4 rounded bg-amber-500 shrink-0" />
                <span><b>Yellow:</b> Partial match (Driver previously raced for this team).</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 border border-cyan-500/30">
                <ChevronUp size={16} className="text-cyan-400 shrink-0" />
                <span><b>Arrows (⬆️ / ⬇️):</b> The secret driver’s stat is higher or lower.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0f172a] border border-cyan-500/30 text-white shadow-2xl relative">
            <button
              onClick={() => setShowStats(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
            <h3 className="text-base font-bold font-syne mb-4 flex items-center gap-2 text-cyan-400">
              <Award size={18} />
              <span>Career Telemetry Stats</span>
            </h3>
            <div className="grid grid-cols-4 gap-2 mb-5">
              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
                <span className="text-lg font-bold text-white block">{stats.played}</span>
                <span className="text-[10px] text-slate-400 font-mono">Played</span>
              </div>
              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
                <span className="text-lg font-bold text-emerald-400 block">
                  {stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Win %</span>
              </div>
              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
                <span className="text-lg font-bold text-amber-400 block flex items-center justify-center gap-1">
                  <Flame size={14} />
                  {stats.streak}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Streak</span>
              </div>
              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
                <span className="text-lg font-bold text-cyan-400 block">{stats.maxStreak}</span>
                <span className="text-[10px] text-slate-400 font-mono">Max Streak</span>
              </div>
            </div>

            {/* Distribution */}
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              Guess Distribution
            </h4>
            <div className="space-y-1.5 text-xs font-mono">
              {stats.distribution.map((count, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-3 text-slate-400">{i + 1}</span>
                  <div className="flex-1 h-5 rounded bg-black/40 overflow-hidden flex items-center px-2">
                    <div
                      className="h-full bg-cyan-500/70 rounded transition-all flex items-center justify-end pr-1 text-[10px] font-bold text-white"
                      style={{
                        width: `${Math.max(8, (count / Math.max(1, stats.won)) * 100)}%`,
                      }}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default F1PaddockClassic;
