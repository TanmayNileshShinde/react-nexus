import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  const [user, setUser] = useState(null);
  const [view, setView] = useState('menu'); 
  const [game, setGame] = useState(new Chess());
  const [moveSquares, setMoveSquares] = useState({}); // For move highlighting
  const [stats, setStats] = useState({ chessWins: 0, chessLosses: 0 });
  
  const engine = useRef(null);

  // --- 1. STOCKFISH SETUP ---
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

  // --- 2. CUSTOM MOVE LOGIC & HIGHLIGHTING ---
  const makeMove = (move) => {
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      if (result) {
        setGame(gameCopy);
        setMoveSquares({}); // Clear highlights after move
        return result;
      }
    } catch (e) { return null; }
    return null;
  };

  const onSquareClick = (square) => {
    const moves = game.moves({ square, verbose: true });
    if (moves.length === 0) {
      setMoveSquares({});
      return;
    }

    const newSquares = {};
    moves.forEach((m) => {
      newSquares[m.to] = {
        background: game.get(m.to) 
          ? 'radial-gradient(circle, rgba(255,0,0,.4) 20%, transparent 25%)' 
          : 'radial-gradient(circle, rgba(0,243,255,.3) 20%, transparent 25%)',
        borderRadius: '50%',
      };
    });
    setMoveSquares(newSquares);
  };

  const onDrop = (source, target) => {
    const move = makeMove({ from: source, to: target, promotion: 'q' });
    if (!move) return false;

    if (view === 'game_ai' && !game.isGameOver()) {
      setTimeout(() => {
        engine.current.postMessage(`position fen ${game.fen()}`);
        engine.current.postMessage(`go depth 4`);
      }, 500);
    }
    return true;
  };

  // --- 3. CUSTOM NEXUS THEME ---
  const boardStyles = {
    borderRadius: '8px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
  };

  return (
    <div className="glass-panel" style={{ 
      width: '100%', maxWidth: '450px', minHeight: '600px', 
      padding: '30px', margin: '40px auto', display: 'flex', flexDirection: 'column' 
    }}>
      <h2 style={{ textAlign: 'center', background: 'linear-gradient(to right, #ffd700, #ff8c00)', WebkitBackgroundClip: 'text', color: 'transparent', fontSize: '2rem', fontWeight: '800', marginBottom: '30px' }}>
        CHESS ARENA
      </h2>

      {view === 'menu' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Menu logic remains identical to Page 1 */}
          <button onClick={() => setView('game_ai')} className="glass-panel" style={{ padding: '25px', marginBottom: '15px', border: '1px solid #ffd700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255, 215, 0, 0.05)' }}>
            <Bot color="#ffd700" size={32}/>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ margin: 0, color: 'white' }}>Ranked AI</h3>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>Stockfish Level 4</p>
            </div>
          </button>
          <button onClick={() => setView('game_friend')} className="glass-panel" style={{ padding: '25px', border: '1px solid #00f3ff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(0, 243, 255, 0.05)' }}>
            <Users color="#00f3ff" size={32}/>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ margin: 0, color: 'white' }}>Vs Friend</h3>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>Local Play</p>
            </div>
          </button>
        </div>
      )}

      {(view === 'game_ai' || view === 'game_friend') && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '390px', marginBottom: '30px' }}>
            <Chessboard 
              position={game.fen()} 
              onPieceDrop={onDrop} 
              onSquareClick={onSquareClick}
              customSquareStyles={moveSquares}
              customDarkSquareStyle={{ backgroundColor: '#1e293b' }} // Dark Slate
              customLightSquareStyle={{ backgroundColor: '#334155' }} // Medium Slate
              customBoardStyle={boardStyles}
              animationDuration={200}
            />
          </div>

          <div style={{ display: 'flex', gap: '15px', width: '100%', marginTop: 'auto' }}>
            <button className={styles.button} onClick={() => setView('menu')} style={{ flex: 1, padding: '15px', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.3)', color: 'white' }}>MENU</button>
            <button className={styles.button} onClick={() => setGame(new Chess())} style={{ flex: 1, padding: '15px', background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #ffd700', color: '#ffd700' }}>RESTART</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessGame;