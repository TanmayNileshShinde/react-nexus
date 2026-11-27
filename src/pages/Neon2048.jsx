import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  RefreshCw,
  Trophy,
  Grid,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import {
  SPRING_DEFAULT,
  SPRING_MOMENTUM,
  TAP_DETENT,
  emitFeedback,
  rubberband,
} from '../utils/fluidMotion';

const getTileStyle = (val) => {
  const styles = {
    0: { bg: 'rgba(255, 255, 255, 0.03)', color: 'transparent', border: 'rgba(255, 255, 255, 0.06)' },
    2: { bg: 'rgba(56, 189, 248, 0.14)', color: '#7dd3fc', border: 'rgba(56, 189, 248, 0.3)' },
    4: { bg: 'rgba(56, 189, 248, 0.24)', color: '#e0f2fe', border: 'rgba(56, 189, 248, 0.45)' },
    8: { bg: 'rgba(167, 139, 250, 0.24)', color: '#ede9fe', border: 'rgba(167, 139, 250, 0.45)' },
    16: { bg: 'rgba(167, 139, 250, 0.38)', color: '#f5f3ff', border: 'rgba(167, 139, 250, 0.6)' },
    32: { bg: 'rgba(248, 113, 113, 0.26)', color: '#fee2e2', border: 'rgba(248, 113, 113, 0.5)' },
    64: { bg: 'rgba(248, 113, 113, 0.42)', color: '#ffffff', border: 'rgba(248, 113, 113, 0.7)' },
    128: { bg: 'rgba(52, 211, 153, 0.28)', color: '#ecfdf5', border: 'rgba(52, 211, 153, 0.5)' },
    256: { bg: 'rgba(52, 211, 153, 0.44)', color: '#ffffff', border: 'rgba(52, 211, 153, 0.7)' },
    512: { bg: 'rgba(251, 191, 36, 0.28)', color: '#fef3c7', border: 'rgba(251, 191, 36, 0.55)' },
    1024: { bg: 'rgba(251, 191, 36, 0.45)', color: '#ffffff', border: 'rgba(251, 191, 36, 0.75)' },
    2048: { bg: '#f5f7fa', color: '#0b0d12', border: '#ffffff' },
  };
  return styles[val] || { bg: '#f5f7fa', color: '#0b0d12', border: '#ffffff' };
};

const getEmptyCoordinates = (currentBoard) => {
  const emptyCoords = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (currentBoard[r][c] === 0) emptyCoords.push({ r, c });
    }
  }
  return emptyCoords;
};

const spawnRandomTile = (currentBoard) => {
  const emptyCoords = getEmptyCoordinates(currentBoard);
  if (emptyCoords.length === 0) return currentBoard;
  const randomCoord = emptyCoords[Math.floor(Math.random() * emptyCoords.length)];
  const newBoard = currentBoard.map((row) => [...row]);
  newBoard[randomCoord.r][randomCoord.c] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
};

const checkGameOver = (currentBoard) => {
  if (getEmptyCoordinates(currentBoard).length > 0) return false;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (c !== 3 && currentBoard[r][c] === currentBoard[r][c + 1]) return false;
      if (r !== 3 && currentBoard[r][c] === currentBoard[r + 1][c]) return false;
    }
  }
  return true;
};

export default function Neon2048() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('menu');
  const [stats, setStats] = useState({ neon2048HighScore: 0, neon2048Matches: 0 });
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [board, setBoard] = useState(() => Array(4).fill().map(() => Array(4).fill(0)));
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  // Direct manipulation 1:1 swipe state for the board
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const gestureRef = useRef({ active: false, startX: 0, startY: 0, pointerId: null });

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      const userRef = doc(db, 'users', result.user.uid);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        const initialData = {
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          neon2048HighScore: 0,
          neon2048Matches: 0,
        };
        await setDoc(userRef, initialData);
        setStats(initialData);
      } else {
        const data = docSnap.data();
        setStats({
          neon2048HighScore: data.neon2048HighScore || 0,
          neon2048Matches: data.neon2048Matches || 0,
        });
      }
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const fetchLeaderboard = async () => {
    emitFeedback('tap');
    setView('leaderboard');
    setIsLoading(true);
    try {
      const q = query(collection(db, 'users'), orderBy('neon2048HighScore', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
      setLeaderboardData(querySnapshot.docs.map((d) => d.data()));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetGame = () => {
    emitFeedback('tap');
    let newBoard = Array(4).fill().map(() => Array(4).fill(0));
    newBoard = spawnRandomTile(newBoard);
    newBoard = spawnRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setIsGameOver(false);
  };

  const handleGameOver = useCallback(
    async (finalScore) => {
      setIsGameOver(true);
      emitFeedback('foul');
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const isNewHighScore = finalScore > (stats.neon2048HighScore || 0);
      setStats((prev) => ({
        ...prev,
        neon2048HighScore: isNewHighScore ? finalScore : (prev.neon2048HighScore || 0),
        neon2048Matches: (prev.neon2048Matches || 0) + 1,
      }));
      try {
        await updateDoc(userRef, {
          neon2048Matches: increment(1),
          ...(isNewHighScore && { neon2048HighScore: finalScore }),
        });
      } catch (error) {
        console.error('Failed to update Neon2048 stats', error);
      }
    },
    [user, stats.neon2048HighScore]
  );

  const move = useCallback(
    (direction) => {
      if (isGameOver || view !== 'game') return;
      let newBoard = board.map((row) => [...row]);
      let pointsEarned = 0;
      let changed = false;

      const slide = (row) => {
        const arr = row.filter((val) => val);
        return arr.concat(Array(4 - arr.length).fill(0));
      };

      const combine = (row) => {
        for (let i = 0; i < 3; i++) {
          if (row[i] !== 0 && row[i] === row[i + 1]) {
            row[i] = row[i] * 2;
            row[i + 1] = 0;
            pointsEarned += row[i];
          }
        }
        return row;
      };

      const operate = (row) => slide(combine(slide(row)));

      if (direction === 'LEFT') {
        for (let i = 0; i < 4; i++) {
          const ogRow = [...newBoard[i]];
          newBoard[i] = operate(newBoard[i]);
          if (ogRow.join(',') !== newBoard[i].join(',')) changed = true;
        }
      } else if (direction === 'RIGHT') {
        for (let i = 0; i < 4; i++) {
          const ogRow = [...newBoard[i]];
          newBoard[i] = operate(newBoard[i].reverse()).reverse();
          if (ogRow.join(',') !== newBoard[i].join(',')) changed = true;
        }
      } else if (direction === 'UP') {
        for (let c = 0; c < 4; c++) {
          const ogRow = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
          const next = operate([...ogRow]);
          if (ogRow.join(',') !== next.join(',')) changed = true;
          for (let r = 0; r < 4; r++) newBoard[r][c] = next[r];
        }
      } else if (direction === 'DOWN') {
        for (let c = 0; c < 4; c++) {
          const ogRow = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
          const next = operate([...ogRow].reverse()).reverse();
          if (ogRow.join(',') !== next.join(',')) changed = true;
          for (let r = 0; r < 4; r++) newBoard[r][c] = next[r];
        }
      }

      if (changed) {
        emitFeedback(pointsEarned > 0 ? 'merge' : 'move');
        newBoard = spawnRandomTile(newBoard);
        setBoard(newBoard);
        setScore((s) => s + pointsEarned);
        if (checkGameOver(newBoard)) handleGameOver(score + pointsEarned);
      }
    },
    [board, isGameOver, view, score, handleGameOver]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (view !== 'game' || isGameOver) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
      }
      switch (key) {
        case 'ArrowUp':
        case 'w':
          move('UP');
          break;
        case 'ArrowDown':
        case 's':
          move('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
          move('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
          move('RIGHT');
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move, view, isGameOver]);

  // 1:1 Pointer Events board drag with Apple rubberband edge resistance
  const handleBoardPointerDown = (e) => {
    if (isGameOver) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    gestureRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      pointerId: e.pointerId,
    };
  };

  const handleBoardPointerMove = (e) => {
    if (!gestureRef.current.active || gestureRef.current.pointerId !== e.pointerId) return;
    const dx = e.clientX - gestureRef.current.startX;
    const dy = e.clientY - gestureRef.current.startY;
    // Direct axis-locked rubber-banding after 10px hysteresis threshold
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    if (Math.abs(dx) >= Math.abs(dy)) {
      setDragOffset({ x: rubberband(dx, 140, 0.35), y: 0 });
    } else {
      setDragOffset({ x: 0, y: rubberband(dy, 140, 0.35) });
    }
  };

  const finishBoardGesture = (e) => {
    if (!gestureRef.current.active || gestureRef.current.pointerId !== e.pointerId) return;
    const dx = e.clientX - gestureRef.current.startX;
    const dy = e.clientY - gestureRef.current.startY;
    gestureRef.current.active = false;
    setDragOffset({ x: 0, y: 0 });

    const threshold = 28;
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
    if (Math.abs(dx) >= Math.abs(dy)) {
      move(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      move(dy > 0 ? 'DOWN' : 'UP');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING_DEFAULT}
      className="glass-panel"
      style={{
        width: '100%',
        maxWidth: '580px',
        padding: '24px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
        <h2
          style={{
            fontSize: '1.85rem',
            fontWeight: 600,
            letterSpacing: '-0.025em',
            lineHeight: 1.08,
            margin: 0,
            color: '#f5f7fa',
          }}
        >
          Neon 2048
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'rgba(245,247,250,0.6)' }}>
          Swipe directly on the grid or use arrow keys
        </p>
      </div>

      {view === 'menu' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '420px',
            margin: '12px auto',
            width: '100%',
          }}
        >
          <motion.button
            type="button"
            whileTap={TAP_DETENT}
            transition={SPRING_DEFAULT}
            onClick={() => {
              setView('game');
              resetGame();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '18px 20px',
              borderRadius: '14px',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              background: 'rgba(56, 189, 248, 0.12)',
              color: '#f5f7fa',
              textAlign: 'left',
            }}
          >
            <Grid size={22} strokeWidth={1.75} color="#38bdf8" />
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>Start Game</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(245,247,250,0.68)' }}>
                Classic 4x4 merge rules with swipe momentum
              </div>
            </div>
          </motion.button>

          <motion.button
            type="button"
            whileTap={TAP_DETENT}
            transition={SPRING_DEFAULT}
            onClick={fetchLeaderboard}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '18px 20px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#f5f7fa',
              textAlign: 'left',
            }}
          >
            <Trophy size={22} strokeWidth={1.75} color="#fbbf24" />
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>Leaderboard</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(245,247,250,0.68)' }}>
                Top recorded scores synced to Firestore
              </div>
            </div>
          </motion.button>

          <Link
            to="/"
            style={{
              textAlign: 'center',
              marginTop: '14px',
              color: 'rgba(245,247,250,0.58)',
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <ArrowLeft size={15} strokeWidth={1.75} /> Back to Library
          </Link>
        </div>
      )}

      {view === 'game' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '100%',
              maxWidth: '400px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(245,247,250,0.5)' }}>Score</div>
              <div
                className="tabular-nums"
                style={{ fontSize: '1.75rem', fontWeight: 600, color: '#38bdf8', lineHeight: 1.1 }}
              >
                {score}
              </div>
            </div>

            {!user ? (
              <button
                type="button"
                onClick={handleLogin}
                style={{
                  background: '#f5f7fa',
                  color: '#0b0d12',
                  border: 'none',
                  height: '34px',
                  padding: '0 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                Sign in to Save
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'right' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#f5f7fa' }}>
                    {user.displayName}
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                    Best {stats.neon2048HighScore}
                  </div>
                </div>
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  referrerPolicy="no-referrer"
                  style={{ width: 34, height: 34, borderRadius: '50%' }}
                />
              </div>
            )}
          </div>

          {/* 4x4 Direct-Manipulation Board */}
          <motion.div
            onPointerDown={handleBoardPointerDown}
            onPointerMove={handleBoardPointerMove}
            onPointerUp={finishBoardGesture}
            onPointerCancel={finishBoardGesture}
            animate={{ x: dragOffset.x, y: dragOffset.y }}
            transition={SPRING_MOMENTUM}
            style={{
              width: '100%',
              maxWidth: '400px',
              aspectRatio: '1/1',
              background: 'rgba(10, 12, 18, 0.78)',
              border: `1px solid ${isGameOver ? 'rgba(248, 113, 113, 0.55)' : 'rgba(255, 255, 255, 0.14)'}`,
              borderRadius: '16px',
              padding: '12px',
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridTemplateRows: 'repeat(4, 1fr)',
              gap: '10px',
              touchAction: 'none',
              userSelect: 'none',
              cursor: 'grab',
            }}
          >
            {board.map((row, r) =>
              row.map((cell, c) => {
                const tileStyle = getTileStyle(cell);
                return (
                  <motion.div
                    key={`${r}-${c}-${cell}`}
                    initial={cell > 0 ? { scale: 0.86 } : false}
                    animate={{ scale: 1 }}
                    transition={SPRING_MOMENTUM}
                    className="tabular-nums"
                    style={{
                      background: tileStyle.bg,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: cell >= 1024 ? '1.35rem' : cell >= 128 ? '1.65rem' : '1.9rem',
                      fontWeight: 600,
                      color: tileStyle.color,
                      border: `1px solid ${tileStyle.border}`,
                    }}
                  >
                    {cell > 0 ? cell : ''}
                  </motion.div>
                );
              })
            )}

            {isGameOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={SPRING_DEFAULT}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(11, 13, 18, 0.86)',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  borderRadius: '15px',
                  gap: '8px',
                }}
              >
                <div style={{ color: '#f87171', fontSize: '1.5rem', fontWeight: 600 }}>
                  No Moves Left
                </div>
                <div className="tabular-nums" style={{ color: '#f5f7fa', fontSize: '1.1rem' }}>
                  Final score: {score}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Compact Directional Controls + Actions all within viewport */}
          <div
            style={{
              width: '100%',
              maxWidth: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { dir: 'LEFT', Icon: ChevronLeft },
                { dir: 'UP', Icon: ChevronUp },
                { dir: 'DOWN', Icon: ChevronDown },
                { dir: 'RIGHT', Icon: ChevronRight },
              ].map((ctrl) => (
                <button
                  key={ctrl.dir}
                  type="button"
                  aria-label={`Move ${ctrl.dir}`}
                  onClick={() => move(ctrl.dir)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#f5f7fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ctrl.Icon size={18} strokeWidth={1.75} />
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  emitFeedback('tap');
                  setView('menu');
                  setIsGameOver(false);
                }}
                style={{
                  height: '38px',
                  padding: '0 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#f5f7fa',
                  fontSize: '0.84rem',
                  fontWeight: 500,
                }}
              >
                Menu
              </button>
              <button
                type="button"
                onClick={resetGame}
                style={{
                  height: '38px',
                  padding: '0 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#f5f7fa',
                  color: '#0b0d12',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RefreshCw size={14} strokeWidth={1.75} />
                Restart
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'leaderboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                emitFeedback('tap');
                setView('menu');
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#f5f7fa',
                width: 34,
                height: 34,
                borderRadius: 10,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeft size={16} strokeWidth={1.75} />
            </button>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: '#f5f7fa' }}>
              Top 2048 Scores
            </h3>
          </div>

          <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {isLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(245,247,250,0.55)' }}>
                Loading leaderboard
              </div>
            ) : (
              leaderboardData.map((player, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: index === 0 ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="tabular-nums" style={{ fontWeight: 600, color: index === 0 ? '#38bdf8' : 'rgba(245,247,250,0.55)' }}>
                      #{index + 1}
                    </span>
                    {player.photoURL && (
                      <img src={player.photoURL} alt={player.displayName} referrerPolicy="no-referrer" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                    )}
                    <span style={{ fontWeight: 500, color: '#f5f7fa' }}>
                      {player.displayName || 'Player'}
                    </span>
                  </div>
                  <span className="tabular-nums" style={{ fontWeight: 600, color: '#38bdf8' }}>
                    {player.neon2048HighScore || 0}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
