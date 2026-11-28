import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trophy, Play, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

import sound from '../utils/audioFX';

// firebase
import { db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc, increment, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const GRID_SIZE = 25; 
const INITIAL_SNAKE = [{ x: 12, y: 12 }];
const INITIAL_DIRECTION = { x: 0, y: -1 }; 

const SnakeGame = () => {
  // state
  const { user, loginWithGoogle } = useAuth();
  const [view, setView] = useState('menu'); 
  const [stats, setStats] = useState({ snakeHighScore: 0, snakeMatches: 0 });
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // state
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const snakeRef = useRef(INITIAL_SNAKE);
  const foodRef = useRef({ x: 5, y: 5 });
  const scoreRef = useRef(0);
  const dirRef = useRef(INITIAL_DIRECTION);
  const dirQueueRef = useRef([]);
  const swipeStartRef = useRef(null);
  const gameOverRef = useRef(null);
  
  // --- 1. AUTH & DATA SYNC ---
  useEffect(() => {
    let cancelled = false;
    const syncUser = async () => {
      if (!user) {
        setStats({ snakeHighScore: 0, snakeMatches: 0 });
        return;
      }
      try {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (cancelled) return;
        if (!docSnap.exists()) {
          const initialData = {
            displayName: user.displayName,
            photoURL: user.photoURL,
            snakeHighScore: 0, snakeMatches: 0
          };
          await setDoc(userRef, initialData, { merge: true });
          if (!cancelled) setStats({ snakeHighScore: 0, snakeMatches: 0 });
        } else {
          const data = docSnap.data();
          setStats({
            snakeHighScore: data.snakeHighScore || 0,
            snakeMatches: data.snakeMatches || 0
          });
        }
      } catch (error) {
        console.error("Failed to sync Snake stats", error);
      }
    };
    syncUser();
    return () => { cancelled = true; };
  }, [user]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) { console.error("Login failed", error); }
  };

  // leaderboard
  const fetchLeaderboard = async () => {
    setView('leaderboard');
    setIsLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("snakeHighScore", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      setLeaderboardData(querySnapshot.docs.map(doc => doc.data()));
    } catch (error) { console.error("Error fetching leaderboard:", error); } 
    finally { setIsLoading(false); }
  };

  // game loop
  const generateFood = useCallback((currentSnake) => {
    const occupied = new Set(currentSnake.map((seg) => `${seg.x},${seg.y}`));
    const emptyCells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (!occupied.has(`${x},${y}`)) {
          emptyCells.push({ x, y });
        }
      }
    }
    if (emptyCells.length === 0) return null;
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }, []);

  const resetGame = () => {
    sound.playClick();
    const initialFood = generateFood(INITIAL_SNAKE) || { x: 5, y: 5 };
    snakeRef.current = INITIAL_SNAKE;
    foodRef.current = initialFood;
    scoreRef.current = 0;
    dirRef.current = INITIAL_DIRECTION;
    dirQueueRef.current = [];
    setSnake(INITIAL_SNAKE);
    setFood(initialFood);
    setScore(0);
    setIsGameOver(false);
  };

  const gameOver = async (isBoardCleared = false) => {
    if (isBoardCleared) sound.playVictory();
    else sound.playGameOver();
    setIsGameOver(true);
    if (!user) return;

    const finalScore = scoreRef.current;
    const userRef = doc(db, "users", user.uid);
    const isNewHighScore = finalScore > (stats.snakeHighScore || 0);

    setStats(prev => ({
      ...prev,
      snakeHighScore: isNewHighScore ? finalScore : (prev.snakeHighScore || 0),
      snakeMatches: (prev.snakeMatches || 0) + 1
    }));

    try {
      await updateDoc(userRef, {
        snakeMatches: increment(1),
        ...(isNewHighScore && { snakeHighScore: finalScore })
      });
    } catch (error) {
      console.error('Failed to update snake stats', error);
    }
  };
  gameOverRef.current = gameOver;

  // game loop
  useEffect(() => {
    if (view !== 'game' || isGameOver) return;

    const moveSnake = () => {
      if (dirQueueRef.current.length > 0) {
        const nextDir = dirQueueRef.current.shift();
        dirRef.current = nextDir;
      }

      const currentSnake = snakeRef.current;
      const head = currentSnake[0];
      const newHead = { x: head.x + dirRef.current.x, y: head.y + dirRef.current.y };

      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        gameOverRef.current?.(false);
        return;
      }

      const activeFood = foodRef.current;
      const willEat = activeFood && newHead.x === activeFood.x && newHead.y === activeFood.y;
      const collisionBody = willEat ? currentSnake : currentSnake.slice(0, -1);

      if (collisionBody.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        gameOverRef.current?.(false);
        return;
      }

      const newSnake = willEat ? [newHead, ...currentSnake] : [newHead, ...currentSnake.slice(0, -1)];
      snakeRef.current = newSnake;
      setSnake(newSnake);

      if (willEat) {
        sound.playScore();
        scoreRef.current += 10;
        setScore(scoreRef.current);
        const nextFood = generateFood(newSnake);
        if (!nextFood) {
          gameOverRef.current?.(true);
        } else {
          foodRef.current = nextFood;
          setFood(nextFood);
        }
      }
    };

    const intervalId = setInterval(moveSnake, 100);
    return () => clearInterval(intervalId);
  }, [view, isGameOver, generateFood]);

  const handleDirChange = useCallback((x, y) => {
    if (view !== 'game' || isGameOver) return;
    if (dirQueueRef.current.length >= 2) return;
    const lastPlanned = dirQueueRef.current.length > 0
      ? dirQueueRef.current[dirQueueRef.current.length - 1]
      : dirRef.current;
    if ((lastPlanned.x === x && lastPlanned.y === y) || (x !== 0 && lastPlanned.x === -x) || (y !== 0 && lastPlanned.y === -y)) {
      return;
    }
    sound.playMove();
    dirQueueRef.current.push({ x, y });
  }, [view, isGameOver]);

  // keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (view !== 'game' || isGameOver) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(key)) {
        e.preventDefault();
      }
      switch (key) {
        case 'ArrowUp': case 'w': handleDirChange(0, -1); break;
        case 'ArrowDown': case 's': handleDirChange(0, 1); break;
        case 'ArrowLeft': case 'a': handleDirChange(-1, 0); break;
        case 'ArrowRight': case 'd': handleDirChange(1, 0); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDirChange, view, isGameOver]);

  // ui components
  const MenuCard = ({ icon: Icon, title, subtitle, onClick, color }) => (
    <div onClick={onClick} className="glass-panel" style={{ 
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', padding: '30px', 
      border: `1px solid ${color}`, background: `linear-gradient(145deg, rgba(255,255,255,0.03) 0%, ${color}10 100%)`,
      transition: 'all 0.3s ease', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)', marginBottom: '20px'
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 10px 40px ${color}30`; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)'; }}
    >
      <div style={{ background: `${color}20`, padding: '20px', borderRadius: '12px' }}>
        <Icon size={40} color={color}/>
      </div>
      <div style={{ textAlign: 'left' }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{title}</h3>
        <p style={{ margin: 0, fontSize: '1rem', opacity: 0.6, color: 'white' }}>{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="glass-panel" style={{ 
      width: '100%', 
      maxWidth: '800px',
      minHeight: 'min(800px, calc(100vh - 110px))',
      padding: 'clamp(16px, 4vw, 40px)', margin: '20px auto', display: 'flex', flexDirection: 'column', boxSizing: 'border-box'
    }}>
      
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h2 style={{ 
          fontSize: 'clamp(1.75rem, 6vw, 3rem)', fontWeight: '800', margin: 0, 
          background: 'linear-gradient(to right, #00af3a, #00f3ff)', WebkitBackgroundClip: 'text', color: 'transparent',
          textTransform: 'uppercase', letterSpacing: '3px'
        }}>
          Snake Arena
        </h2>
      </div>

      {/* MENU VIEW */}
      {view === 'menu' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
          <MenuCard icon={Play} title="Play Arcade" subtitle="Ranked Solo Mode" color="#00af3a" onClick={() => { setView('game'); resetGame(); }} />
          <MenuCard icon={Trophy} title="Hall of Fame" subtitle="Top High Scores" color="#ffd700" onClick={fetchLeaderboard} />
          
          <Link to="/" style={{ textAlign: 'center', marginTop: '40px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <ArrowLeft size={16}/> Back to Nexus
          </Link>
        </div>
      )}

      {/* GAME VIEW */}
      {view === 'game' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Top Bar (Score & User) */}
          <div style={{ width: '100%', maxWidth: '600px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00af3a', textShadow: '0 0 15px rgba(0, 175, 58, 0.5)' }}>
              SCORE: {score}
            </div>
            
            {!user ? (
              <button onClick={handleLogin} style={{ background: 'white', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '25px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>Login to Save</button>
            ) : (
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div>
                  <div style={{ fontSize: '1rem', color: 'white', fontWeight: 'bold' }}>{user.displayName}</div>
                  <div style={{ fontSize: '0.85rem', color: '#ffd700' }}>Best: {stats.snakeHighScore}</div>
                </div>
                <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" style={{ width: 45, height: 45, borderRadius: '50%', border: '3px solid #00af3a' }} />
              </div>
            )}
          </div>

          {/* THE BOARD (supports swipe & keyboard) */}
          <div
            onPointerDown={(e) => {
              swipeStartRef.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerUp={(e) => {
              if (!swipeStartRef.current) return;
              const dx = e.clientX - swipeStartRef.current.x;
              const dy = e.clientY - swipeStartRef.current.y;
              swipeStartRef.current = null;
              if (Math.hypot(dx, dy) < 20) return;
              if (Math.abs(dx) > Math.abs(dy)) handleDirChange(dx > 0 ? 1 : -1, 0);
              else handleDirChange(0, dy > 0 ? 1 : -1);
            }}
            style={{ 
              width: '100%', maxWidth: '520px', aspectRatio: '1/1', background: 'rgba(0,0,0,0.6)', 
              border: `3px solid ${isGameOver ? '#ff4444' : '#00af3a'}`, borderRadius: '12px', 
              position: 'relative', overflow: 'hidden', margin: '0 auto', touchAction: 'none',
              boxShadow: `0 0 40px ${isGameOver ? 'rgba(255, 68, 68, 0.3)' : 'rgba(0, 175, 58, 0.2)'}`
            }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: `${100/GRID_SIZE}% ${100/GRID_SIZE}%` }} />

            {/* Food */}
            <div style={{
              position: 'absolute', width: `${100 / GRID_SIZE}%`, height: `${100 / GRID_SIZE}%`,
              left: `${food.x * (100 / GRID_SIZE)}%`, top: `${food.y * (100 / GRID_SIZE)}%`,
              background: '#ff4444', borderRadius: '50%', boxShadow: '0 0 20px #ff4444', zIndex: 2
            }} />
            
            {/* Snake */}
            {snake.map((segment, index) => (
              <div key={index} style={{
                position: 'absolute', width: `${100 / GRID_SIZE}%`, height: `${100 / GRID_SIZE}%`,
                left: `${segment.x * (100 / GRID_SIZE)}%`, top: `${segment.y * (100 / GRID_SIZE)}%`,
                background: index === 0 ? '#00f3ff' : '#00af3a', 
                borderRadius: index === 0 ? '8px' : '4px', border: '1px solid rgba(0,0,0,0.5)',
                zIndex: index === 0 ? 3 : 2
              }} />
            ))}

            {isGameOver && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                <h2 style={{ color: '#ff4444', margin: '0 0 15px 0', fontSize: 'clamp(2rem, 8vw, 3.5rem)', textShadow: '0 0 30px rgba(255,0,0,0.6)' }}>GAME OVER</h2>
                <p style={{ color: 'white', fontSize: '1.3rem', margin: 0 }}>Final Score: <span style={{color: '#00af3a', fontWeight: 'bold'}}>{score}</span></p>
              </div>
            )}
          </div>

          {/* Touch Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 46px)', gap: '6px', marginTop: '16px', justifyItems: 'center' }}>
            <div />
            <button type="button" aria-label="Move Up" onClick={() => handleDirChange(0, -1)} style={{ width: '46px', height: '42px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.06)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronUp size={20} /></button>
            <div />
            <button type="button" aria-label="Move Left" onClick={() => handleDirChange(-1, 0)} style={{ width: '46px', height: '42px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.06)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronLeft size={20} /></button>
            <button type="button" aria-label="Move Down" onClick={() => handleDirChange(0, 1)} style={{ width: '46px', height: '42px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.06)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronDown size={20} /></button>
            <button type="button" aria-label="Move Right" onClick={() => handleDirChange(1, 0)} style={{ width: '46px', height: '42px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.06)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ChevronRight size={20} /></button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '14px', marginTop: '20px', width: '100%', maxWidth: '520px' }}>
            <button onClick={() => { setView('menu'); setIsGameOver(false); }} style={{ flex: 1, padding: '20px', background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              <ArrowLeft size={24}/> MENU
            </button>
            <button onClick={resetGame} style={{ flex: 1, padding: '20px', background: 'rgba(0, 175, 58, 0.1)', border: '2px solid #00af3a', color: '#00af3a', borderRadius: '12px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              <RefreshCw size={24}/> RESTART
            </button>
          </div>
        </div>
      )}

      {/* LEADERBOARD VIEW */}
      {view === 'leaderboard' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
             <button onClick={() => setView('menu')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}><ArrowLeft size={32}/></button>
            <h3 style={{ margin: 0, fontSize: '2rem', color: '#ffcc00' }}>Hall of Fame</h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
            {isLoading ? (
               <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '50px', color: 'white', fontSize: '1.2rem' }}>Fetching Data...</div>
            ) : leaderboardData.length === 0 ? (
               <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '50px', color: 'white', fontSize: '1.2rem' }}>No scores yet. Set the record!</div>
            ) : (
              leaderboardData.map((player, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', marginBottom: '15px', borderRadius: '16px', background: index === 0 ? 'linear-gradient(90deg, rgba(255,215,0,0.2) 0%, rgba(255,255,255,0.05) 100%)' : 'rgba(255,255,255,0.05)', border: index === 0 ? '2px solid rgba(255,215,0,0.5)' : '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: index === 0 ? '#ffd700' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: index === 0 ? 'black' : 'white', fontSize: '1.2rem' }}>{index + 1}</div>
                    <img src={player.photoURL} alt="Player" referrerPolicy="no-referrer" style={{ width: 50, height: 50, borderRadius: '50%' }} />
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'white' }}>{player.displayName || "Unknown"}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#00af3a', fontWeight: 'bold', fontSize: '1.8rem' }}>{player.snakeHighScore || 0}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.5, color: 'white' }}>High Score</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
