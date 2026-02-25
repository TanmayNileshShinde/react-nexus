import React, { useState, useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [mode, setMode] = useState('pvp'); // 'pvp' or 'bot'
  const [difficulty, setDifficulty] = useState(1); // 1 to 5
  const [leaderboard, setLeaderboard] = useState({ pvpMatches: 0, botWins: 0 });
  const [status, setStatus] = useState('Game ready!');
  
  const engine = useRef(null);

  // 1. Initialize Leaderboard & Stockfish Engine
  useEffect(() => {
    // Load local storage scores
    const savedScores = JSON.parse(localStorage.getItem('nexusChessLeaderboard')) || { pvpMatches: 0, botWins: 0 };
    setLeaderboard(savedScores);

    // Initialize the Web Worker for the bot
    engine.current = new Worker('/stockfish.js');
    engine.current.onmessage = (e) => {
      const msg = e.data;
      if (msg.startsWith('bestmove')) {
        const bestMove = msg.split(' ')[1];
        makeAMove(bestMove);
      }
    };

    return () => {
      if (engine.current) engine.current.terminate(); // Cleanup worker on unmount
    };
  }, []);

  // 2. Handle Game End and Leaderboard Updates
  useEffect(() => {
    if (game.isCheckmate()) {
      const winner = game.turn() === 'w' ? 'Black' : 'White';
      setStatus(`Checkmate! ${winner} wins!`);
      updateLeaderboard(winner);
    } else if (game.isDraw()) {
      setStatus('Draw!');
    } else {
      setStatus(`Turn: ${game.turn() === 'w' ? 'White' : 'Black'}`);
    }
  }, [game]);

  const updateLeaderboard = (winner) => {
    const newScores = { ...leaderboard };
    if (mode === 'pvp') {
      newScores.pvpMatches += 1;
    } else if (mode === 'bot' && winner === 'White') {
      newScores.botWins += 1; // Assuming player is always White against the bot
    }
    setLeaderboard(newScores);
    localStorage.setItem('nexusChessLeaderboard', JSON.stringify(newScores));
  };

  // 3. Move Logic
  const makeAMove = (move) => {
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      setGame(gameCopy);
      return result;
    } catch (e) {
      return null;
    }
  };

  const onDrop = (sourceSquare, targetSquare) => {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // Auto-promote to Queen
    });

    if (move === null) return false; // Illegal move

    // If playing Bot, let Stockfish calculate the next move
    if (mode === 'bot' && !game.isGameOver() && game.turn() === 'b') {
      // Difficulty 1-5 maps to Stockfish search depth 2-10
      const depth = difficulty * 2; 
      engine.current.postMessage(`position fen ${game.fen()}`);
      engine.current.postMessage(`go depth ${depth}`);
    }
    return true;
  };

  const resetGame = () => setGame(new Chess());

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h2>React Nexus Chess</h2>
      
      {/* Controls */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <select value={mode} onChange={(e) => { setMode(e.target.value); resetGame(); }} style={{ padding: '8px', borderRadius: '4px' }}>
          <option value="pvp">Local PvP (1v1)</option>
          <option value="bot">Play vs Bot</option>
        </select>

        {mode === 'bot' && (
          <select value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))} style={{ padding: '8px', borderRadius: '4px' }}>
            <option value={1}>Level 1 (Noob)</option>
            <option value={2}>Level 2 (Easy)</option>
            <option value={3}>Level 3 (Medium)</option>
            <option value={4}>Level 4 (Hard)</option>
            <option value={5}>Level 5 (Grandmaster)</option>
          </select>
        )}
        <button onClick={resetGame} style={{ padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          New Game
        </button>
      </div>

      {/* Leaderboard & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '20px', background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#d9534f' }}>{status}</h3>
        </div>
        <div style={{ textAlign: 'left' }}>
          <strong style={{ display: 'block', borderBottom: '1px solid #ccc', paddingBottom: '5px', marginBottom: '5px' }}>Leaderboard</strong>
          <span style={{ fontSize: '14px' }}>PvP Matches Played: <strong>{leaderboard.pvpMatches}</strong></span><br/>
          <span style={{ fontSize: '14px' }}>Bot Defeats (Player Wins): <strong>{leaderboard.botWins}</strong></span>
        </div>
      </div>

      {/* Board */}
      <div style={{ width: '400px', maxWidth: '100%', margin: '0 auto' }}>
        <Chessboard position={game.fen()} onPieceDrop={onDrop} boardOrientation="white" />
      </div>
    </div>
  );
};

export default ChessGame;