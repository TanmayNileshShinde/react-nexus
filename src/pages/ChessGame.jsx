import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trophy, User, Bot, Users, Crown } from 'lucide-react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import styles from '../styles/Game.module.css';

// FIREBASE IMPORTS
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const ChessGame = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('menu'); // 'menu', 'game_ai', 'game_friend', 'leaderboard'
  const [game, setGame] = useState(new Chess());
  const [difficulty, setDifficulty] = useState(2); // 1-5
  const [stats, setStats] = useState({ chessWins: 0, chessLosses: 0, chessMatches: 0 });
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const engine = useRef(null);

  // --- 1. STOCKFISH AI SETUP ---
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

  // --- 2. AUTH & FIREBASE ---
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

  // --- 3. GAME LOGIC ---
  const makeMove = (move) => {
    try {
      const gameCopy = new Chess(game.fen());
      gameCopy.move(move);
      setGame(gameCopy);
      
      if (gameCopy.isGameOver() && view === 'game_ai' && user) {
        const won = gameCopy.isCheckmate() && gameCopy.turn() === 'b'; 
        updateFirebaseStats(won);
      }
    } catch (e) { return null; }
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

  // --- UI COMPONENTS ---
  const MenuCard = ({ icon: Icon, title, subtitle, onClick, color }) => (
    <div onClick={onClick} className="glass-panel" style={{ 
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', 
      border: `1px solid ${color}`, background: `${color}10`, marginBottom: '15px', transition: '0.3s'
    }}>
      <div style={{ background: `${color}20`, padding: '12px', borderRadius: '10px' }}>
        <Icon size={28} color={color}/>
      </div>
      <div style={{ textAlign: 'left' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'white' }}>{title}</h3>
        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', minHeight: '700px', padding: '30px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', background: 'linear-gradient(to right, #ffd700, #ff8c00)', WebkitBackgroundClip: 'text', color: 'transparent', fontSize: '2rem', fontWeight: '800' }}>
        CHESS ARENA
      </h2>

      {view === 'menu' && (
        <div style={{ marginTop: '40px' }}>
          <MenuCard icon={Bot} title="Vs Stockfish AI" subtitle="Train against the world's strongest bot" color="#ffd700" onClick={() => setView('game_ai')} />
          <MenuCard icon={Users} title="Vs Friend" subtitle="Local 1v1 multiplayer" color="#00f3ff" onClick={() => setView('game_friend')} />
          <MenuCard icon={Trophy} title="Leaderboard" subtitle="Climb the Grandmaster ranks" color="#bc13fe" onClick={fetchLeaderboard} />
          <Link to="/" style={{ display: 'block', textAlign: 'center', color: '#666', marginTop: '20px', textDecoration: 'none' }}><ArrowLeft size={14}/> Back to Nexus</Link>
        </div>
      )}

      {(view === 'game_ai' || view === 'game_friend') && (
        <div>
           {/* Reusing your Profile Bar style */}
           <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
             {!user ? (
               <button onClick={handleLogin} style={{ background: 'white', borderRadius: '20px', padding: '5px 15px', fontWeight: 'bold' }}>Login</button>
             ) : (
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '5px 15px', borderRadius: '20px' }}>
                 <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 'bold' }}>{user.displayName}</div>
                    <div style={{ color: '#ffd700' }}>{stats.chessWins}W - {stats.chessLosses}L</div>
                 </div>
                 <img src={user.photoURL} style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid #ffd700' }} alt="user" />
               </div>
             )}
           </div>

           <div style={{ width: '100%', marginBottom: '20px' }}>
             <Chessboard position={game.fen()} onPieceDrop={onDrop} boardOrientation="white" />
           </div>

           <div style={{ display: 'flex', gap: '10px' }}>
             <button className={styles.button} onClick={() => setView('menu')} style={{ flex: 1, background: '#333' }}>MENU</button>
             <button className={styles.button} onClick={() => setGame(new Chess())} style={{ flex: 1, background: '#ffd700', color: 'black' }}>RESET</button>
           </div>
        </div>
      )}

      {/* Leaderboard View follows the same logic as your Tic-Tac-Toe file */}
    </div>
  );
};

export default ChessGame;