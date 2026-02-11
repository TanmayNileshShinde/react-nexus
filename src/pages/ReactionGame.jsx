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
  const [view, setView] = useState('game'); // 'game' or 'leaderboard'
  const [bestTime, setBestTime] = useState(null);
  const [gameState, setGameState] = useState('idle'); 
  const [lights, setLights] = useState(0); 
  const [startTime, setStartTime] = useState(null);
  const [resultTime, setResultTime] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
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
        setBestTime(docSnap.data().best_reaction);
      }
    } catch (error) { console.error("Login failed", error); }
  };

  // --- 2. GAME LOGIC ---
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

  const Light = ({ active }) => (
    <div style={{
      width: '60px', height: '60px', borderRadius: '50%',
      backgroundColor: active ? '#ff0055' : 'rgba(255, 255, 255, 0.05)',
      boxShadow: active ? '0 0 30px #ff0055' : 'inset 0 0 10px rgba(0,0,0,0.5)',
      border: active ? '2px solid #ff88aa' : '1px solid rgba(255, 255, 255, 0.1)',
    }} />
  );

  return (
    <div className="glass-panel" style={{ 
        width: '100%', maxWidth: '500px', minHeight: '600px', 
        padding: '30px', position: 'relative', display: 'flex', flexDirection: 'column',
        border: '1px solid rgba(0, 243, 255, 0.3)'
    }}>
      
      <h2 style={{ textAlign: 'center', background: 'linear-gradient(to right, #00f3ff, #bc13fe)', WebkitBackgroundClip: 'text', color: 'transparent', textTransform: 'uppercase', letterSpacing: '2px' }}>REACTION NEXUS</h2>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        {!user ? (
          <button onClick={handleLogin} style={{ background: 'white', color: '#0f172a', border: 'none', padding: '8px 16px', borderRadius: '20px', fontWeight: '800', cursor: 'pointer' }}>Login</button>
        ) : (
          <div style={{ background: 'rgba(255, 255, 255, 0.07)', padding: '5px 15px', borderRadius: '30px', border: '1px solid #bc13fe', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{user.displayName}</div>
                <div style={{ fontSize: '0.7rem', color: '#00f3ff' }}>BEST: {bestTime ? `${bestTime}ms` : '---'}</div>
             </div>
             <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" style={{ width: 32, height: 32, borderRadius: '50%' }}/>
          </div>
        )}
      </div>

      <div onClick={handleReaction} style={{ flex: 1, background: 'rgba(255, 255, 255, 0.03)', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        {view === 'game' ? (
          <>
            {gameState === 'idle' && (
              <div style={{ textAlign: 'center' }}>
                <Zap size={60} color="#00f3ff" />
                <h3 style={{ marginTop: '10px' }}>READY?</h3>
              </div>
            )}
            {(gameState === 'counting' || gameState === 'ready' || gameState === 'foul') && (
              <div style={{ display: 'flex', gap: '10px' }}>
                {[1,2,3,4,5].map(i => <Light key={i} active={lights >= i} />)}
              </div>
            )}
            {gameState === 'ready' && <h1 style={{ color: '#00ff88', textShadow: '0 0 20px #00ff88' }}>GO!</h1>}
            {gameState === 'foul' && <h2 style={{ color: '#ff4444' }}>JUMP START!</h2>}
            {gameState === 'result' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', opacity: 0.5 }}>TIME</div>
                <div style={{ fontSize: '4.5rem', fontWeight: '900', color: resultTime < 300 ? '#00ff88' : 'white' }}>{resultTime}ms</div>
              </div>
            )}
          </>
        ) : (
          <div style={{ width: '100%', padding: '10px', overflowY: 'auto' }}>
            <h3 style={{ color: '#ffcc00', textAlign: 'center' }}>TOP REFLEXES</h3>
            {leaderboard.map((u, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.05)', marginBottom: '5px', borderRadius: '8px' }}>
                <span>#{i+1} {u.displayName}</span>
                <span style={{ color: '#00f3ff' }}>{u.best_reaction}ms</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Link to="/" style={{ flex: 1, textDecoration: 'none' }}>
            <button className={styles.button} style={{ width: '100%', background: 'rgba(255, 68, 68, 0.1)' }}><Home size={18}/> HUB</button>
        </Link>
        <button className={styles.button} onClick={fetchLeaderboard} style={{ flex: 1, background: 'rgba(188, 19, 254, 0.1)' }}>
            {view === 'game' ? <><Trophy size={18}/> RANKS</> : <><ArrowLeft size={18}/> BACK</>}
        </button>
        <button className={styles.button} onClick={startSequence} style={{ flex: 1, background: 'rgba(0, 243, 255, 0.1)' }}>
            <RotateCcw size={18}/> {gameState === 'idle' ? 'START' : 'RE-RUN'}
        </button>
      </div>
    </div>
  );
};

export default ReactionGame;