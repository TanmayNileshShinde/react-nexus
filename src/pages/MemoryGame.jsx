// src/pages/MemoryGame.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trophy, User, Flag, AlertTriangle } from 'lucide-react';
import styles from '../styles/Game.module.css';

// FIREBASE IMPORTS
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

// --- CONFIGURATION ---
const MAX_MOVES = 30; // Starting moves

// --- THE 2026 GRID (22 DRIVERS) ---
const ALL_DRIVERS = [
  { id: 1, name: 'Albon', color: '#005AFF', img: '/drivers/albon.webp' },
  { id: 2, name: 'Alonso', color: '#006F62', img: '/drivers/alonso.webp' },
  { id: 3, name: 'Antonelli', color: '#00D2BE', img: '/drivers/antonelli.webp' },
  { id: 4, name: 'Bearman', color: '#B6BABD', img: '/drivers/bearman.webp' },
  { id: 5, name: 'Bortoleto', color: '#00e701', img: '/drivers/bortoleto.webp' },
  { id: 6, name: 'Bottas', color: '#B6BABD', img: '/drivers/bottas.webp' },
  { id: 7, name: 'Colapinto', color: '#005AFF', img: '/drivers/colapinto.webp' },
  { id: 8, name: 'Gasly', color: '#FF87BC', img: '/drivers/gasly.webp' },
  { id: 9, name: 'Hadjar', color: '#6692FF', img: '/drivers/hadjar.webp' },
  { id: 10, name: 'Hamilton', color: '#EF1A2D', img: '/drivers/hamilton.webp' },
  { id: 11, name: 'Hulkenberg', color: '#00e701', img: '/drivers/hulkenberg.webp' },
  { id: 12, name: 'Lawson', color: '#6692FF', img: '/drivers/lawson.webp' },
  { id: 13, name: 'Leclerc', color: '#EF1A2D', img: '/drivers/leclerc.webp' },
  { id: 14, name: 'Lindblad', color: '#101C50', img: '/drivers/lindblad.webp' },
  { id: 15, name: 'Norris', color: '#FF8000', img: '/drivers/norris.webp' },
  { id: 16, name: 'Ocon', color: '#B6BABD', img: '/drivers/ocon.webp' },
  { id: 17, name: 'Perez', color: '#101C50', img: '/drivers/perez.webp' },
  { id: 18, name: 'Piastri', color: '#FF8000', img: '/drivers/piastri.webp' },
  { id: 19, name: 'Russell', color: '#00D2BE', img: '/drivers/russell.webp' },
  { id: 20, name: 'Sainz', color: '#005AFF', img: '/drivers/sainz.webp' },
  { id: 21, name: 'Stroll', color: '#006F62', img: '/drivers/stroll.webp' },
  { id: 22, name: 'Verstappen', color: '#101C50', img: '/drivers/verstappen.webp' }
];

