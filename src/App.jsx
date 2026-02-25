import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TicTacToe from './pages/TicTacToe';
import MemoryGame from './pages/MemoryGame';
import ReactionGame from './pages/ReactionGame';
import ChessGame from './pages/ChessGame'; 
import SnakeGame from './pages/SnakeGame';
import './styles/App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<TicTacToe />} />
        <Route path="/memory" element={<MemoryGame />} />
        <Route path="/reaction" element={<ReactionGame />} />
        <Route path="/chess" element={<ChessGame />} />
        <Route path="/snake" element={<SnakeGame />} />
      </Routes>
    </Router>
  );
}

export default App;