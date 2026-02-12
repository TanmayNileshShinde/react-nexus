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
        await setDoc(userRef, { 
            displayName: result.user.displayName, 
            photoURL: result.user.photoURL, 
            best_reaction: null, 
            total_xp: 0 
        }, { merge: true });
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

  // --- UI COMPONENTS ---
  const Light = ({ active }) => (
    <div style={{
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: active ? '#ff0055' : 'rgba(255, 255, 255, 0.02)',
      // Multiple shadows create the high-intensity glow effect
      boxShadow: active 
        ? '0 0 20px #ff0055, 0 0 40px #ff0055, inset 0 0 10px #ff88aa' 
        : 'inset 0 0 15px rgba(0,0,0,0.9)',
      border: active ? '2px solid #ff88aa' : '1px solid rgba(255, 255, 255, 0.05)',
      transition: 'all 0.05s ease-out',
      position: 'relative'
    }}>
        {active && <div style={{
            position: 'absolute', top: '20%', left: '20%', width: '15px', height: '10px',
            background: 'rgba(255,255,255,0.4)', borderRadius: '50%', filter: 'blur(2px)'
        }} />}
    </div>
  );

  return (
    <div className="glass-panel" style={{ 
        width: '100%', maxWidth: '500px', minHeight: '680px', 
        padding: '35px', position: 'relative', display: 'flex', flexDirection: 'column',
        border: '1px solid rgba(0, 243, 255, 0.5)',
        boxShadow: '0 0 60px rgba(0, 243, 255, 0.2)',
        background: 'rgba(15, 23, 42, 0.85)'
    }}>
      
      {/* GLOWING HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '1000',
            background: 'linear-gradient(to right, #00f3ff, #bc13fe)', 
            WebkitBackgroundClip: 'text', 
            color: 'transparent', 
            textTransform: 'uppercase',
            letterSpacing: '5px',
            margin: 0,
            filter: 'drop-shadow(0 0 15px rgba(0, 243, 255, 0.5))'
        }}>REACTION</h2>
        <div style={{ width: '60px', height: '3px', background: '#00f3ff', margin: '5px auto', boxShadow: '0 0 10px #00f3ff' }}></div>
      </div>

      {/* TOP STATS BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div style={{ fontSize: '0.8rem', color: '#888', letterSpacing: '1px' }}>SYSTEM_v2.0.26</div>
        {!user ? (
          <button onClick={handleLogin} style={{ 
            background: 'white', color: '#0f172a', border: 'none', padding: '8px 20px', 
            borderRadius: '20px', fontWeight: '900', cursor: 'pointer',
            boxShadow: '0 0 20px rgba(255,255,255,0.4)'
          }}>LOGIN</button>
        ) : (
          <div style={{ 
              background: 'rgba(255, 255, 255, 0.05)', padding: '5px 15px', borderRadius: '30px', 
              border: '1px solid #bc13fe', display: 'flex', alignItems: 'center', gap: '12px',
              boxShadow: '0 0 10px rgba(188, 19, 254, 0.2)'
          }}>
             <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'white' }}>{user.displayName.split(' ')[0]}</div>
                <div style={{ fontSize: '0.7rem', color: '#00f3ff', fontWeight: '900' }}>BEST: {bestTime || '---'}</div>
             </div>
             <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #00f3ff' }}/>
          </div>
        )}
      </div>

      {/* THE MAIN CONSOLE */}
      <div onClick={handleReaction} style={{ 
          flex: 1, 
          background: 'linear-gradient(180deg, #0a0f1e 0%, #000 100%)', 
          borderRadius: '25px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          cursor: 'pointer',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)'
      }}>
        {/* SCANLINE OVERLAY EFFECT */}
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
            backgroundSize: '100% 4px, 3px 100%', pointerEvents: 'none', zIndex: 1
        }}></div>

        {view === 'game' ? (
          <div style={{ zIndex: 2 }}>
            {gameState === 'idle' && (
              <div style={{ textAlign: 'center' }}>
                <Zap size={70} color="#00f3ff" style={{ filter: 'drop-shadow(0 0 15px #00f3ff)', animation: 'pulse 1.5s infinite' }} />
                <h2 style={{ color: '#00f3ff', letterSpacing: '5px', marginTop: '10px', fontSize: '1rem' }}>READY TO LAUNCH</h2>
              </div>
            )}
            {(gameState === 'counting' || gameState === 'ready' || gameState === 'foul') && (
              <div style={{ display: 'flex', gap: '10px' }}>
                {[1,2,3,4,5].map(i => <Light key={i} active={lights >= i} />)}
              </div>
            )}
            {gameState === 'ready' && (
                <h1 style={{ color: '#00ff88', fontSize: '6rem', fontWeight: '1000', textShadow: '0 0 40px #00ff88', margin: 0 }}>GO!</h1>
            )}
            {gameState === 'foul' && (
                <div style={{ textAlign: 'center' }}>
                    <AlertCircle size={70} color="#ff4444" style={{ filter: 'drop-shadow(0 0 20px #ff4444)' }} />
                    <h1 style={{ color: '#ff4444', letterSpacing: '2px', margin: '10px 0 0 0' }}>FOUL</h1>
                </div>
            )}
            {gameState === 'result' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', opacity: 0.5, letterSpacing: '4px' }}>REACTION_TIME</div>
                <div style={{ 
                    fontSize: '7rem', 
                    fontWeight: '1000', 
                    lineHeight: '1',
                    color: resultTime < 300 ? '#00ff88' : 'white',
                    textShadow: resultTime < 300 ? '0 0 50px rgba(0,255,136,0.6)' : 'none'
                }}>{resultTime}<span style={{ fontSize: '1.5rem', marginLeft: '5px' }}>MS</span></div>
              </div>
            )}
          </div>
        ) : (
          /* LEADERBOARD UI */
          <div style={{ width: '100%', padding: '25px', zIndex: 2, height: '100%', overflowY: 'auto' }}>
            <h3 style={{ color: '#ffcc00', textAlign: 'center', letterSpacing: '5px', fontSize: '0.9rem', marginBottom: '20px' }}>RANKING_DATA</h3>
            {leaderboard.map((u, i) => (
              <div key={i} style={{ 
                  display: 'flex', justifyContent: 'space-between', padding: '12px 18px', 
                  background: 'rgba(255,255,255,0.03)', marginBottom: '10px', borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <span style={{ fontWeight: '800', fontSize: '0.9rem' }}><span style={{ color: '#ffcc00' }}>{i+1}</span> {u.displayName.toUpperCase()}</span>
                <span style={{ color: '#00f3ff', fontWeight: '900' }}>{u.best_reaction}ms</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DYNAMIC ACTION BAR */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '15px', marginTop: '30px' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
            <button className={styles.button} style={{ 
                width: '100%', height: '55px', background: 'rgba(255, 68, 68, 0.05)', border: '1px solid rgba(255, 68, 68, 0.3)' 
            }}>
                <Home size={22} color="#ff4444" />
            </button>
        </Link>
        
        <button className={styles.button} onClick={fetchLeaderboard} style={{ 
            height: '55px', background: 'rgba(188, 19, 254, 0.05)', border: '1px solid rgba(188, 19, 254, 0.3)' 
        }}>
            {view === 'game' ? <Trophy size={22} color="#bc13fe"/> : <ArrowLeft size={22} color="#bc13fe"/>}
        </button>

        <button className={styles.button} onClick={startSequence} style={{ 
            height: '55px', background: 'rgba(0, 243, 255, 0.1)', border: '1px solid #00f3ff', 
            color: '#00f3ff', fontWeight: '1000', fontSize: '1rem', letterSpacing: '2px',
            boxShadow: '0 0 15px rgba(0, 243, 255, 0.2)'
        }}>
            <RotateCcw size={20} style={{ marginRight: '10px' }}/> 
            {gameState === 'idle' ? 'LAUNCH' : 'RESTART'}
        </button>
      </div>

    </div>
  );
};

export default ReactionGame;