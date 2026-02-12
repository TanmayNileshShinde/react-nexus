// src/pages/ReactionGame.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Zap, AlertCircle, RotateCcw, Home } from 'lucide-react';
import styles from '../styles/Game.module.css';

// FIREBASE IMPORTS
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const ReactionGame = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('game'); 
  const [bestTime, setBestTime] = useState(null);
  const [gameState, setGameState] = useState('idle'); 
  const [lights, setLights] = useState(0); 
  const [startTime, setStartTime] = useState(null);
  const [resultTime, setResultTime] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const timerRef = useRef(null);

  // --- AUTH ---
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      const userRef = doc(db, "users", result.user.uid);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        await setDoc(userRef, { displayName: result.user.displayName, photoURL: result.user.photoURL, best_reaction: null, total_xp: 0 }, { merge: true });
      } else {
        setBestTime(docSnap.data().best_reaction);
      }
    } catch (error) { console.error("Login failed", error); }
  };

  // --- GAME LOGIC ---
  const startSequence = () => {
    setView('game');
    setGameState('counting');
    setLights(0);
    setResultTime(null);
    for (let i = 1; i <= 5; i++) {
      setTimeout(() => { setLights(i); }, i * 1000);
    }
    const randomDelay = Math.floor(Math.random() * 3000) + 2000;
    timerRef.current = setTimeout(() => {
      setLights(0);
      setGameState('ready');
      setStartTime(performance.now());
    }, 5000 + randomDelay);
  };

  const handleReaction = () => {
    if (gameState === 'counting') {
      clearTimeout(timerRef.current);
      setGameState('foul');
      setLights(5);
    } else if (gameState === 'ready') {
      const reaction = Math.round(performance.now() - startTime);
      setResultTime(reaction);
      setGameState('result');
      processScore(reaction);
    }
  };

  const processScore = async (time) => {
    if (!user) return;
    let xpAwarded = time < 200 ? 100 : time < 300 ? 50 : 10;
    const userRef = doc(db, "users", user.uid);
    if (!bestTime || time < bestTime) {
      setBestTime(time);
      await updateDoc(userRef, { best_reaction: time, total_xp: increment(xpAwarded) });
    } else {
      await updateDoc(userRef, { total_xp: increment(xpAwarded) });
    }
  };

  const fetchLeaderboard = async () => {
    if (view === 'game') {
      setView('leaderboard');
      const q = query(collection(db, "users"), orderBy("best_reaction", "asc"), limit(10));
      const snap = await getDocs(q);
      setLeaderboard(snap.docs.map(d => d.data()).filter(u => u.best_reaction !== null));
    } else {
      setView('game');
    }
  };

  // Helper for Rank Colors
  const getRankStyle = (index) => {
    if (index === 0) return { border: '2px solid #FFD700', boxShadow: '0 0 15px #FFD700', background: 'rgba(255, 215, 0, 0.1)' }; // Gold
    if (index === 1) return { border: '2px solid #C0C0C0', boxShadow: '0 0 15px #C0C0C0', background: 'rgba(192, 192, 192, 0.1)' }; // Silver
    if (index === 2) return { border: '2px solid #CD7F32', boxShadow: '0 0 15px #CD7F32', background: 'rgba(205, 127, 50, 0.1)' }; // Bronze
    return { border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.03)' };
  };

  // --- LIGHT COMPONENT ---
  const Light = ({ active }) => (
    <div style={{
      width: '60px', height: '60px', borderRadius: '50%',
      backgroundColor: active ? '#ff0055' : 'rgba(255, 255, 255, 0.05)',
      boxShadow: active 
        ? '0 0 25px #ff0055, 0 0 50px #ff0055, inset 0 0 15px #ff88aa' 
        : 'inset 0 0 10px rgba(0,0,0,0.8)',
      border: active ? '2px solid #ff88aa' : '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'all 0.05s ease-out'
    }} />
  );

  return (
    <div className="glass-panel" style={{ 
        width: '100%', maxWidth: '500px', minHeight: '680px', 
        padding: '30px', position: 'relative', display: 'flex', flexDirection: 'column',
        border: '1px solid rgba(0, 243, 255, 0.3)',
        boxShadow: '0 0 40px rgba(0, 243, 255, 0.15)'
    }}>
      
      {/* HEADER */}
      <h2 style={{ 
          textAlign: 'center', fontSize: '2.5rem', fontWeight: '900',
          background: 'linear-gradient(to right, #00f3ff, #bc13fe)', 
          WebkitBackgroundClip: 'text', color: 'transparent', 
          textTransform: 'uppercase', letterSpacing: '4px', margin: '0 0 20px 0'
      }}>REACTION</h2>

      {/* USER PROFILE */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        {!user ? (
          <button onClick={handleLogin} style={{ 
            background: 'white', color: '#0f172a', border: 'none', padding: '10px 20px', 
            borderRadius: '25px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 0 15px rgba(255,255,255,0.3)'
          }}>Login with Google</button>
        ) : (
          <div style={{ 
              background: 'rgba(15, 23, 42, 0.8)', padding: '6px 16px', borderRadius: '30px', 
              border: '1px solid rgba(188, 19, 254, 0.5)', display: 'flex', alignItems: 'center', gap: '12px',
              boxShadow: '0 0 10px rgba(188, 19, 254, 0.2)'
          }}>
             <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'white' }}>{user.displayName}</div>
                <div style={{ fontSize: '0.75rem', color: '#00f3ff', fontWeight: '800' }}>BEST: {bestTime ? `${bestTime}ms` : '---'}</div>
             </div>
             <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid #00f3ff' }}/>
          </div>
        )}
      </div>

      {/* MAIN DISPLAY AREA */}
      <div onClick={handleReaction} style={{ 
          flex: 1, 
          background: 'rgba(0, 0, 0, 0.5)', 
          borderRadius: '25px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          cursor: 'pointer',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
      }}>
        {view === 'game' ? (
          <>
            {gameState === 'idle' && (
              <div style={{ textAlign: 'center' }}>
                <Zap size={80} color="#00f3ff" style={{ filter: 'drop-shadow(0 0 20px #00f3ff)' }} />
                <h3 style={{ color: '#00f3ff', letterSpacing: '4px', marginTop: '15px', opacity: 0.9 }}>SYSTEM READY</h3>
              </div>
            )}
            {(gameState === 'counting' || gameState === 'ready' || gameState === 'foul') && (
              <div style={{ display: 'flex', gap: '12px' }}>
                {[1,2,3,4,5].map(i => <Light key={i} active={lights >= i} />)}
              </div>
            )}
            {gameState === 'ready' && <h1 style={{ color: '#00ff88', fontSize: '5rem', fontWeight: '900', textShadow: '0 0 40px #00ff88', margin: 0 }}>GO!</h1>}
            {gameState === 'foul' && (
                <div style={{ textAlign: 'center' }}>
                    <AlertCircle size={60} color="#ff4444" style={{ filter: 'drop-shadow(0 0 15px #ff4444)' }} />
                    <h2 style={{ color: '#ff4444', textShadow: '0 0 20px #ff4444', marginTop: '10px' }}>JUMP START!</h2>
                </div>
            )}
            {gameState === 'result' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', opacity: 0.8, color: '#ccc', letterSpacing: '2px' }}>REACTION TIME</div>
                <div style={{ 
                    fontSize: '6rem', fontWeight: '900', color: resultTime < 300 ? '#00ff88' : 'white',
                    textShadow: resultTime < 300 ? '0 0 50px rgba(0,255,136,0.6)' : 'none'
                }}>{resultTime}<span style={{ fontSize: '1.5rem', color: '#888' }}>ms</span></div>
              </div>
            )}
          </>
        ) : (
          /* --- IMPROVED LEADERBOARD UI --- */
          <div style={{ width: '100%', padding: '20px', height: '100%', overflowY: 'auto' }}>
            <h3 style={{ color: '#00f3ff', textAlign: 'center', letterSpacing: '3px', marginBottom: '20px', textShadow: '0 0 10px #00f3ff' }}>GLOBAL RANKING</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {leaderboard.map((u, i) => (
                <div key={i} style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 18px', 
                    borderRadius: '12px',
                    ...getRankStyle(i) // Applies Gold/Silver/Bronze styles
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      fontSize: '1.2rem', fontWeight: '900', 
                      color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#888' 
                    }}>#{i+1}</span>
                    <span style={{ fontWeight: 'bold', color: 'white', fontSize: '1rem' }}>{u.displayName}</span>
                  </div>
                  <span style={{ color: '#00f3ff', fontWeight: '900', fontSize: '1.1rem', textShadow: '0 0 5px #00f3ff' }}>{u.best_reaction}ms</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* NAVIGATION BAR */}
      <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
        <Link to="/" style={{ flex: 1, textDecoration: 'none' }}>
            <button className={styles.button} style={{ 
                width: '100%', height: '50px', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.4)' 
            }}>
                <Home size={20} color="#ff4444"/>
            </button>
        </Link>
        
        <button className={styles.button} onClick={fetchLeaderboard} style={{ 
            flex: 1, height: '50px', background: 'rgba(188, 19, 254, 0.1)', border: '1px solid rgba(188, 19, 254, 0.5)' 
        }}>
            {view === 'game' ? <Trophy size={20} color="#bc13fe"/> : <ArrowLeft size={20} color="#bc13fe"/>}
        </button>

        <button className={styles.button} onClick={startSequence} style={{ 
            flex: 2, height: '50px', background: 'rgba(0, 243, 255, 0.15)', border: '1px solid #00f3ff', 
            color: '#00f3ff', fontWeight: 'bold', letterSpacing: '1px',
            boxShadow: '0 0 15px rgba(0, 243, 255, 0.2)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <RotateCcw size={20} /> 
                {gameState === 'idle' ? 'LAUNCH' : 'RESTART'}
            </div>
        </button>
      </div>

    </div>
  );
};

export default ReactionGame;