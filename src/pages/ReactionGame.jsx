// src/pages/ReactionGame.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Zap, AlertCircle, RotateCcw } from 'lucide-react';
import styles from '../styles/Game.module.css';

// FIREBASE IMPORTS
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';

const ReactionGame = () => {
  const [user, setUser] = useState(null);
  const [bestTime, setBestTime] = useState(null);
  const [gameState, setGameState] = useState('idle'); 
  const [lights, setLights] = useState(0); 
  const [startTime, setStartTime] = useState(null);
  const [resultTime, setResultTime] = useState(null);
  const timerRef = useRef(null);

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

  const startSequence = () => {
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

  const Light = ({ active }) => (
    <div style={{
      width: '65px', height: '65px', borderRadius: '50%',
      backgroundColor: active ? '#ff0055' : 'rgba(255, 255, 255, 0.05)',
      boxShadow: active ? '0 0 30px #ff0055, 0 0 60px #ff0055' : 'inset 0 0 15px rgba(0,0,0,0.5)',
      border: active ? '2px solid #ff88aa' : '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'all 0.1s ease-in-out'
    }} />
  );

  return (
    <div className="glass-panel" style={{ 
        width: '100%', maxWidth: '500px', minHeight: '600px', 
        padding: '30px', position: 'relative', display: 'flex', flexDirection: 'column',
        border: '1px solid rgba(0, 243, 255, 0.3)',
        boxShadow: '0 0 40px rgba(0, 243, 255, 0.1)'
    }}>
      
      <h2 style={{ 
          textAlign: 'center', 
          fontSize: '2.2rem', 
          fontWeight: '900',
          background: 'linear-gradient(to right, #00f3ff, #bc13fe)', 
          WebkitBackgroundClip: 'text', 
          color: 'transparent', 
          textTransform: 'uppercase',
          letterSpacing: '3px',
          marginBottom: '20px'
      }}>REACTION NEXUS</h2>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
        {!user ? (
          <button onClick={handleLogin} style={{ 
            background: 'white', color: '#0f172a', border: 'none', padding: '10px 20px', 
            borderRadius: '25px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 0 15px rgba(255,255,255,0.3)'
          }}>Login with Google</button>
        ) : (
          <div style={{ background: 'rgba(255, 255, 255, 0.07)', padding: '8px 18px', borderRadius: '30px', border: '1px solid rgba(188, 19, 254, 0.4)', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>{user.displayName}</div>
                <div style={{ fontSize: '0.75rem', color: '#00f3ff', fontWeight: 'bold' }}>BEST: {bestTime ? `${bestTime}ms` : '---'}</div>
             </div>
             <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" style={{ width: 35, height: 35, borderRadius: '50%', border: '2px solid #bc13fe' }}/>
          </div>
        )}
      </div>

      <div onClick={handleReaction} style={{ 
          flex: 1, 
          background: 'rgba(255, 255, 255, 0.03)', 
          borderRadius: '25px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          cursor: 'pointer',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          transition: 'background 0.3s'
      }}>
        {gameState === 'idle' && (
          <div style={{ textAlign: 'center' }}>
            <Zap size={80} color="#00f3ff" style={{ filter: 'drop-shadow(0 0 15px #00f3ff)', marginBottom: '20px' }} />
            <h3 style={{ letterSpacing: '2px', opacity: 0.8 }}>SYSTEMS READY</h3>
            <button className={styles.button} onClick={(e) => { e.stopPropagation(); startSequence(); }} style={{ 
                marginTop: '20px', padding: '15px 40px', background: 'rgba(0, 243, 255, 0.1)', border: '1px solid #00f3ff', color: '#00f3ff' 
            }}>INITIATE START</button>
          </div>
        )}

        {(gameState === 'counting' || gameState === 'ready' || gameState === 'foul') && (
          <div style={{ display: 'flex', gap: '12px' }}>
            {[1,2,3,4,5].map(i => <Light key={i} active={lights >= i} />)}
          </div>
        )}

        {gameState === 'ready' && (
            <h1 style={{ color: '#00ff88', fontSize: '3.5rem', fontWeight: '900', textShadow: '0 0 30px #00ff88', marginTop: '40px' }}>GO!</h1>
        )}

        {gameState === 'foul' && (
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <AlertCircle size={60} color="#ff4444" style={{ filter: 'drop-shadow(0 0 10px #ff4444)' }} />
            <h2 style={{ color: '#ff4444', textShadow: '0 0 15px #ff4444' }}>JUMP START!</h2>
            <button className={styles.button} onClick={(e) => { e.stopPropagation(); startSequence(); }} style={{ marginTop: '20px', border: '1px solid #ff4444', color: '#ff4444' }}>RESET LINEUP</button>
          </div>
        )}

        {gameState === 'result' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1rem', opacity: 0.5, letterSpacing: '2px' }}>REACTION TIME</div>
            <div style={{ 
                fontSize: '5rem', 
                fontWeight: '950', 
                color: resultTime < 300 ? '#00ff88' : 'white',
                textShadow: resultTime < 300 ? '0 0 40px rgba(0,255,136,0.6)' : 'none'
            }}>{resultTime}ms</div>
            <button className={styles.button} onClick={(e) => { e.stopPropagation(); startSequence(); }} style={{ marginTop: '20px', border: '1px solid #bc13fe', color: '#bc13fe' }}>
                <RotateCcw size={20} style={{ marginRight: '10px' }}/> RE-RUN
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
        <Link to="/" style={{ flex: 1, textDecoration: 'none' }}>
            <button className={styles.button} style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)' }}><ArrowLeft size={18}/> HUB</button>
        </Link>
        <button className={styles.button} style={{ flex: 1, background: 'rgba(188, 19, 254, 0.1)', border: '1px solid rgba(188, 19, 254, 0.3)' }}><Trophy size={18}/> RANKS</button>
      </div>
    </div>
  );
};

export default ReactionGame;