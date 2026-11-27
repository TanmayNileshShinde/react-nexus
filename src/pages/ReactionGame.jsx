import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Trophy, Zap, AlertCircle, RotateCcw, Home } from 'lucide-react';
import styles from '../styles/Game.module.css';
import sound from '../utils/audioFX';
import { SPRING_DEFAULT, SPRING_MOMENTUM, emitFeedback } from '../utils/fluidMotion';

import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';

function Light({ active }) {
  return (
    <motion.div
      animate={{ scale: active ? 1.06 : 1 }}
      transition={SPRING_DEFAULT}
      style={{
        width: '54px',
        height: '54px',
        borderRadius: '50%',
        backgroundColor: active ? '#ef4444' : 'rgba(255, 255, 255, 0.06)',
        boxShadow: active
          ? '0 0 20px rgba(239, 68, 68, 0.55), inset 0 2px 6px rgba(255,255,255,0.35)'
          : 'inset 0 2px 6px rgba(0, 0, 0, 0.65)',
        border: active ? '1px solid rgba(252, 165, 165, 0.8)' : '1px solid rgba(255, 255, 255, 0.12)',
      }}
    />
  );
}

export default function ReactionGame() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('game');
  const [bestTime, setBestTime] = useState(null);
  const [gameState, setGameState] = useState('idle');
  const [lights, setLights] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [resultTime, setResultTime] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const timerRef = useRef(null);
  const tickTimeoutsRef = useRef([]);

  const clearAllTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    tickTimeoutsRef.current.forEach((t) => clearTimeout(t));
    tickTimeoutsRef.current = [];
  };

  useEffect(() => () => clearAllTimers(), []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      const userRef = doc(db, 'users', result.user.uid);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        await setDoc(
          userRef,
          { displayName: result.user.displayName, photoURL: result.user.photoURL, best_reaction: null, total_xp: 0 },
          { merge: true }
        );
      } else {
        setBestTime(docSnap.data().best_reaction);
      }
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const startSequence = () => {
    clearAllTimers();
    emitFeedback('tap');
    setView('game');
    setGameState('counting');
    setLights(0);
    setResultTime(null);
    for (let i = 1; i <= 5; i++) {
      const t = setTimeout(() => {
        setLights(i);
        sound.playTick();
      }, i * 1000);
      tickTimeoutsRef.current.push(t);
    }
    const randomDelay = Math.floor(Math.random() * 2800) + 1800;
    timerRef.current = setTimeout(() => {
      setLights(0);
      sound.playGo();
      setGameState('ready');
      setStartTime(performance.now());
    }, 5000 + randomDelay);
  };

  const processScore = async (time) => {
    if (!user) return;
    const xpAwarded = time < 200 ? 100 : time < 300 ? 50 : 10;
    const userRef = doc(db, 'users', user.uid);
    try {
      if (!bestTime || time < bestTime) {
        setBestTime(time);
        await updateDoc(userRef, { best_reaction: time, total_xp: increment(xpAwarded) });
      } else {
        await updateDoc(userRef, { total_xp: increment(xpAwarded) });
      }
    } catch (error) {
      console.error('Failed to update reaction score', error);
    }
  };

  // Respond on pointer-down (not click release) for true reflex accuracy
  const handleReactionPointerDown = () => {
    if (view !== 'game') return;
    if (gameState === 'counting') {
      clearAllTimers();
      emitFeedback('foul');
      setGameState('foul');
      setLights(5);
    } else if (gameState === 'ready') {
      const reaction = Math.round(performance.now() - startTime);
      setResultTime(reaction);
      emitFeedback('success');
      setGameState('result');
      processScore(reaction);
    }
  };

  const fetchLeaderboard = async () => {
    emitFeedback('tap');
    if (view === 'game') {
      clearAllTimers();
      setGameState('idle');
      setView('leaderboard');
      try {
        const q = query(collection(db, 'users'), orderBy('best_reaction', 'asc'), limit(10));
        const snap = await getDocs(q);
        setLeaderboard(snap.docs.map((d) => d.data()).filter((u) => u.best_reaction !== null));
      } catch (error) {
        console.error('Error fetching reaction leaderboard', error);
      }
    } else {
      setView('game');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING_DEFAULT}
      className="glass-panel"
      style={{
        width: '100%',
        maxWidth: '500px',
        minHeight: '560px',
        padding: '24px',
        margin: '0 auto',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 600, letterSpacing: '-0.02em', margin: 0, color: '#f5f7fa' }}>
            Reaction Test
          </h2>
          <div style={{ fontSize: '0.78rem', color: 'rgba(245,247,250,0.55)' }}>
            Measured on pointer-down · zero release delay
          </div>
        </div>

        {!user ? (
          <button
            type="button"
            onClick={handleLogin}
            style={{
              background: '#f5f7fa',
              color: '#0b0d12',
              border: 'none',
              height: '32px',
              padding: '0 12px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            Sign in
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'right' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 500, color: '#f5f7fa' }}>{user.displayName}</div>
              <div className="tabular-nums" style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
                Best {bestTime ? `${bestTime} ms` : '—'}
              </div>
            </div>
            <img src={user.photoURL} alt={user.displayName} referrerPolicy="no-referrer" style={{ width: 32, height: 32, borderRadius: '50%' }} />
          </div>
        )}
      </div>

      {/* Interactive Pointer-Down Touch Pad */}
      <div
        onPointerDown={handleReactionPointerDown}
        style={{
          flex: 1,
          minHeight: '320px',
          background: gameState === 'ready' ? 'rgba(52, 211, 153, 0.14)' : 'rgba(10, 12, 18, 0.72)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          touchAction: 'manipulation',
          userSelect: 'none',
          border: `1px solid ${
            gameState === 'ready'
              ? 'rgba(52, 211, 153, 0.5)'
              : gameState === 'foul'
                ? 'rgba(248, 113, 113, 0.45)'
                : 'rgba(255, 255, 255, 0.1)'
          }`,
        }}
      >
        {view === 'game' ? (
          <>
            {gameState === 'idle' && (
              <div style={{ textAlign: 'center' }}>
                <Zap size={44} strokeWidth={1.5} color="#38bdf8" />
                <div style={{ color: '#f5f7fa', fontWeight: 600, marginTop: '12px', fontSize: '1.05rem' }}>
                  Press Start, then tap on lights out
                </div>
              </div>
            )}

            {(gameState === 'counting' || gameState === 'ready' || gameState === 'foul') && (
              <div style={{ display: 'flex', gap: '12px' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Light key={i} active={lights >= i} />
                ))}
              </div>
            )}

            {gameState === 'ready' && (
              <motion.h1
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={SPRING_MOMENTUM}
                style={{ color: '#34d399', fontSize: '3.5rem', fontWeight: 700, margin: '18px 0 0' }}
              >
                Tap now
              </motion.h1>
            )}

            {gameState === 'foul' && (
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={SPRING_DEFAULT}
                style={{ textAlign: 'center', marginTop: '18px' }}
              >
                <AlertCircle size={36} strokeWidth={1.75} color="#f87171" />
                <div style={{ color: '#f87171', fontSize: '1.25rem', fontWeight: 600, marginTop: '8px' }}>
                  Jump Start
                </div>
              </motion.div>
            )}

            {gameState === 'result' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={SPRING_MOMENTUM}
                style={{ textAlign: 'center' }}
              >
                <div style={{ fontSize: '0.85rem', color: 'rgba(245,247,250,0.6)' }}>Reaction time</div>
                <div
                  className="tabular-nums"
                  style={{
                    fontSize: '4.25rem',
                    fontWeight: 600,
                    letterSpacing: '-0.03em',
                    color: resultTime < 300 ? '#34d399' : '#f5f7fa',
                    lineHeight: 1.05,
                  }}
                >
                  {resultTime}
                  <span style={{ fontSize: '1.25rem', marginLeft: '6px', color: 'rgba(245,247,250,0.6)' }}>ms</span>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <div style={{ width: '100%', padding: '18px', height: '100%', overflowY: 'auto' }}>
            <h3 style={{ color: '#f5f7fa', textAlign: 'center', fontSize: '1.05rem', fontWeight: 600, marginBottom: '14px' }}>
              Fastest Reflexes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {leaderboard.map((u, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="tabular-nums" style={{ fontWeight: 600, color: i === 0 ? '#fbbf24' : 'rgba(245,247,250,0.6)' }}>
                      #{i + 1}
                    </span>
                    <span style={{ fontWeight: 500, color: '#f5f7fa' }}>{u.displayName}</span>
                  </div>
                  <span className="tabular-nums" style={{ color: '#38bdf8', fontWeight: 600 }}>
                    {u.best_reaction} ms
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
        <Link to="/" style={{ flex: 1 }}>
          <button className={styles.button} style={{ width: '100%' }}>
            <Home size={16} strokeWidth={1.75} />
          </button>
        </Link>
        <button type="button" className={styles.button} onClick={fetchLeaderboard} style={{ flex: 1 }}>
          {view === 'game' ? <Trophy size={16} strokeWidth={1.75} /> : <ArrowLeft size={16} strokeWidth={1.75} />}
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={startSequence}
          style={{
            flex: 2,
            background: '#f5f7fa',
            color: '#0b0d12',
            border: 'none',
            fontWeight: 600,
          }}
        >
          <RotateCcw size={16} strokeWidth={1.75} />
          <span>{gameState === 'idle' ? 'Start Lights' : 'Restart'}</span>
        </button>
      </div>
    </motion.div>
  );
}
