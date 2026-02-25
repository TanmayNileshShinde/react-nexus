import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trophy, Play, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../styles/Game.module.css';

// FIREBASE IMPORTS
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const GRID_SIZE = 25; 
const INITIAL_SNAKE = [{ x: 12, y: 12 }];
const INITIAL_DIRECTION = { x: 0, y: -1 }; 

const SnakeGame = () => {
  // --- STATES ---
  const [user, setUser] = useState(null);
  const [view, setView] = useState('menu'); 
  const [stats, setStats] = useState({ snakeHighScore: 0, snakeMatches: 0 });
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Game States
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [dir, setDir] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const dirRef = useRef(dir);
  
  // --- 1. AUTH & DATA SYNC ---
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      
      const userRef = doc(db, "users", result.user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        const initialData = { 
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          snakeHighScore: 0, snakeMatches: 0 
        };
        await setDoc(userRef, initialData);
        setStats(initialData);
      } else {
        const data = docSnap.data();
        setStats({
          snakeHighScore: data.snakeHighScore || 0,
          snakeMatches: data.snakeMatches || 0
        });
      }
    } catch (error) { console.error("Login failed", error); }
  };

  // --- 2. LEADERBOARD FETCHER ---
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

  // --- 3. GAME ENGINE ---
  const generateFood = useCallback((currentSnake) => {
    let newFood;
    while (true) {
      newFood = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
      // eslint-disable-next-line no-loop-func
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDir(INITIAL_DIRECTION);
    dirRef.current = INITIAL_DIRECTION;
    setFood(generateFood(INITIAL_SNAKE));
    setScore(0);
    setIsGameOver(false);
  };

  const gameOver = async () => {
    setIsGameOver(true);
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const isNewHighScore = score > stats.snakeHighScore;
    
    setStats(prev => ({
      ...prev,
      snakeHighScore: isNewHighScore ? score : prev.snakeHighScore,
      snakeMatches: prev.snakeMatches + 1
    }));

    await updateDoc(userRef, {
      snakeMatches: increment(1),
      ...(isNewHighScore && { snakeHighScore: score })
    });
  };

  // Game Loop
  useEffect(() => {
    if (view !== 'game' || isGameOver) return;

    const moveSnake = () => {
      setSnake(prev => {
        const head = prev[0];
        const newHead = { x: head.x + dirRef.current.x, y: head.y + dirRef.current.y };

        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          gameOver();
          return prev;
        }

        if (prev.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          gameOver();
          return prev;
        }

        const newSnake = [newHead, ...prev];

        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop(); 
        }

        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, 100); 
    return () => clearInterval(intervalId);
  }, [view, isGameOver, food, generateFood]);

  const handleDirChange = (x, y) => {
    if (view !== 'game' || isGameOver) return;
    const current = dirRef.current;
    if (x !== 0 && current.x === -x) return;
    if (y !== 0 && current.y === -y) return;
    dirRef.current = { x, y };
  };

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case 'ArrowUp': case 'w': handleDirChange(0, -1); break;
        case 'ArrowDown': case 's': handleDirChange(0, 1); break;
        case 'ArrowLeft': case 'a': handleDirChange(-1, 0); break;
        case 'ArrowRight': case 'd': handleDirChange(1, 0); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, isGameOver]);

  // --- UI COMPONENTS ---
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
      maxWidth: '800px', /* MASSIVE PC SCREEN WIDTH */
      minHeight: '800px', 
      padding: '40px', margin: '40px auto', display: 'flex', flexDirection: 'column', boxSizing: 'border-box'
    }}>
      
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ 
          fontSize: '3rem', fontWeight: '800', margin: 0, 
          background: 'linear-gradient(to right, #00af3a, #00f3ff)', WebkitBackgroundClip: 'text', color: 'transparent',
          textTransform: 'uppercase', letterSpacing: '4px'
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

          {/* THE MASSIVE BOARD */}
          <div style={{ 
            width: '100%', maxWidth: '600px', aspectRatio: '1/1', background: 'rgba(0,0,0,0.6)', 
            border: `3px solid ${isGameOver ? '#ff4444' : '#00af3a'}`, borderRadius: '12px', 
            position: 'relative', overflow: 'hidden', margin: '0 auto',
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
                <h2 style={{ color: '#ff4444', margin: '0 0 15px 0', fontSize: '3.5rem', textShadow: '0 0 30px rgba(255,0,0,0.6)' }}>GAME OVER</h2>
                <p style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>Final Score: <span style={{color: '#00af3a', fontWeight: 'bold'}}>{score}</span></p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '20px', marginTop: '40px', width: '100%', maxWidth: '600px' }}>
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