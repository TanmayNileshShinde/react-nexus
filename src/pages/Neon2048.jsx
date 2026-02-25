import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trophy, Grid, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

// FIREBASE IMPORTS
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

// --- NEON TILE COLORS ---
const getTileStyle = (val) => {
  const styles = {
    0: { bg: 'rgba(255,255,255,0.02)', color: 'transparent', shadow: 'none' },
    2: { bg: 'rgba(0, 243, 255, 0.1)', color: '#00f3ff', shadow: '0 0 10px rgba(0, 243, 255, 0.3)' },
    4: { bg: 'rgba(0, 243, 255, 0.2)', color: '#00f3ff', shadow: '0 0 15px rgba(0, 243, 255, 0.5)' },
    8: { bg: 'rgba(188, 19, 254, 0.2)', color: '#bc13fe', shadow: '0 0 15px rgba(188, 19, 254, 0.5)' },
    16: { bg: 'rgba(188, 19, 254, 0.4)', color: '#bc13fe', shadow: '0 0 20px rgba(188, 19, 254, 0.7)' },
    32: { bg: 'rgba(255, 68, 68, 0.2)', color: '#ff4444', shadow: '0 0 15px rgba(255, 68, 68, 0.5)' },
    64: { bg: 'rgba(255, 68, 68, 0.4)', color: '#ff4444', shadow: '0 0 20px rgba(255, 68, 68, 0.7)' },
    128: { bg: 'rgba(0, 175, 58, 0.2)', color: '#00af3a', shadow: '0 0 20px rgba(0, 175, 58, 0.5)' },
    256: { bg: 'rgba(0, 175, 58, 0.4)', color: '#00af3a', shadow: '0 0 25px rgba(0, 175, 58, 0.7)' },
    512: { bg: 'rgba(255, 215, 0, 0.2)', color: '#ffd700', shadow: '0 0 20px rgba(255, 215, 0, 0.5)' },
    1024: { bg: 'rgba(255, 215, 0, 0.4)', color: '#ffd700', shadow: '0 0 30px rgba(255, 215, 0, 0.8)' },
    2048: { bg: 'rgba(255, 255, 255, 0.8)', color: '#000', shadow: '0 0 40px rgba(255, 255, 255, 1)' }
  };
  return styles[val] || { bg: 'rgba(255, 255, 255, 0.9)', color: '#000', shadow: '0 0 50px #fff' };
};

const Neon2048 = () => {
  // --- STATES ---
  const [user, setUser] = useState(null);
  const [view, setView] = useState('menu'); 
  const [stats, setStats] = useState({ neon2048HighScore: 0, neon2048Matches: 0 });
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Game States
  const [board, setBoard] = useState(Array(4).fill().map(() => Array(4).fill(0)));
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

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
          neon2048HighScore: 0, neon2048Matches: 0 
        };
        await setDoc(userRef, initialData);
        setStats(initialData);
      } else {
        const data = docSnap.data();
        setStats({
          neon2048HighScore: data.neon2048HighScore || 0,
          neon2048Matches: data.neon2048Matches || 0
        });
      }
    } catch (error) { console.error("Login failed", error); }
  };

  // --- 2. LEADERBOARD FETCHER ---
  const fetchLeaderboard = async () => {
    setView('leaderboard');
    setIsLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("neon2048HighScore", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      setLeaderboardData(querySnapshot.docs.map(doc => doc.data()));
    } catch (error) { console.error("Error fetching leaderboard:", error); } 
    finally { setIsLoading(false); }
  };

  // --- 3. 2048 ENGINE ---
  const getEmptyCoordinates = (currentBoard) => {
    let emptyCoords = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) emptyCoords.push({ r, c });
      }
    }
    return emptyCoords;
  };

  const spawnRandomTile = (currentBoard) => {
    let emptyCoords = getEmptyCoordinates(currentBoard);
    if (emptyCoords.length === 0) return currentBoard;
    let randomCoord = emptyCoords[Math.floor(Math.random() * emptyCoords.length)];
    let newBoard = currentBoard.map(row => [...row]);
    newBoard[randomCoord.r][randomCoord.c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  };

  const resetGame = () => {
    let newBoard = Array(4).fill().map(() => Array(4).fill(0));
    newBoard = spawnRandomTile(newBoard);
    newBoard = spawnRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setIsGameOver(false);
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

  const handleGameOver = async (finalScore) => {
    setIsGameOver(true);
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const isNewHighScore = finalScore > stats.neon2048HighScore;
    
    setStats(prev => ({ ...prev, neon2048HighScore: isNewHighScore ? finalScore : prev.neon2048HighScore, neon2048Matches: prev.neon2048Matches + 1 }));
    await updateDoc(userRef, { neon2048Matches: increment(1), ...(isNewHighScore && { neon2048HighScore: finalScore }) });
  };

  // Matrix Math for sliding tiles
  const move = useCallback((direction) => {
    if (isGameOver || view !== 'game') return;

    let newBoard = board.map(row => [...row]);
    let pointsEarned = 0;
    let changed = false;

    const slide = (row) => {
      let arr = row.filter(val => val);
      let missing = 4 - arr.length;
      let zeros = Array(missing).fill(0);
      return arr.concat(zeros);
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

    const operate = (row) => {
      row = slide(row);
      row = combine(row);
      row = slide(row);
      return row;
    };

    if (direction === 'LEFT') {
      for (let i = 0; i < 4; i++) {
        let ogRow = [...newBoard[i]];
        newBoard[i] = operate(newBoard[i]);
        if (ogRow.join(',') !== newBoard[i].join(',')) changed = true;
      }
    } else if (direction === 'RIGHT') {
      for (let i = 0; i < 4; i++) {
        let ogRow = [...newBoard[i]];
        newBoard[i] = operate(newBoard[i].reverse()).reverse();
        if (ogRow.join(',') !== newBoard[i].join(',')) changed = true;
      }
    } else if (direction === 'UP') {
      for (let c = 0; c < 4; c++) {
        let row = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
        let ogRow = [...row];
        row = operate(row);
        if (ogRow.join(',') !== row.join(',')) changed = true;
        for (let r = 0; r < 4; r++) newBoard[r][c] = row[r];
      }
    } else if (direction === 'DOWN') {
      for (let c = 0; c < 4; c++) {
        let row = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
        let ogRow = [...row];
        row = operate(row.reverse()).reverse();
        if (ogRow.join(',') !== row.join(',')) changed = true;
        for (let r = 0; r < 4; r++) newBoard[r][c] = row[r];
      }
    }

    if (changed) {
      newBoard = spawnRandomTile(newBoard);
      setBoard(newBoard);
      setScore(s => s + pointsEarned);
      if (checkGameOver(newBoard)) handleGameOver(score + pointsEarned);
    }
  }, [board, isGameOver, view, score]);

  // Key listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case 'ArrowUp': case 'w': move('UP'); break;
        case 'ArrowDown': case 's': move('DOWN'); break;
        case 'ArrowLeft': case 'a': move('LEFT'); break;
        case 'ArrowRight': case 'd': move('RIGHT'); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

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
      width: '100%', maxWidth: '800px', minHeight: '800px', 
      padding: '40px', margin: '40px auto', display: 'flex', flexDirection: 'column', boxSizing: 'border-box'
    }}>
      
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ 
          fontSize: '3rem', fontWeight: '800', margin: 0, 
          background: 'linear-gradient(to right, #00f3ff, #bc13fe)', WebkitBackgroundClip: 'text', color: 'transparent',
          textTransform: 'uppercase', letterSpacing: '4px'
        }}>
          Neon 2048
        </h2>
      </div>

      {/* MENU VIEW */}
      {view === 'menu' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
          <MenuCard icon={Grid} title="Start Protocol" subtitle="Classic 2048 Rules" color="#00f3ff" onClick={() => { setView('game'); resetGame(); }} />
          <MenuCard icon={Trophy} title="Hall of Fame" subtitle="Top High Scores" color="#bc13fe" onClick={fetchLeaderboard} />
          
          <Link to="/" style={{ textAlign: 'center', marginTop: '40px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <ArrowLeft size={16}/> Back to Nexus
          </Link>
        </div>
      )}

      {/* GAME VIEW */}
      {view === 'game' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Top Bar (Score & User) */}
          <div style={{ width: '100%', maxWidth: '500px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00f3ff', textShadow: '0 0 15px rgba(0, 243, 255, 0.5)' }}>
              SCORE: {score}
            </div>
            
            {!user ? (
              <button onClick={handleLogin} style={{ background: 'white', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '25px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>Login to Save</button>
            ) : (
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div>
                  <div style={{ fontSize: '1rem', color: 'white', fontWeight: 'bold' }}>{user.displayName}</div>
                  <div style={{ fontSize: '0.85rem', color: '#bc13fe' }}>Best: {stats.neon2048HighScore}</div>
                </div>
                <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" style={{ width: 45, height: 45, borderRadius: '50%', border: '3px solid #00f3ff' }} />
              </div>
            )}
          </div>

          {/* THE 2048 BOARD */}
          <div style={{ 
            width: '100%', maxWidth: '500px', aspectRatio: '1/1', background: 'rgba(0,0,0,0.5)', 
            border: `2px solid ${isGameOver ? '#ff4444' : '#00f3ff'}`, borderRadius: '12px', 
            padding: '15px', position: 'relative', display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(4, 1fr)', gap: '10px',
            boxShadow: `0 0 30px ${isGameOver ? 'rgba(255, 68, 68, 0.3)' : 'rgba(0, 243, 255, 0.2)'}`
          }}>
            {board.map((row, r) => (
              row.map((cell, c) => {
                const style = getTileStyle(cell);
                return (
                  <div key={`${r}-${c}`} style={{
                    background: style.bg,
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: cell > 512 ? '2rem' : '2.5rem', fontWeight: '900', color: style.color,
                    boxShadow: style.shadow,
                    border: cell > 0 ? `1px solid ${style.color}55` : '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.15s ease-in-out'
                  }}>
                    {cell > 0 ? cell : ''}
                  </div>
                );
              })
            ))}

            {isGameOver && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, borderRadius: '12px' }}>
                <h2 style={{ color: '#ff4444', margin: '0 0 15px 0', fontSize: '3.5rem', textShadow: '0 0 30px rgba(255,0,0,0.6)' }}>GRID LOCKED</h2>
                <p style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>Final Score: <span style={{color: '#00f3ff', fontWeight: 'bold'}}>{score}</span></p>
              </div>
            )}
          </div>

          {/* D-PAD CONTROLS FOR MOBILE (Or Mouse clicking) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '30px', gap: '5px' }}>
             <button onClick={() => move('UP')} style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,243,255,0.3)', borderRadius: '12px', cursor: 'pointer', color: '#00f3ff' }}><ChevronUp size={32}/></button>
             <div style={{ display: 'flex', gap: '60px' }}>
                <button onClick={() => move('LEFT')} style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,243,255,0.3)', borderRadius: '12px', cursor: 'pointer', color: '#00f3ff' }}><ChevronLeft size={32}/></button>
                <button onClick={() => move('RIGHT')} style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,243,255,0.3)', borderRadius: '12px', cursor: 'pointer', color: '#00f3ff' }}><ChevronRight size={32}/></button>
             </div>
             <button onClick={() => move('DOWN')} style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,243,255,0.3)', borderRadius: '12px', cursor: 'pointer', color: '#00f3ff' }}><ChevronDown size={32}/></button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '20px', marginTop: '30px', width: '100%', maxWidth: '500px' }}>
            <button onClick={() => { setView('menu'); setIsGameOver(false); }} style={{ flex: 1, padding: '20px', background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              <ArrowLeft size={24}/> MENU
            </button>
            <button onClick={resetGame} style={{ flex: 1, padding: '20px', background: 'rgba(0, 243, 255, 0.1)', border: '2px solid #00f3ff', color: '#00f3ff', borderRadius: '12px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
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
            <h3 style={{ margin: 0, fontSize: '2rem', color: '#bc13fe' }}>Hall of Fame</h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
            {isLoading ? (
               <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '50px', color: 'white', fontSize: '1.2rem' }}>Fetching Grid Data...</div>
            ) : leaderboardData.length === 0 ? (
               <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '50px', color: 'white', fontSize: '1.2rem' }}>No scores yet. Initialize the grid!</div>
            ) : (
              leaderboardData.map((player, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', marginBottom: '15px', borderRadius: '16px', background: index === 0 ? 'linear-gradient(90deg, rgba(188,19,254,0.2) 0%, rgba(255,255,255,0.05) 100%)' : 'rgba(255,255,255,0.05)', border: index === 0 ? '2px solid rgba(188,19,254,0.5)' : '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: index === 0 ? '#bc13fe' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: index === 0 ? 'white' : 'white', fontSize: '1.2rem' }}>{index + 1}</div>
                    <img src={player.photoURL} alt="Player" referrerPolicy="no-referrer" style={{ width: 50, height: 50, borderRadius: '50%' }} />
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'white' }}>{player.displayName || "Unknown"}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#00f3ff', fontWeight: 'bold', fontSize: '1.8rem' }}>{player.neon2048HighScore || 0}</div>
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

export default Neon2048;