const MemoryGame = () => {
  // --- STATES ---
  const [user, setUser] = useState(null);
  const [view, setView] = useState('game'); 
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [movesLeft, setMovesLeft] = useState(MAX_MOVES);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'won', 'lost'
  
  // Stats
  const [stats, setStats] = useState({ f1_wins: 0, f1_matches: 0 });
  const [leaderboardData, setLeaderboardData] = useState([]);

  // --- 1. GAME SETUP (RANDOMIZER) ---
  const shuffleCards = () => {
    // 1. Randomly pick 8 drivers from the 22 available
    const shuffledPool = [...ALL_DRIVERS].sort(() => 0.5 - Math.random());
    const selectedDrivers = shuffledPool.slice(0, 8);

    // 2. Duplicate them to make pairs (16 cards total)
    const deck = [...selectedDrivers, ...selectedDrivers]
      .sort(() => Math.random() - 0.5)
      .map((driver) => ({ ...driver, u_id: Math.random() }));

    setCards(deck);
    setFlipped([]);
    setSolved([]);
    setMovesLeft(MAX_MOVES);
    setGameState('playing');
    setDisabled(false);
  };

  useEffect(() => { shuffleCards(); }, []);

  // --- 2. AUTHENTICATION ---
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      
      const userRef = doc(db, "users", result.user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, { 
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          f1_wins: 0, f1_matches: 0 
        }, { merge: true });
        setStats({ f1_wins: 0, f1_matches: 0 });
      } else {
        const data = docSnap.data();
        await setDoc(userRef, { displayName: result.user.displayName, photoURL: result.user.photoURL }, { merge: true });
        setStats({ f1_wins: data.f1_wins || 0, f1_matches: data.f1_matches || 0 });
      }
    } catch (error) { console.error("Login failed", error); }
  };

  // --- 3. LEADERBOARD ---
  const fetchLeaderboard = async () => {
    setView('leaderboard');
    const q = query(collection(db, "users"), orderBy("f1_wins", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ ...doc.data(), f1_wins: doc.data().f1_wins || 0 }));
    setLeaderboardData(data);
  };

  // --- 4. GAMEPLAY LOGIC ---
  const handleClick = (id) => {
    if (disabled || flipped.includes(id) || solved.includes(id) || gameState !== 'playing') return;
    
    // Decrease Move Count
    const newMoves = movesLeft - 1;
    setMovesLeft(newMoves);

    // Check Loss
    if (newMoves === 0) {
      setGameState('lost');
      setDisabled(true);
      return;
    }

    // Flip Logic
    if (flipped.length === 0) {
      setFlipped([id]);
      return;
    }

    setFlipped([flipped[0], id]);
    setDisabled(true);

    const firstCard = cards.find(c => c.u_id === flipped[0]);
    const secondCard = cards.find(c => c.u_id === id);

    if (firstCard.name === secondCard.name) {
      // MATCH FOUND
      setSolved((prev) => [...prev, flipped[0], id]);
      setFlipped([]);
      setDisabled(false);
      setMovesLeft((prev) => prev + 2); // Bonus Moves!
    } else {
      // NO MATCH
      setTimeout(() => {
        setFlipped([]);
        setDisabled(false);
      }, 800);
    }
  };

  // Check Win Condition
  useEffect(() => {
    if (gameState === 'playing' && cards.length > 0 && solved.length === cards.length) {
      setGameState('won');
      if (user) updateStats();
    }
  }, [solved]);

  const updateStats = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { f1_wins: increment(1), f1_matches: increment(1) });
    setStats(prev => ({ ...prev, f1_wins: prev.f1_wins + 1 }));
  };

  // --- RENDER ---
  return (
    <div className="glass-panel" style={{ 
      width: '100%', maxWidth: '500px', minHeight: '600px', 
      padding: '30px', position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column'
    }}>
      
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ 
          fontSize: '2rem', fontWeight: '800', margin: 0, 
          background: 'linear-gradient(to right, #ff4444, #ffcc00)', WebkitBackgroundClip: 'text', color: 'transparent',
          textTransform: 'uppercase', letterSpacing: '2px'
        }}>
          F1 MEMORY
        </h2>
      </div>

      {/* VIEW: GAME */}
      {view === 'game' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* Top Bar */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px', minHeight: '40px' }}>
            {!user ? (
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
                  <div style={{ fontSize: '0.7rem', color: '#00ff88' }}>Wins: {stats.f1_wins}</div>
                </div>
                <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #ff4444' }}/>
              </div>
            )}
          </div>

          {/* STATUS */}
          <div className={styles.status} style={{ 
            color: gameState === 'won' ? '#00ff88' : gameState === 'lost' ? '#ff4444' : 'white',
            textShadow: gameState === 'won' ? '0 0 20px rgba(0,255,136,0.5)' : 'none',
            fontSize: '1.2rem', marginBottom: '20px', textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
          }}>
            {gameState === 'won' && "RACE FINISHED!"}
            {gameState === 'lost' && "OUT OF MOVES!"}
            {gameState === 'playing' && (
               <>MOVES LEFT: {movesLeft} <span style={{ fontSize: '0.7rem', color: '#00ff88', border: '1px solid #00ff88', padding: '2px 6px', borderRadius: '4px' }}>Match = +2</span></>
            )}
          </div>

          {/* OVERLAY: LOST */}
          {gameState === 'lost' && (
            <div style={{ 
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
              background: 'rgba(0,0,0,0.85)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' 
            }}>
              <AlertTriangle size={64} color="#ff4444" style={{ marginBottom: '20px' }}/>
              <h2 style={{ color: '#ff4444', fontSize: '2rem', margin: 0 }}>CRASHED!</h2>
              <button onClick={shuffleCards} style={{ marginTop: '20px', padding: '15px 30px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '30px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}>RESTART RACE</button>
            </div>
          )}

          {/* GRID */}
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', 
            perspective: '1000px', flex: 1, alignContent: 'center', opacity: gameState === 'lost' ? 0.3 : 1
          }}>
            {cards.map((card) => {
              const isFlipped = flipped.includes(card.u_id) || solved.includes(card.u_id);
              return (
                <div key={card.u_id} onClick={() => handleClick(card.u_id)} style={{ 
                  aspectRatio: '1', cursor: 'pointer', position: 'relative', transformStyle: 'preserve-3d', transition: 'transform 0.4s',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}>
                  {/* FRONT */}
                  <div style={{
                    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(0,0,0,0.2))', 
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Flag size={20} color="rgba(255,255,255,0.3)"/>
                  </div>
                  {/* BACK (WITH IMAGE) */}
                  <div style={{
                    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                    background: card.color, color: 'white', transform: 'rotateY(180deg)', borderRadius: '8px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', fontWeight: 'bold', border: '2px solid white', overflow: 'hidden'
                  }}>
                    <img 
                        src={card.img} 
                        alt={card.name} 
                        onError={(e) => {e.target.style.display='none'}} // Hides broken images cleanly
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                    />
                    <div style={{
                        position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.7)',
                        color: 'white', padding: '2px 0', textAlign: 'center'
                    }}>
                        {card.name.substring(0, 3).toUpperCase()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BOTTOM BUTTONS */}
          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <Link to="/" style={{ flex: 1, textDecoration: 'none' }}>
              <button className={styles.button} style={{ width: '100%', padding: '15px', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.3)' }}><ArrowLeft size={18}/> HOME</button>
            </Link>
             <button className={styles.button} onClick={fetchLeaderboard} style={{ flex: 1, padding: '15px', background: 'rgba(255, 204, 0, 0.1)', border: '1px solid rgba(255, 204, 0, 0.3)' }}><Trophy size={18}/> RANKS</button>
            <button className={styles.button} onClick={shuffleCards} style={{ flex: 1, padding: '15px', background: 'rgba(0, 243, 255, 0.1)', border: '1px solid rgba(0, 243, 255, 0.3)' }}><RefreshCw size={18}/> RESET</button>
          </div>
        </div>
      )}

      {/* VIEW: LEADERBOARD */}
      {view === 'leaderboard' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
             <button onClick={() => setView('game')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ArrowLeft size={24}/></button>
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#ffcc00' }}>F1 Champions</h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
            {leaderboardData.map((player, index) => (
              <div key={index} style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '15px', marginBottom: '10px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ color: index===0?'#ffd700':'white', fontWeight:'bold' }}>#{index+1}</span>
                  {player.photoURL && <img src={player.photoURL} style={{ width: 40, height: 40, borderRadius: '50%' }} />}
                  <span style={{ fontWeight: 'bold' }}>{player.displayName}</span>
                </div>
                <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{player.f1_wins} W</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;