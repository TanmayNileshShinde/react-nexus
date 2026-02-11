// src/pages/MemoryGame.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trophy, User, Grid, Flag } from 'lucide-react';
import styles from '../styles/Game.module.css';

// FIREBASE IMPORTS
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

// F1 DRIVER DATA
const DRIVERS = [
  { id: 1, name: 'Verstappen', color: '#101C50', text: '#fff' },
  { id: 2, name: 'Hamilton', color: '#00D2BE', text: '#000' },
  { id: 3, name: 'Leclerc', color: '#EF1A2D', text: '#fff' },
  { id: 4, name: 'Norris', color: '#FF8000', text: '#000' },
  { id: 5, name: 'Alonso', color: '#006F62', text: '#fff' },
  { id: 6, name: 'Piastri', color: '#FF8000', text: '#000' },
  { id: 7, name: 'Russell', color: '#00D2BE', text: '#000' },
  { id: 8, name: 'Sainz', color: '#EF1A2D', text: '#fff' },
];

const MemoryGame = () => {
  // --- STATES ---
  const [user, setUser] = useState(null);
  const [view, setView] = useState('game'); // 'game', 'leaderboard'
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [moves, setMoves] = useState(0);
  
  // Specific Stats for F1 Game
  const [stats, setStats] = useState({ f1_wins: 0, f1_matches: 0 });
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- 1. GAME SETUP ---
  const shuffleCards = () => {
    const shuffled = [...DRIVERS, ...DRIVERS]
      .sort(() => Math.random() - 0.5)
      .map((driver) => ({ ...driver, u_id: Math.random() }));

    setCards(shuffled);
    setFlipped([]);
    setSolved([]);
    setMoves(0);
    setDisabled(false);
  };

  useEffect(() => { shuffleCards(); }, []);

  // --- 2. AUTHENTICATION & DATA SYNC ---
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      
      const userRef = doc(db, "users", result.user.uid);
      const docSnap = await getDoc(userRef);

      // Initialize F1 stats if they don't exist
      if (!docSnap.exists()) {
        await setDoc(userRef, { 
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          f1_wins: 0, f1_matches: 0 
        }, { merge: true });
        setStats({ f1_wins: 0, f1_matches: 0 });
      } else {
        const data = docSnap.data();
        await setDoc(userRef, { 
          displayName: result.user.displayName,
          photoURL: result.user.photoURL 
        }, { merge: true });
        // Load existing F1 stats or default to 0
        setStats({ f1_wins: data.f1_wins || 0, f1_matches: data.f1_matches || 0 });
      }
    } catch (error) { console.error("Login failed", error); }
  };

  // --- 3. LEADERBOARD (Fetches f1_wins) ---
  const fetchLeaderboard = async () => {
    setView('leaderboard');
    setIsLoading(true);
    try {
      // Query specific to F1 Wins
      const q = query(collection(db, "users"), orderBy("f1_wins", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => {
        const d = doc.data();
        return { ...d, f1_wins: d.f1_wins || 0 }; 
      });
      setLeaderboardData(data);
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  // --- 4. GAMEPLAY LOGIC ---
  const handleClick = (id) => {
    if (disabled || flipped.includes(id) || solved.includes(id)) return;
    
    if (flipped.length === 0) {
      setFlipped([id]);
      return;
    }

    setFlipped([flipped[0], id]);
    setDisabled(true);
    setMoves((prev) => prev + 1);

    const firstCard = cards.find(c => c.u_id === flipped[0]);
    const secondCard = cards.find(c => c.u_id === id);

    if (firstCard.name === secondCard.name) {
      setSolved((prev) => [...prev, flipped[0], id]);
      setFlipped([]);
      setDisabled(false);
    } else {
      setTimeout(() => {
        setFlipped([]);
        setDisabled(false);
      }, 800);
    }
  };

  // Check Win Condition
  useEffect(() => {
    if (cards.length > 0 && solved.length === cards.length) {
      if (user) updateStats();
    }
  }, [solved]);

  const updateStats = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      f1_wins: increment(1), 
      f1_matches: increment(1)
    });
    setStats(prev => ({ ...prev, f1_wins: prev.f1_wins + 1 }));
  };

  // --- RENDER ---
  return (
    <div className="glass-panel" style={{ 
      width: '100%', maxWidth: '500px', minHeight: '600px', 
      padding: '30px', position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column'
    }}>
      
      {/* HEADER (Same as TicTacToe) */}
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
          
          {/* Top Bar (Login/Stats) */}
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
                <img 
                  src={user.photoURL} 
                  alt="User" 
                  referrerPolicy="no-referrer"
                  style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #ff4444' }}
                />
              </div>
            )}
          </div>

          {/* Game Status */}
          <div className={styles.status} style={{ 
            color: solved.length === cards.length ? '#00ff88' : 'white',
            textShadow: solved.length === cards.length ? '0 0 20px rgba(0,255,136,0.5)' : 'none',
            fontSize: '1.2rem', marginBottom: '20px', textAlign: 'center'
          }}>
            {solved.length === cards.length ? "RACE FINISHED!" : `MOVES: ${moves}`}
          </div>

          {/* Grid Area */}
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', 
            perspective: '1000px', flex: 1, alignContent: 'center'
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
                  {/* BACK */}
                  <div style={{
                    position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                    background: card.color, color: card.text, transform: 'rotateY(180deg)', borderRadius: '8px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', fontWeight: 'bold', border: '2px solid white'
                  }}>
                    <img src={`https://ui-avatars.com/api/?name=${card.name}&background=random&color=fff&bold=true`} style={{ width: '60%', borderRadius: '50%', marginBottom: '2px' }}/>
                    {card.name.substring(0, 3).toUpperCase()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Buttons (Matched TicTacToe Style) */}
          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <Link to="/" style={{ flex: 1, textDecoration: 'none' }}>
              <button className={styles.button} style={{ width: '100%', padding: '15px', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.3)' }}>
                <ArrowLeft size={18}/> HOME
              </button>
            </Link>
             <button className={styles.button} onClick={fetchLeaderboard} style={{ flex: 1, padding: '15px', background: 'rgba(255, 204, 0, 0.1)', border: '1px solid rgba(255, 204, 0, 0.3)' }}>
              <Trophy size={18}/> RANKS
            </button>
            <button className={styles.button} onClick={shuffleCards} style={{ flex: 1, padding: '15px', background: 'rgba(0, 243, 255, 0.1)', border: '1px solid rgba(0, 243, 255, 0.3)' }}>
              <RefreshCw size={18}/> RESET
            </button>
          </div>
        </div>
      )}

      {/* VIEW: LEADERBOARD (Identical Style) */}
      {view === 'leaderboard' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
             <button onClick={() => setView('game')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={24}/>
            </button>
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#ffcc00' }}>F1 Champions</h3>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
            {isLoading ? (
               <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '50px' }}>Fetching Data...</div>
            ) : leaderboardData.length === 0 ? (
               <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '50px' }}>No races yet.</div>
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
                      <img src={player.photoURL} alt="Player" referrerPolicy="no-referrer" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{player.displayName || "Unknown"}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Racer</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#00ff88', fontWeight: 'bold', fontSize: '1.1rem' }}>{player.f1_wins} W</div>
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

export default MemoryGame;