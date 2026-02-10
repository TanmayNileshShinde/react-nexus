// src/pages/TicTacToe.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trophy, AlertCircle } from 'lucide-react';
import styles from '../styles/Game.module.css';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  // Winning Logic
  const calculateWinner = (squares) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
    }
    return null;
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every((square) => square !== null);

  const handleClick = (index) => {
    if (board[index] || winner || isDraw) return;
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  return (
    <div className="glass-panel">
      <div className={styles.container}>
        
        {/* --- NEW GAME TITLE & TAGLINE SECTION --- */}
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <h1 style={{ 
            margin: '0', 
            fontSize: '2rem', 
            background: 'linear-gradient(to right, #00f3ff, #bc13fe)', 
            WebkitBackgroundClip: 'text', 
            color: 'transparent',
            textTransform: 'uppercase'
          }}>
            NEON TIC-TAC-TOE
          </h1>
          <p style={{ 
            margin: '5px 0 0 0', 
            letterSpacing: '4px', 
            fontSize: '0.8rem', 
            opacity: 0.6, 
            textTransform: 'uppercase' 
          }}>
            Play To Win
          </p>
        </div>
        {/* ---------------------------------------- */}

        {/* Status Header */}
        <div className={styles.status} style={{ color: winner ? '#00ff88' : isDraw ? '#ffcc00' : 'white' }}>
          {winner && <div style={{display:'flex', alignItems:'center', gap:'10px', justifyContent:'center'}}><Trophy size={24}/> {winner} WINS!</div>}
          {isDraw && <div style={{display:'flex', alignItems:'center', gap:'10px', justifyContent:'center'}}><AlertCircle size={24}/> DRAW!</div>}
          {!winner && !isDraw && `Turn: ${isXNext ? 'X' : 'O'}`}
        </div>

        {/* Game Grid */}
        <div className={styles.board}>
          {board.map((val, idx) => (
            <div 
              key={idx} 
              className={`${styles.square} ${val === 'X' ? styles.x : val === 'O' ? styles.o : ''}`} 
              onClick={() => handleClick(idx)}
              style={{ cursor: (winner || isDraw || val) ? 'default' : 'pointer' }}
            >
              {val}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button className={styles.button}>
              <ArrowLeft size={18}/> Back
            </button>
          </Link>
          <button className={`${styles.button} ${styles.resetBtn}`} onClick={() => {setBoard(Array(9).fill(null)); setIsXNext(true);}}>
            <RefreshCw size={18}/> Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;