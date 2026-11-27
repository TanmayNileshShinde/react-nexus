import { Chess } from 'chess.js';

const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Simple centrality bonus to encourage natural development
const CENTER_BONUS = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, -10, -10, 10, 10, 5],
  [5, 5, 10, 15, 15, 10, 5, 5],
  [0, 0, 15, 25, 25, 15, 0, 0],
  [5, 5, 15, 25, 25, 15, 5, 5],
  [10, 15, 15, 15, 15, 15, 15, 10],
  [10, 10, 10, 10, 10, 10, 10, 10],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

function evaluateBoard(chess) {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -99999 : 99999;
  }
  if (chess.isDraw()) {
    return 0;
  }

  let score = 0;
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const base = PIECE_VALUES[piece.type] || 0;
      const row = piece.color === 'w' ? 7 - r : r;
      const posBonus = CENTER_BONUS[row][c];
      score += piece.color === 'w' ? base + posBonus : -(base + posBonus);
    }
  }
  return score;
}

function orderMoves(moves) {
  return moves.sort((a, b) => {
    const scoreA = (a.captured ? (PIECE_VALUES[a.captured] || 0) * 10 : 0) + (a.promotion ? 800 : 0);
    const scoreB = (b.captured ? (PIECE_VALUES[b.captured] || 0) * 10 : 0) + (b.promotion ? 800 : 0);
    return scoreB - scoreA;
  });
}

function minimax(chess, depth, alpha, beta, isMaximizing) {
  if (depth === 0 || chess.isGameOver()) {
    return evaluateBoard(chess);
  }

  const moves = orderMoves(chess.moves({ verbose: true }));

  if (isMaximizing) {
    let best = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const val = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      if (val > best) best = val;
      if (best > alpha) alpha = best;
      if (beta <= alpha) break;
    }
    return best;
  }

  let best = Infinity;
  for (const move of moves) {
    chess.move(move);
    const val = minimax(chess, depth - 1, alpha, beta, true);
    chess.undo();
    if (val < best) best = val;
    if (best < beta) beta = best;
    if (beta <= alpha) break;
  }
  return best;
}

/**
 * Computes a strong legal move using alpha-beta minimax for the current side to move.
 */
export function getBestChessMove(fen, depth = 2) {
  const chess = new Chess(fen);
  if (chess.isGameOver()) return null;

  const moves = orderMoves(chess.moves({ verbose: true }));
  if (moves.length === 0) return null;

  const isMaximizing = chess.turn() === 'w';
  let bestScore = isMaximizing ? -Infinity : Infinity;
  let bestMoves = [];

  for (const move of moves) {
    chess.move(move);
    const score = minimax(chess, Math.max(0, depth - 1), -Infinity, Infinity, !isMaximizing);
    chess.undo();

    if (isMaximizing ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)] || moves[0];
}
