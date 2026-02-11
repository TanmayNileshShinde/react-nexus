// src/pages/ReactionGame.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, User, Zap, AlertCircle, RotateCcw } from 'lucide-react';
import styles from '../styles/Game.module.css';

// FIREBASE IMPORTS
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';

const ReactionGame = () => {
  // --- STATES ---
  const [user, setUser] = useState(null);
  const [bestTime, setBestTime] = useState(null);
  const [gameState, setGameState] = useState('idle'); // 'idle', 'counting', 'ready', 'result', 'foul'
  const [lights, setLights] = useState(0); // 0 to 5 lights
  const [startTime, setStartTime] = useState(null);
  const [resultTime, setResultTime] = useState(null);
  
  const timerRef = useRef(null);

  // --- 1. AUTHENTICATION ---
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
        const data = docSnap.data();
        setBestTime(data.best_reaction);
      }
    } catch (error) { console.error("Login failed", error); }
  };

  // --- 2. GAME LOGIC ---
  const startSequence = () => {
    setGameState('counting');
    setLights(0);
    setResultTime(null);

    // Turn on lights 1-5 with 1-second intervals
    for (let i = 1; i <= 5; i++) {
      setTimeout(() => {
        setLights(i);
      }, i * 1000);
    }

    // Random delay after 5th light (2 to 5 seconds) before they go out
    const randomDelay = Math.floor(Math.random() * 3000) + 2000;
    timerRef.current = setTimeout(() => {
      setLights(0);
      setGameState('ready');
      setStartTime(performance.now()); // High-precision timer
    }, 5000 + randomDelay);
  };

  const handleReaction = () => {
    if (gameState === 'counting') {
      // CLICKED TOO EARLY (FOUL)
      clearTimeout(timerRef.current);
      setGameState('foul');
      setLights(5); // Red lights stay on
    } else if (gameState === 'ready') {
      // VALID REACTION
      const endTime = performance.now();
      const reaction = Math.round(endTime - startTime);
      setResultTime(reaction);
      setGameState('result');
      processScore(reaction);
    }
  };

  const processScore = async (time) => {
    if (!user) return;

    let xpAwarded = 10;
    if (time < 200) xpAwarded = 100;
    else if (time < 300) xpAwarded = 50;

    const userRef = doc(db, "users", user.uid);
    
    // Update Best Time if better
    if (!bestTime || time < bestTime) {
      setBestTime(time);
      await updateDoc(userRef, { 
        best_reaction: time,
        total_xp: increment(xpAwarded)
      });
    } else {
      await updateDoc(userRef, { 
        total_xp: increment(xpAwarded)
      });
    }
  };

  // --- RENDER HELPERS ---
  const Light = ({ active }) => (
    <div style={{
      width: '60px', height: '60px', borderRadius: '50%',
      backgroundColor: active ? '#ff0000' : '#222',
      boxShadow: active ? '0 0 20px #ff0000' : 'inset 0 0 10px #000',
      border: '4px solid #444'
    }} />
  );

  return (
    <div className="glass-panel" style={{ 
      width: '100%', maxWidth: '500px', minHeight: '600px', 
      padding: '30px', position: 'relative', display: 'flex', flexDirection: 'column'
    }}>
      
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ 
          fontSize: '2rem', fontWeight: '800', margin: 0, 
          background: 'linear-gradient(to right, #ff0000, #ff8888)', WebkitBackgroundClip: 'text', color: 'transparent',
          textTransform: 'uppercase', letterSpacing: '2px'
        }}>
          REACTION TEST
        </h2>
      </div>

      {/* USER PROFILE */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
        {!user ? (
          <button onClick={handleLogin} style={{ 
            background: 'white', color: '#0f172a', border: 'none', padding: '8px 16px', 
            borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer'
          }}>Login with Google</button>
        ) : (
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '5px 15px', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{user.displayName}</div>
                <div style={{ fontSize: '0.7rem', color: '#ff0000' }}>Best: {bestTime ? `${bestTime}ms` : '---'}</div>
             </div>
             <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" style={{ width: 32, height: 32, borderRadius: '50%' }}/>
          </div>
        )}
      </div>

      {/* GAME AREA */}
      <div 
        onClick={handleReaction}
        style={{ 
          flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
        }}
      >
        {gameState === 'idle' && (
          <div style={{ textAlign: 'center' }}>
            <Zap size={64} color="#ffcc00" style={{ marginBottom: '20px' }} />
            <h3>ARE YOU READY?</h3>
            <button className={styles.button} onClick={(e) => { e.stopPropagation(); startSequence(); }} style={{ padding: '15px 30px' }}>START START START</button>
          </div>
        )}

        {(gameState === 'counting' || gameState === 'ready' || gameState === 'foul') && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Light active={lights >= 1} />
            <Light active={lights >= 2} />
            <Light active={lights >= 3} />
            <Light active={lights >= 4} />
            <Light active={lights >= 5} />
          </div>
        )}

        {gameState === 'ready' && (
          <h2 style={{ position: 'absolute', bottom: '100px', color: '#00ff88' }}>GO! GO! GO!</h2>
        )}

        {gameState === 'foul' && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <AlertCircle size={48} color="#ff4444" />
            <h2 style={{ color: '#ff4444' }}>JUMP START!</h2>
            <button className={styles.button} onClick={(e) => { e.stopPropagation(); startSequence(); }}>TRY AGAIN</button>
          </div>
        )}

        {gameState === 'result' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', opacity: 0.6 }}>YOUR TIME</div>
            <div style={{ fontSize: '4rem', fontWeight: '900', color: resultTime < 300 ? '#00ff88' : 'white' }}>
              {resultTime}ms
            </div>
            <p>{resultTime < 200 ? "⚡ GODLIKE REFLEXES!" : resultTime < 300 ? "🏎️ PRO DRIVER!" : "🐌 KEEP PRACTICING!"}</p>
            <button className={styles.button} onClick={(e) => { e.stopPropagation(); startSequence(); }}>
              <RotateCcw size={18}/> RETRY
            </button>
          </div>
        )}
      </div>

      {/* NAVIGATION */}
      <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
        <Link to="/" style={{ flex: 1, textDecoration: 'none' }}>
          <button className={styles.button} style={{ width: '100%', padding: '15px' }}><ArrowLeft size={18}/> HOME</button>
        </Link>
        <button className={styles.button} style={{ flex: 1, padding: '15px' }}><Trophy size={18}/> RANKS</button>
      </div>
    </div>
  );
};

export default ReactionGame;