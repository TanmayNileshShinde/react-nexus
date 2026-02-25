import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trophy, User, Bot, Users } from 'lucide-react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import styles from '../styles/Game.module.css';

// FIREBASE IMPORTS
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const ChessGame = () => {
  // --- STATES ---
  const [user, setUser] = useState(null);
  const [view, setView] = useState('menu'); 
  const [game, setGame] = useState(new Chess());
  const [difficulty, setDifficulty] = useState(2); 
  const [stats, setStats] = useState({ chessWins: 0, chessLosses: 0, chessMatches: 0 });
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const engine = useRef(null);

  // --- AI SETUP ---
  useEffect(() => {
    engine.current = new Worker('/stockfish.js');
    engine.current.onmessage = (e) => {
      if (e.data.startsWith('bestmove')) {
        const bestMove = e.data.split(' ')[1];
        makeMove(bestMove);
      }
    };
    return () => engine.current.terminate();
  }, []);

  // --- AUTH & DATA SYNC ---
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      const userRef = doc(db, "users", result.user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) setStats(docSnap.data());
    } catch (error) { console.error("Login failed", error); }
  };

  const fetchLeaderboard = async () => {
    setView('leaderboard');
    setIsLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("chessWins", "desc"), limit(10));
      const snap = await getDocs(q);
      setLeaderboardData(snap.docs.map(d => d.data()));
    } finally { setIsLoading(false); }
  };

  // --- GAME LOGIC ---
  const makeMove = (move) => {
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      if (result) {
        setGame(gameCopy);
        if (gameCopy.isGameOver() && view === 'game_ai' && user) {
          const won = gameCopy.isCheckmate() && gameCopy.turn() === 'b'; 
          updateFirebaseStats(won);
        }
        return result;
      }
    } catch (e) { return null; }
    return null;
  };

  const onDrop = (source, target) => {
    const move = { from: source, to: target, promotion: 'q' };
    const result = makeMove(move);
    if (!result) return false;

    if (view === 'game_ai' && !game.isGameOver()) {
      setTimeout(() => {
        engine.current.postMessage(`position fen ${game.fen()}`);
        engine.current.postMessage(`go depth ${difficulty * 2}`);
      }, 500);
    }
    return true;
  };

  const updateFirebaseStats = async (isWin) => {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      chessMatches: increment(1),
      chessWins: isWin ? increment(1) : increment(0),
      chessLosses: !isWin ? increment(1) : increment(0)
    });
  };

  // --- UI COMPONENTS (CLONED FROM PAGE 1) ---
  const MenuCard = ({ icon: Icon, title, subtitle, onClick, color }) => (
    <div onClick={onClick} className="glass-panel" style={{ 
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', padding: '25px', 
      border: `1px solid ${color}`, background: `linear-gradient(145deg, rgba(255,255,255,0.03) 0%, ${color}10 100%)`,
      transition: 'all 0.3s ease', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      marginBottom: '15px'
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 10px 40px ${color}30`; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)'; }}
    >
      <div style={{ background: `${color}20`, padding: '15px', borderRadius: '12px' }}>
        <Icon size={32} color={color}/>
      </div>
      <div style={{ textAlign: 'left' }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', fontWeight: '700', letterSpacing: '0.5px', color: 'white' }}>{title}</h3>
        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.6, fontWeight: '400', color: 'white' }}>{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="glass-panel" style={{ 
      width: '100%', maxWidth: '450px', minHeight: '600px', 
      padding: '30px', position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', margin: '0 auto'
    }}>
      
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ 
          fontSize: '2rem', fontWeight: '800', margin: 0, 
          background: 'linear-gradient(to right, #ffd700, #ff8c00)', WebkitBackgroundClip: 'text', color: 'transparent',
          textTransform: 'uppercase', letterSpacing: '2px'
        }}>
          Chess Arena
        </h2>
      </div>

      {/* VIEW: MAIN MENU */}
      {view === 'menu' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <MenuCard 
            icon={Bot} title="Vs AI (Ranked)" subtitle="Login to climb the global ranks" 
            color="#ffd700" onClick={() => setView('game_ai')} 
          />
          <MenuCard 
            icon={Users} title="Vs Friend" subtitle="Local multiplayer classic" 
            color="#00f3ff" onClick={() => setView('game_friend')} 
          />
          <MenuCard 
            icon={Trophy} title="Leaderboard" subtitle="See who rules the Arena" 
            color="#bc13fe" onClick={fetchLeaderboard} 
          />
          
          <Link to="/" style={{ textAlign: 'center', marginTop: '30px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <ArrowLeft size={14}/> Back to Nexus
          </Link>
        </div>
      )}

      {/* VIEW: GAME (AI & FRIEND) */}
      {(view === 'game_ai' || view === 'game_friend') && (
        <div className={styles.container} style={{ flex: 1 }}>
          
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px', minHeight: '40px' }}>
            {!user ? (
              <button onClick={handleLogin} style={{ 
                background: 'white', color: '#0f172a', border: 'none', padding: '8px 16px', 
                borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer'
              }}>
                Login with Google
              </button>
            ) : (
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.05)', padding: '5px 15px', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex', alignItems: 'center', gap: '12px' 
              }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>{user.displayName}</div>
                  <div style={{ fontSize: '0.7rem', color: '#ffd700' }}>
                      <span>{stats.chessWins || 0}W</span> - <span>{stats.chessLosses || 0}L</span>
                  </div>
                </div>
                <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #ffd700' }} />
              </div>
            )}
          </div>

          <div style={{ width: '100%', marginBottom: '30px', boxShadow: '0 0 50px rgba(255, 215, 0, 0.1)' }}>
             <Chessboard position={game.fen()} onPieceDrop={onDrop} boardOrientation="white" />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: 'auto' }}>
            <button 
              className={styles.button} 
              onClick={() => {setView('menu'); setGame(new Chess());}} 
              style={{ flex: 1, padding: '15px', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.3)' }}
            >
              <ArrowLeft size={18}/> MENU
            </button>
            <button 
              className={styles.button} 
              onClick={() => setGame(new Chess())} 
              style={{ flex: 1, padding: '15px', background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)', color: '#ffd700' }}
            >
              <RefreshCw size={18}/> RESTART
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessGame;