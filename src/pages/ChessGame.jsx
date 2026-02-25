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
  const [view, setView] = useState('menu'); 
  const [game, setGame] = useState(new Chess());
  const [difficulty, setDifficulty] = useState(2); 
  const [stats, setStats] = useState({ chessWins: 0, chessLosses: 0, chessMatches: 0 });
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const engine = useRef(null);

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

  // --- FIXED GAME LOGIC ---
  const makeMove = (move) => {
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move); // Capture the result of the move
      
      if (result) {
        setGame(gameCopy);
        
        if (gameCopy.isGameOver() && view === 'game_ai' && user) {
          const won = gameCopy.isCheckmate() && gameCopy.turn() === 'b'; 
          updateFirebaseStats(won);
        }
        return result; // Return result so onDrop knows it worked
      }
    } catch (e) { return null; }
    return null;
  };

  const onDrop = (source, target) => {
    const move = { from: source, to: target, promotion: 'q' };
    const result = makeMove(move);
    
    // If move is invalid, return false to snap piece back
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
    <div className="glass-panel" style={{ 
      width: '100%', 
      maxWidth: '450px', // Matches Tic-Tac-Toe
      minHeight: '600px', // Matches Tic-Tac-Toe
      padding: '30px', 
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        background: 'linear-gradient(to right, #ffd700, #ff8c00)', 
        WebkitBackgroundClip: 'text', 
        color: 'transparent', 
        fontSize: '1.8rem', 
        fontWeight: '800',
        letterSpacing: '2px',
        textTransform: 'uppercase'
      }}>
        Chess Arena
      </h2>

      {view === 'menu' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '20px' }}>
          <MenuCard icon={Bot} title="Vs Stockfish" subtitle="Ranked AI Challenge" color="#ffd700" onClick={() => setView('game_ai')} />
          <MenuCard icon={Users} title="Vs Friend" subtitle="Local Multiplayer" color="#00f3ff" onClick={() => setView('game_friend')} />
          <MenuCard icon={Trophy} title="Leaderboard" subtitle="Global Rankings" color="#bc13fe" onClick={fetchLeaderboard} />
          <Link to="/" style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.9rem' }}>
            <ArrowLeft size={14} style={{ marginRight: '5px' }}/> Back to Nexus
          </Link>
        </div>
      )}

      {(view === 'game_ai' || view === 'game_friend') && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
           <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', minHeight: '40px' }}>
             {!user ? (
               <button onClick={handleLogin} style={{ background: 'white', border: 'none', borderRadius: '20px', padding: '5px 15px', fontWeight: 'bold', cursor: 'pointer' }}>Login</button>
             ) : (
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '5px 15px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                 <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                    <div style={{ fontWeight: 'bold', color: 'white' }}>{user.displayName}</div>
                    <div style={{ color: '#ffd700' }}>{stats.chessWins || 0}W - {stats.chessLosses || 0}L</div>
                 </div>
                 <img src={user.photoURL} style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid #ffd700' }} alt="user" />
               </div>
             )}
           </div>

           <div style={{ width: '100%', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 0 30px rgba(255, 215, 0, 0.1)' }}>
             <Chessboard position={game.fen()} onPieceDrop={onDrop} boardOrientation="white" customDarkSquareStyle={{ backgroundColor: '#2c3e50' }} customLightSquareStyle={{ backgroundColor: '#95a5a6' }} />
           </div>

           <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
             <button className={styles.button} onClick={() => { setView('menu'); setGame(new Chess()); }} style={{ flex: 1, background: 'rgba(255, 255, 255, 0.05)' }}>MENU</button>
             <button className={styles.button} onClick={() => setGame(new Chess())} style={{ flex: 1, background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #ffd70033', color: '#ffd700' }}>RESET</button>
           </div>
        </div>
      )}

      {/* Leaderboard uses same logic as TicTacToe */}
    </div>
  );
};

export default ChessGame;