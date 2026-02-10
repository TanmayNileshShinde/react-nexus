// src/pages/TicTacToe.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trophy, User, Bot, Users } from 'lucide-react';
import styles from '../styles/Game.module.css';

// FIREBASE IMPORTS
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const TicTacToe = () => {
  // --- STATES ---
  const [user, setUser] = useState(null);
  const [view, setView] = useState('menu'); // 'menu', 'game_ai', 'game_friend', 'leaderboard'
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  
  // Stats now includes losses
  const [stats, setStats] = useState({ wins: 0, losses: 0, matches: 0, winRate: 0 });
  
  // Leaderboard States
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- 1. AUTHENTICATION & DATA SYNC ---
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      
      const userRef = doc(db, "users", result.user.uid);
      const docSnap = await getDoc(userRef);

      // FORCE SAVE Profile Info (Initialize losses if missing)
      if (!docSnap.exists()) {
        const initialData = { 
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          wins: 0, losses: 0, matches: 0, winRate: 0 
        };
        await setDoc(userRef, initialData);
        setStats(initialData);
      } else {
        const data = docSnap.data();
        // Ensure 'losses' exists for old users
        if (data.losses === undefined) data.losses = 0;
        
        await setDoc(userRef, { 
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          losses: data.losses // Ensure field is saved
        }, { merge: true });
        
        setStats(data);
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  // --- 2. LEADERBOARD FETCHER ---
  const fetchLeaderboard = async () => {
    setView('leaderboard');
    setIsLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("wins", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => {
        const d = doc.data();
        return { ...d, losses: d.losses || 0 }; // Handle missing losses field
      });
      setLeaderboardData(data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. GAME LOGIC ---
  const calculateWinner = (squares) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
    }
    return null;
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every((square) => square !== null);

  // --- 4. AI LOGIC ---
  useEffect(() => {
    if (view === 'game_ai' && !isXNext && !winner && !isDraw) {
      const timer = setTimeout(() => {
        const emptyIndices = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        if (emptyIndices.length > 0) {
          const randomMove = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
          makeMove(randomMove);
        }
      }, 300); 
      return () => clearTimeout(timer);
    }
  }, [isXNext, view, winner, board]);

  // --- 5. STATS SAVING (Updated Logic) ---
  useEffect(() => {
    if (view === 'game_ai' && user && (winner || isDraw)) {
      updateStats(winner === 'X', isDraw);
    }
  }, [winner, isDraw]);

  const updateStats = async (isWin, isDrawGame) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    
    // Calculate New Values
    const newWins = isWin ? stats.wins + 1 : stats.wins;
    // Loss only counts if it's NOT a win and NOT a draw
    const newLosses = (!isWin && !isDrawGame) ? (stats.losses || 0) + 1 : (stats.losses || 0);
    const newMatches = stats.matches + 1;

    // New Formula: Win % = Wins / (Wins + Losses). Draws are ignored in the percentage.
    const totalDecisiveGames = newWins + newLosses;
    const newRate = totalDecisiveGames === 0 ? 0 : ((newWins / totalDecisiveGames) * 100).toFixed(1);

    setStats({ wins: newWins, losses: newLosses, matches: newMatches, winRate: newRate });

    await updateDoc(userRef, {
      matches: increment(1),
      wins: isWin ? increment(1) : increment(0),
      losses: (!isWin && !isDrawGame) ? increment(1) : increment(0),
      winRate: newRate
    });
  };

  const makeMove = (index) => {
    if (board[index] || winner || isDraw) return;
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const handleUserClick = (index) => {
    if (view === 'game_ai' && !isXNext) return;
    makeMove(index);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  // --- UI COMPONENTS ---
  const MenuCard = ({ icon: Icon, title, subtitle, onClick, color }) => (
    <div onClick={onClick} className="glass-panel" style={{ 
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', padding: '25px', 
      border: `1px solid ${color}`, background: `linear-gradient(145deg, rgba(255,255,255,0.03) 0%, ${color}10 100%)`,
      transition: 'all 0.3s ease', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      marginBottom: '15px'
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 10px 40px ${color}30`; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)'; }}
    >
      <div style={{ background: `${color}20`, padding: '15px', borderRadius: '12px' }}>
        <Icon size={32} color={color}/>
      </div>
      <div style={{ textAlign: 'left' }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', fontWeight: '700', letterSpacing: '0.5px' }}>{title}</h3>
        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.6, fontWeight: '400' }}>{subtitle}</p>
      </div>
    </div>
  );

  // --- RENDER ---
  return (
    <div className="glass-panel" style={{ 
      width: '100%', maxWidth: '450px', minHeight: '600px', 
      padding: '30px', position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column'
    }}>
      
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ 
          fontSize: '2rem', fontWeight: '800', margin: 0, 
          background: 'linear-gradient(to right, #00f3ff, #bc13fe)', WebkitBackgroundClip: 'text', color: 'transparent',
          textTransform: 'uppercase', letterSpacing: '2px'
        }}>
          Tic Tac Toe Arena
        </h2>
      </div>

      {/* VIEW: MAIN MENU */}
      {view === 'menu' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <MenuCard 
            icon={Bot} title="Vs AI (Ranked)" subtitle="Login to climb the global ranks" 
            color="#bc13fe" onClick={() => setView('game_ai')} 
          />
          <MenuCard 
            icon={Users} title="Vs Friend" subtitle="Local multiplayer classic" 
            color="#00f3ff" onClick={() => setView('game_friend')} 
          />
          <MenuCard 
            icon={Trophy} title="Leaderboard" subtitle="See who rules the Arena" 
            color="#ffcc00" onClick={fetchLeaderboard} 
          />
          
          <Link to="/" style={{ textAlign: 'center', marginTop: '30px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <ArrowLeft size={14}/> Back to Portfolio
          </Link>
        </div>
      )}

      {/* VIEW: GAME (AI & FRIEND) */}
      {(view === 'game_ai' || view === 'game_friend') && (
        <div className={styles.container} style={{ flex: 1 }}>
          
          {/* Top Bar (Login/User Info) */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px', minHeight: '40px' }}>
            {view === 'game_ai' && (
              !user ? (
                <button onClick={handleLogin} style={{ 
                  background: 'white', color: '#0f172a', border: 'none', padding: '8px 16px', 
                  borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <User size={16}/> Login with Google
                </button>
              ) : (
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.05)', padding: '5px 15px', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex', alignItems: 'center', gap: '12px' 
                }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>{user.displayName}</div>
                    <div style={{ fontSize: '0.7rem', color: '#ccc' }}>
                        <span style={{color: '#00ff88'}}>{stats.wins}W</span> - <span style={{color: '#ff4444'}}>{stats.losses || 0}L</span> ({stats.winRate}%)
                    </div>
                  </div>
                  <img 
                    src={user.photoURL} 
                    alt="User" 
                    referrerPolicy="no-referrer"
                    style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #bc13fe' }}
                  />
                </div>
              )
            )}
          </div>

          {/* Game Status */}
          <div className={styles.status} style={{ 
            color: winner ? '#00ff88' : isDraw ? '#ffcc00' : 'white',
            textShadow: winner ? '0 0 20px rgba(0,255,136,0.5)' : 'none',
            fontSize: '1.5rem', marginBottom: '30px'
          }}>
            {winner ? `WINNER: ${winner}!` : isDraw ? "DRAW!" : `TURN: ${isXNext ? 'X' : 'O'}`}
          </div>

          {/* The Board */}
          <div className={styles.board} style={{ boxShadow: '0 0 50px rgba(0, 243, 255, 0.1)' }}>
            {board.map((val, idx) => (
              <div key={idx} className={`${styles.square} ${val === 'X' ? styles.x : val === 'O' ? styles.o : ''}`} onClick={() => handleUserClick(idx)}>
                {val}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <button 
              className={styles.button} 
              onClick={() => {setView('menu'); resetGame();}} 
              style={{ flex: 1, padding: '15px', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.3)' }}
            >
              <ArrowLeft size={18}/> MENU
            </button>
            <button 
              className={styles.button} 
              onClick={resetGame} 
              style={{ flex: 1, padding: '15px', background: 'rgba(0, 243, 255, 0.1)', border: '1px solid rgba(0, 243, 255, 0.3)' }}
            >
              <RefreshCw size={18}/> RESTART
            </button>
          </div>

        </div>
      )}

      {/* VIEW: LEADERBOARD */}
      {view === 'leaderboard' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
             <button onClick={() => setView('menu')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={24}/>
            </button>
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#ffcc00' }}>Hall of Fame</h3>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
            {isLoading ? (
               <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '50px' }}>
                 <div className={styles.spinner} style={{display:'inline-block', marginBottom:'10px'}}></div>
                 <br/>Fetching Data...
               </div>
            ) : leaderboardData.length === 0 ? (
               <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '50px' }}>No matches played yet. Be the first!</div>
            ) : (
              leaderboardData.map((player, index) => (
                <div key={index} style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '15px', marginBottom: '10px', borderRadius: '12px',
                  background: index === 0 ? 'linear-gradient(90deg, rgba(255,215,0,0.2) 0%, rgba(255,255,255,0.05) 100%)' : 'rgba(255,255,255,0.05)',
                  border: index === 0 ? '1px solid rgba(255,215,0,0.5)' : '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ 
                      width: '30px', height: '30px', borderRadius: '50%', background: index === 0 ? '#ffd700' : 'rgba(255,255,255,0.1)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: index === 0 ? 'black' : 'white'
                    }}>
                      {index + 1}
                    </div>
                    {player.photoURL && (
                      <img 
                        src={player.photoURL} 
                        alt="Player" 
                        referrerPolicy="no-referrer"
                        style={{ width: 40, height: 40, borderRadius: '50%' }} 
                      />
                    )}
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{player.displayName || "Unknown"}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{player.matches} Played</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#00f3ff', fontWeight: 'bold', fontSize: '1.0rem' }}>
                        {player.wins}W <span style={{color:'rgba(255,255,255,0.3)'}}>|</span> <span style={{color:'#ff4444'}}>{player.losses || 0}L</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{player.winRate}% Rate</div>
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

export default TicTacToe;