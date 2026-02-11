// src/pages/MemoryGame.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trophy, User, Flag } from 'lucide-react';
import styles from '../styles/Game.module.css';

// FIREBASE IMPORTS
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

// F1 DRIVER DATA
const DRIVERS = [
  { id: 1, name: 'Verstappen', color: '#101C50', text: '#fff' }, // Red Bull
  { id: 2, name: 'Hamilton', color: '#00D2BE', text: '#000' },   // Mercedes
  { id: 3, name: 'Leclerc', color: '#EF1A2D', text: '#fff' },    // Ferrari
  { id: 4, name: 'Norris', color: '#FF8000', text: '#000' },     // McLaren
  { id: 5, name: 'Alonso', color: '#006F62', text: '#fff' },     // Aston Martin
  { id: 6, name: 'Piastri', color: '#FF8000', text: '#000' },    // McLaren
  { id: 7, name: 'Russell', color: '#00D2BE', text: '#000' },    // Mercedes
  { id: 8, name: 'Sainz', color: '#EF1A2D', text: '#fff' },      // Ferrari
];

const MemoryGame = () => {
  // --- STATES ---
  const [user, setUser] = useState(null);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [moves, setMoves] = useState(0);
  const [stats, setStats] = useState({ wins: 0, matches: 0 });

  // Leaderboard States
  const [view, setView] = useState('game'); // 'game', 'leaderboard'
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- 1. INITIALIZE GAME ---
  const shuffleCards = () => {
    // Duplicate drivers to make pairs (8 drivers * 2 = 16 cards)
    const shuffled = [...DRIVERS, ...DRIVERS]
      .sort(() => Math.random() - 0.5)
      .map((driver) => ({ ...driver, u_id: Math.random() })); // Unique ID for React Key

    setCards(shuffled);
    setFlipped([]);
    setSolved([]);
    setMoves(0);
    setDisabled(false);
  };

  useEffect(() => {
    shuffleCards();
  }, []);

  // --- 2. AUTHENTICATION ---
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      const userRef = doc(db, "users", result.user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) setStats(docSnap.data());
      else {
         await setDoc(userRef, { displayName: result.user.displayName, photoURL: result.user.photoURL, wins: 0, matches: 0, winRate: 0 });
         setStats({ wins: 0, matches: 0 });
      }
    } catch (error) { console.error("Login failed", error); }
  };

  // --- 3. GAME LOGIC ---
  const handleClick = (id) => {
    if (disabled || flipped.includes(id) || solved.includes(id)) return;
    
    // Flip Logic
    if (flipped.length === 0) {
      setFlipped([id]);
      return;
    }

    // Second Card Clicked
    setFlipped([flipped[0], id]);
    setDisabled(true);
    setMoves((prev) => prev + 1);

    // Check Match
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
      wins: increment(1), // Winning Memory = 1 Win
      matches: increment(1)
    });
    // Update local UI
    setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
  };

  // --- 4. LEADERBOARD ---
  const fetchLeaderboard = async () => {
    setView('leaderboard');
    setIsLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("wins", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      setLeaderboardData(querySnapshot.docs.map(doc => doc.data()));
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  // --- RENDER ---
  return (
    <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', minHeight: '600px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ textAlign: 'left' }}>
           <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#ff4444' }}>F1 MEMORY</h2>
           <p style={{ margin: 0, opacity: 0.6, fontSize: '0.8rem' }}>Moves: {moves}</p>
        </div>

        {/* LOGIN BUTTON / USER INFO */}
        {!user ? (
          <button onClick={handleLogin} style={{ background: 'white', color: '#333', border: 'none', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <User size={16}/> Login
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{user.displayName}</div>
              <div style={{ fontSize: '0.7rem', color: '#00ff88' }}>Wins: {stats.wins}</div>
            </div>
            <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #ff4444' }}/>
          </div>
        )}
      </div>

      {/* VIEW: GAME GRID */}
      {view === 'game' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {solved.length === cards.length && cards.length > 0 ? (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
               <Flag size={64} color="#00ff88"/>
               <h1>RACE FINISHED!</h1>
               <p>You matched all drivers in {moves} moves.</p>
               <button onClick={shuffleCards} style={{ background: '#00ff88', color: '#000', border: 'none', padding: '15px 30px', borderRadius: '10px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}>
                 RACE AGAIN
               </button>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', flex: 1
            }}>
              {cards.map((card) => {
                const isFlipped = flipped.includes(card.u_id) || solved.includes(card.u_id);
                return (
                  <div key={card.u_id} onClick={() => handleClick(card.u_id)} style={{ 
                    aspectRatio: '1', cursor: 'pointer', borderRadius: '8px', 
                    perspective: '1000px', position: 'relative'
                  }}>
                    <div style={{
                      width: '100%', height: '100%', position: 'relative', 
                      transformStyle: 'preserve-3d', transition: 'transform 0.4s',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}>
                      {/* FRONT (Hidden) */}
                      <div style={{
                        position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                        background: 'linear-gradient(45deg, #111, #222)', border: '2px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Flag size={24} color="rgba(255,255,255,0.2)"/>
                      </div>

                      {/* BACK (Revealed) */}
                      <div style={{
                        position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                        background: card.color, color: card.text,
                        transform: 'rotateY(180deg)', borderRadius: '8px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 'bold', border: '2px solid white'
                      }}>
                        <img 
                          src={`https://ui-avatars.com/api/?name=${card.name}&background=random&color=fff&bold=true`} 
                          alt={card.name} 
                          style={{ width: '60%', borderRadius: '50%', marginBottom: '5px' }}
                        />
                        {card.name.toUpperCase()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <Link to="/" style={{ flex: 1, textDecoration: 'none' }}>
               <button className={styles.button} style={{ width: '100%' }}><ArrowLeft size={16}/> Home</button>
            </Link>
            <button className={styles.button} onClick={fetchLeaderboard}><Trophy size={16}/> Ranks</button>
            <button className={styles.button} onClick={shuffleCards}><RefreshCw size={16}/> Restart</button>
          </div>
        </div>
      )}

      {/* VIEW: LEADERBOARD (Reused Logic) */}
      {view === 'leaderboard' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <button onClick={() => setView('game')} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ArrowLeft size={18}/> Back to Race
          </button>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {leaderboardData.map((player, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'rgba(255,255,255,0.05)', marginBottom: '5px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>#{index+1}</span>
                  <span>{player.displayName}</span>
                </div>
                <span style={{ color: '#00ff88' }}>{player.wins} Wins</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default MemoryGame;