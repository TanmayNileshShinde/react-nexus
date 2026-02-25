import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, FileText, Zap, LayoutGrid, Crown } from 'lucide-react';

const Home = () => {
  // Shared styles for uniform, compact cards
  const cardWrapperStyle = { 
    textDecoration: 'none', 
    display: 'block', 
    width: '180px' 
  };

  const cardInnerStyle = (borderColor) => ({
    padding: '15px',
    border: `1px solid ${borderColor}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center', // Centers content perfectly in the middle
    cursor: 'pointer',
    transition: 'transform 0.2s',
    height: '120px', // Decreased height for a more compact look
    boxSizing: 'border-box'
  });

  return (
    <div className="glass-panel" style={{ 
      width: 'fit-content', 
      margin: '40px auto', 
      textAlign: 'center', 
      padding: '40px', 
      height: 'fit-content' 
    }}>
      <h1 style={{ 
        fontSize: '2.5rem', 
        background: 'linear-gradient(to right, #00f3ff, #bc13fe)', 
        WebkitBackgroundClip: 'text', 
        color: 'transparent',
        margin: '0 0 10px 0'
      }}>
        React Nexus
      </h1>
      
      <p style={{ opacity: 0.7, marginBottom: '30px' }}>
        Code. Play. Create.
      </p>

      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        gap: '20px', 
        maxWidth: '800px', 
        margin: '0 auto' 
      }}>
        
        {/* Card 1: Tic-Tac-Toe */}
        <Link to="/game" style={cardWrapperStyle}>
          <div className="glass-panel" style={cardInnerStyle('#00f3ff')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Gamepad2 size={28} color="#00f3ff" />
            <h4 style={{ margin: '8px 0 0 0', color: 'white', fontSize: '0.9rem' }}>Tic-Tac-Toe</h4>
            <p style={{ margin: 0, fontSize: '0.65rem', opacity: 0.6, color: '#ccc' }}>Vs AI & PvP</p>
          </div>
        </Link>
        
        {/* Card 2: Math Blitz */}
        <a href="/math-game.html" style={cardWrapperStyle}>
          <div className="glass-panel" style={cardInnerStyle('#bc13fe')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <FileText size={28} color="#bc13fe" />
            <h4 style={{ margin: '8px 0 0 0', color: 'white', fontSize: '0.9rem' }}>Math Blitz</h4>
            <p style={{ margin: 0, fontSize: '0.65rem', opacity: 0.6, color: '#ccc' }}>AngularJS Quiz</p>
          </div>
        </a>
        
        {/* Card 3: F1 Memory Game */}
        <Link to="/memory" style={cardWrapperStyle}>
          <div className="glass-panel" style={cardInnerStyle('#ff4444')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <LayoutGrid size={28} color="#ff4444" />
            <h4 style={{ margin: '8px 0 0 0', color: 'white', fontSize: '0.9rem' }}>F1 Memory</h4>
            <p style={{ margin: 0, fontSize: '0.65rem', opacity: 0.6, color: '#ccc' }}>Match Drivers</p>
          </div>
        </Link>

        {/* Card 4: Reaction Test */}
        <Link to="/reaction" style={cardWrapperStyle}>
          <div className="glass-panel" style={cardInnerStyle('#00af3a')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Zap size={28} color="#00af3a" />
            <h4 style={{ margin: '8px 0 0 0', color: 'white', fontSize: '0.9rem' }}>Reaction Test</h4>
            <p style={{ margin: 0, fontSize: '0.65rem', opacity: 0.6, color: '#ccc' }}>Test Reactions</p>
          </div>
        </Link>

        {/* Card 5: Nexus Chess */}
        <Link to="/chess" style={cardWrapperStyle}>
          <div className="glass-panel" style={cardInnerStyle('#ffd700')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Crown size={28} color="#ffd700" />
            <h4 style={{ margin: '8px 0 0 0', color: 'white', fontSize: '0.9rem' }}>Nexus Chess</h4>
            <p style={{ margin: 0, fontSize: '0.65rem', opacity: 0.6, color: '#ccc' }}>Vs Bot & PvP</p>
          </div>
        </Link>
        
      </div>
    </div>
  );
};

export default Home;