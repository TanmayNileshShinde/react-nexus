import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, RefreshCw, Trophy, User, Flag, AlertTriangle } from 'lucide-react';
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

const MAX_MOVES = 30;

const ALL_DRIVERS = [
  { id: 1, name: 'Albon', color: '#005AFF', img: '/drivers/albon.webp' },
  { id: 2, name: 'Alonso', color: '#006F62', img: '/drivers/alonso.webp' },
  { id: 3, name: 'Antonelli', color: '#00D2BE', img: '/drivers/antonelli.webp' },
  { id: 4, name: 'Bearman', color: '#64748b', img: '/drivers/bearman.webp' },
  { id: 5, name: 'Bortoleto', color: '#16a34a', img: '/drivers/bortoleto.webp' },
  { id: 6, name: 'Bottas', color: '#64748b', img: '/drivers/bottas.webp' },
  { id: 7, name: 'Colapinto', color: '#005AFF', img: '/drivers/colapinto.webp' },
  { id: 8, name: 'Gasly', color: '#db2777', img: '/drivers/gasly.webp' },
  { id: 9, name: 'Hadjar', color: '#2563eb', img: '/drivers/hadjar.webp' },
  { id: 10, name: 'Hamilton', color: '#dc2626', img: '/drivers/hamilton.webp' },
  { id: 11, name: 'Hulkenberg', color: '#16a34a', img: '/drivers/hulkenberg.webp' },
  { id: 12, name: 'Lawson', color: '#2563eb', img: '/drivers/lawson.webp' },
  { id: 13, name: 'Leclerc', color: '#dc2626', img: '/drivers/leclerc.webp' },
  { id: 14, name: 'Lindblad', color: '#1e3a8a', img: '/drivers/lindblad.webp' },
  { id: 15, name: 'Norris', color: '#ea580c', img: '/drivers/norris.webp' },
  { id: 16, name: 'Ocon', color: '#64748b', img: '/drivers/ocon.webp' },
  { id: 17, name: 'Perez', color: '#1e3a8a', img: '/drivers/perez.webp' },
  { id: 18, name: 'Piastri', color: '#ea580c', img: '/drivers/piastri.webp' },
  { id: 19, name: 'Russell', color: '#0d9488', img: '/drivers/russell.webp' },
  { id: 20, name: 'Sainz', color: '#005AFF', img: '/drivers/sainz.webp' },
  { id: 21, name: 'Stroll', color: '#006F62', img: '/drivers/stroll.webp' },
  { id: 22, name: 'Verstappen', color: '#1e3a8a', img: '/drivers/verstappen.webp' },
];

