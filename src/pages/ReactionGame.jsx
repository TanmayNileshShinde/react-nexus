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

  // --- UI COMPONENTS ---
  const Light = ({ active }) => (
    <div style={{
      width: '60px', height: '60px', borderRadius: '50%',
      backgroundColor: active ? '#ff0055' : 'rgba(255, 255, 255, 0.03)',
      boxShadow: active ? '0 0 25px #ff0055, 0 0 50px #ff0055' : 'inset 0 0 10px rgba(0,0,0,0.8)',
      border: active ? '2px solid #ff88aa' : '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'all 0.1s ease'
    }} />
  );

  return (
    <div className="glass-panel" style={{ 
        width: '100%', maxWidth: '500px', minHeight: '650px', 
        padding: '35px', position: 'relative', display: 'flex', flexDirection: 'column',
        border: '1px solid rgba(0, 243, 255, 0.4)',
        boxShadow: '0 0 50px rgba(0, 243, 255, 0.15)'
    }}>
      
      {/* TITLE SECTION */}
      <h2 style={{ 
          textAlign: 'center', 
          fontSize: '2.4rem', 
          fontWeight: '950',
          background: 'linear-gradient(to right, #00f3ff, #bc13fe)', 
          WebkitBackgroundClip: 'text', 
          color: 'transparent', 
          textTransform: 'uppercase',
          letterSpacing: '4px',
          margin: '0 0 20px 0',
          filter: 'drop-shadow(0 0 10px rgba(188, 19, 254, 0.3))'
      }}>REACTION</h2>

      {/* USER PROFILE PILL */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '25px' }}>
        {!user ? (
          <button onClick={handleLogin} style={{ 
            background: 'white', color: '#0f172a', border: 'none', padding: '10px 22px', 
            borderRadius: '25px', fontWeight: '900', cursor: 'pointer',
            boxShadow: '0 0 20px rgba(255,255,255,0.4)'
          }}>LOGIN</button>
        ) : (
          <div style={{ 
              background: 'rgba(15, 23, 42, 0.6)', padding: '8px 20px', borderRadius: '40px', 
              border: '1px solid #bc13fe', display: 'flex', alignItems: 'center', gap: '15px',
              boxShadow: '0 0 15px rgba(188, 19, 254, 0.2)'
          }}>
             <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>{user.displayName}</div>
                <div style={{ fontSize: '0.75rem', color: '#00f3ff', fontWeight: '800' }}>{bestTime ? `${bestTime}MS` : '---'}</div>
             </div>
             <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid #00f3ff' }}/>
          </div>
        )}
      </div>

      {/* MAIN GAME CONSOLE */}
      <div onClick={handleReaction} style={{ 
          flex: 1, 
          background: 'rgba(0, 0, 0, 0.4)', 
          borderRadius: '30px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          cursor: 'pointer',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative',
          overflow: 'hidden'
      }}>
        {view === 'game' ? (
          <>
            {gameState === 'idle' && (
              <div style={{ textAlign: 'center', animation: 'pulse 2s infinite' }}>
                <Zap size={85} color="#00f3ff" style={{ filter: 'drop-shadow(0 0 20px #00f3ff)' }} />
                <h2 style={{ color: '#00f3ff', letterSpacing: '5px', marginTop: '15px' }}>STANDBY</h2>
              </div>
            )}
            {(gameState === 'counting' || gameState === 'ready' || gameState === 'foul') && (
              <div style={{ display: 'flex', gap: '12px' }}>
                {[1,2,3,4,5].map(i => <Light key={i} active={lights >= i} />)}
              </div>
            )}
            {gameState === 'ready' && (
                <h1 style={{ color: '#00ff88', fontSize: '5rem', fontWeight: '950', textShadow: '0 0 40px #00ff88' }}>GO!</h1>
            )}
            {gameState === 'foul' && (
                <div style={{ textAlign: 'center' }}>
                    <AlertCircle size={70} color="#ff4444" style={{ filter: 'drop-shadow(0 0 15px #ff4444)' }} />
                    <h2 style={{ color: '#ff4444', letterSpacing: '2px' }}>FALSE START</h2>
                </div>
            )}
            {gameState === 'result' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', opacity: 0.5, letterSpacing: '3px' }}>REACTION</div>
                <div style={{ 
                    fontSize: '6rem', 
                    fontWeight: '1000', 
                    color: resultTime < 300 ? '#00ff88' : 'white',
                    textShadow: resultTime < 300 ? '0 0 50px rgba(0,255,136,0.5)' : 'none'
                }}>{resultTime}<span style={{ fontSize: '2rem' }}>ms</span></div>
              </div>
            )}
          </>
        ) : (
          /* LEADERBOARD UI */
          <div style={{ width: '100%', padding: '20px', height: '100%', overflowY: 'auto' }}>
            <h3 style={{ color: '#ffcc00', textAlign: 'center', letterSpacing: '3px', marginBottom: '20px' }}>HALL OF FAME</h3>
            {leaderboard.map((u, i) => (
              <div key={i} style={{ 
                  display: 'flex', justifyContent: 'space-between', padding: '15px', 
                  background: 'rgba(255,255,255,0.04)', marginBottom: '8px', borderRadius: '15px',
                  border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <span style={{ fontWeight: '800' }}><span style={{ color: '#ffcc00' }}>#{i+1}</span> {u.displayName}</span>
                <span style={{ color: '#00f3ff', fontWeight: '900' }}>{u.best_reaction}ms</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTTOM CONTROL BAR */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
        <Link to="/" style={{ flex: 1, textDecoration: 'none' }}>
            <button className={styles.button} style={{ width: '100%', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.4)' }}>
                <Home size={20}/>
            </button>
        </Link>
        
        <button className={styles.button} onClick={fetchLeaderboard} style={{ 
            flex: 1, background: 'rgba(188, 19, 254, 0.1)', border: '1px solid rgba(188, 19, 254, 0.5)' 
        }}>
            {view === 'game' ? <><Trophy size={20}/></> : <><ArrowLeft size={20}/></>}
        </button>

        <button className={styles.button} onClick={startSequence} style={{ 
            flex: 2, background: 'rgba(0, 243, 255, 0.15)', border: '1px solid #00f3ff', color: '#00f3ff', fontWeight: '900' 
        }}>
            <RotateCcw size={20} style={{ marginRight: '10px' }}/> 
            {gameState === 'idle' ? 'LAUNCH' : 'RE-RUN'}
        </button>
      </div>

    </div>
  );
};

export default ReactionGame;