export default function MemoryGame() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('game');
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [movesLeft, setMovesLeft] = useState(MAX_MOVES);
  const [gameState, setGameState] = useState('playing');

  const [stats, setStats] = useState({ f1_wins: 0, f1_matches: 0 });
  const [leaderboardData, setLeaderboardData] = useState([]);
  const mismatchTimeoutRef = useRef(null);

  const clearMismatchTimeout = useCallback(() => {
    if (mismatchTimeoutRef.current) {
      clearTimeout(mismatchTimeoutRef.current);
      mismatchTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => () => clearMismatchTimeout(), [clearMismatchTimeout]);

  const shuffleCards = useCallback(() => {
    clearMismatchTimeout();
    const shuffledPool = [...ALL_DRIVERS].sort(() => 0.5 - Math.random());
    const selectedDrivers = shuffledPool.slice(0, 8);
    const deck = [...selectedDrivers, ...selectedDrivers]
      .sort(() => Math.random() - 0.5)
      .map((driver) => ({ ...driver, u_id: Math.random() }));

    setCards(deck);
    setFlipped([]);
    setSolved([]);
    setMovesLeft(MAX_MOVES);
    setGameState('playing');
    setDisabled(false);
  }, [clearMismatchTimeout]);

  useEffect(() => {
    shuffleCards();
  }, [shuffleCards]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      const userRef = doc(db, 'users', result.user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(
          userRef,
          {
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            f1_wins: 0,
            f1_matches: 0,
          },
          { merge: true }
        );
        setStats({ f1_wins: 0, f1_matches: 0 });
      } else {
        const data = docSnap.data();
        await setDoc(
          userRef,
          { displayName: result.user.displayName, photoURL: result.user.photoURL },
          { merge: true }
        );
        setStats({ f1_wins: data.f1_wins || 0, f1_matches: data.f1_matches || 0 });
      }
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const fetchLeaderboard = async () => {
    emitFeedback('tap');
    setView('leaderboard');
    try {
      const q = query(collection(db, 'users'), orderBy('f1_wins', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((d) => ({ ...d.data(), f1_wins: d.data().f1_wins || 0 }));
      setLeaderboardData(data);
    } catch (error) {
      console.error('Failed to fetch memory leaderboard', error);
    }
  };

  const recordMatchOutcome = useCallback(async (isWin) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    setStats((prev) => ({
      ...prev,
      f1_wins: isWin ? (prev.f1_wins || 0) + 1 : (prev.f1_wins || 0),
      f1_matches: (prev.f1_matches || 0) + 1,
    }));
    try {
      await updateDoc(userRef, {
        ...(isWin && { f1_wins: increment(1) }),
        f1_matches: increment(1),
      });
    } catch (error) {
      console.error('Failed to update memory stats', error);
    }
  }, [user]);

  const handleCardPointerDown = (id) => {
    if (disabled || flipped.includes(id) || solved.includes(id) || gameState !== 'playing') return;

    if (flipped.length === 0) {
      emitFeedback('tap');
      setFlipped([id]);
      return;
    }

    emitFeedback('tap');
    setFlipped([flipped[0], id]);
    setDisabled(true);

    const firstCard = cards.find((c) => c.u_id === flipped[0]);
    const secondCard = cards.find((c) => c.u_id === id);

    if (firstCard.name === secondCard.name) {
      const nextSolvedCount = solved.length + 2;
      if (nextSolvedCount < cards.length) {
        emitFeedback('success');
      }
      setSolved((prev) => [...prev, flipped[0], id]);
      setFlipped([]);
      setDisabled(false);
      setMovesLeft((prev) => prev + 2);
    } else {
      const newMoves = movesLeft - 1;
      setMovesLeft(newMoves);

      if (newMoves <= 0) {
        emitFeedback('foul');
        sound.playGameOver();
        setGameState('lost');
        setDisabled(true);
        recordMatchOutcome(false);
        return;
      }

      clearMismatchTimeout();
      mismatchTimeoutRef.current = setTimeout(() => {
        mismatchTimeoutRef.current = null;
        setFlipped([]);
        setDisabled(false);
      }, 650);
    }
  };

  useEffect(() => {
    if (gameState === 'playing' && cards.length > 0 && solved.length === cards.length) {
      sound.playVictory();
      setGameState('won');
      recordMatchOutcome(true);
    }
  }, [solved, cards.length, gameState, recordMatchOutcome]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING_DEFAULT}
      className="glass-panel"
      style={{
        width: '100%',
        maxWidth: '500px',
        padding: '24px',
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h2
          style={{
            fontSize: '1.75rem',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            margin: 0,
            color: '#f5f7fa',
          }}
        >
          F1 Memory
        </h2>
      </div>

      {view === 'game' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <div className="tabular-nums" style={{ fontSize: '0.95rem', fontWeight: 500, color: '#f5f7fa' }}>
              {gameState === 'won' && <span style={{ color: '#34d399' }}>All pairs matched</span>}
              {gameState === 'lost' && <span style={{ color: '#f87171' }}>Out of moves</span>}
              {gameState === 'playing' && (
                <span>
                  Moves remaining: <strong>{movesLeft}</strong>{' '}
                  <span style={{ fontSize: '0.75rem', color: '#34d399' }}>(+2 on match)</span>
                </span>
              )}
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <User size={14} strokeWidth={1.75} /> Sign in
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="tabular-nums" style={{ fontSize: '0.78rem', color: '#34d399' }}>
                  {stats.f1_wins}W
                </span>
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  referrerPolicy="no-referrer"
                  style={{ width: 28, height: 28, borderRadius: '50%' }}
                />
              </div>
            )}
          </div>

          {gameState === 'lost' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={SPRING_DEFAULT}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(11, 13, 18, 0.88)',
                backdropFilter: 'blur(12px)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
              }}
            >
              <AlertTriangle size={40} strokeWidth={1.5} color="#f87171" />
              <h3 style={{ color: '#f5f7fa', fontSize: '1.35rem', fontWeight: 600, margin: 0 }}>
                Out of Moves
              </h3>
              <button
                type="button"
                onPointerDown={() => {
                  emitFeedback('tap');
                  shuffleCards();
                }}
                style={{
                  marginTop: '4px',
                  height: '40px',
                  padding: '0 20px',
                  background: '#f5f7fa',
                  color: '#0b0d12',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* 4x4 Spring Flip Deck */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              perspective: '1000px',
            }}
          >
            {cards.map((card) => {
              const isFlipped = flipped.includes(card.u_id) || solved.includes(card.u_id);
              const isSolved = solved.includes(card.u_id);
              return (
                <motion.div
                  key={card.u_id}
                  onPointerDown={() => handleCardPointerDown(card.u_id)}
                  animate={{
                    rotateY: isFlipped ? 180 : 0,
                    scale: isSolved ? 0.96 : 1,
                  }}
                  whileTap={{ scale: 0.94 }}
                  transition={SPRING_MOMENTUM}
                  style={{
                    aspectRatio: '1',
                    cursor: 'pointer',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    touchAction: 'manipulation',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backfaceVisibility: 'hidden',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Flag size={18} strokeWidth={1.5} color="rgba(245, 247, 250, 0.35)" />
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backfaceVisibility: 'hidden',
                      background: card.color,
                      transform: 'rotateY(180deg)',
                      borderRadius: '12px',
                      border: isSolved
                        ? '1px solid rgba(52, 211, 153, 0.85)'
                        : '1px solid rgba(255, 255, 255, 0.35)',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={card.img}
                      alt={card.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        background: 'rgba(11, 13, 18, 0.78)',
                        color: '#f5f7fa',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        padding: '2px 0',
                        textAlign: 'center',
                      }}
                    >
                      {card.name.substring(0, 3).toUpperCase()}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <Link to="/" style={{ flex: 1 }}>
              <button className={styles.button} style={{ width: '100%' }}>
                <ArrowLeft size={16} strokeWidth={1.75} /> Library
              </button>
            </Link>
            <button type="button" className={styles.button} onClick={fetchLeaderboard} style={{ flex: 1 }}>
              <Trophy size={16} strokeWidth={1.75} /> Ranks
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={() => {
                emitFeedback('tap');
                shuffleCards();
              }}
              style={{ flex: 1 }}
            >
              <RefreshCw size={16} strokeWidth={1.75} /> Reset
            </button>
          </div>
        </div>
      )}

      {view === 'leaderboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                emitFeedback('tap');
                setView('game');
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#f5f7fa',
                width: 34,
                height: 34,
                borderRadius: 10,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeft size={16} strokeWidth={1.75} />
            </button>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#f5f7fa' }}>
              F1 Memory Leaders
            </h3>
          </div>

          <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {leaderboardData.map((player, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="tabular-nums" style={{ color: index === 0 ? '#fbbf24' : 'rgba(245,247,250,0.6)', fontWeight: 600 }}>
                    #{index + 1}
                  </span>
                  {player.photoURL && (
                    <img src={player.photoURL} alt={player.displayName} referrerPolicy="no-referrer" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                  )}
                  <span style={{ fontWeight: 500, color: '#f5f7fa' }}>{player.displayName}</span>
                </div>
                <span className="tabular-nums" style={{ color: '#34d399', fontWeight: 600 }}>
                  {player.f1_wins} W
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
