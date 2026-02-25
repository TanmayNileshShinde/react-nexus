import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, FileText, Zap, LayoutGrid, Crown } from 'lucide-react';

const Home = () => {
  // Shared styles for uniform cards
  const cardWrapperStyle = { 
    textDecoration: 'none', 
    display: 'block', 
    width: '180px' 
  };

  const cardInnerStyle = (borderColor) => ({
    padding: '20px',
    border: `1px solid ${borderColor}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center', // Centers content vertically
    cursor: 'pointer',
    transition: 'transform 0.2s',
    height: '140px', // Fixed height for uniformity
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
        maxWidth: '780px', 
        margin: '0 auto' 
      }}>
        
        {/* Card 1: Tic-Tac-Toe */}
        <Link to="/game" style={cardWrapperStyle}>
          <div className="glass-panel" style={cardInnerStyle('#00f3ff')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Gamepad2 size={32} color="#00f3ff" />
            <h4 style={{ margin: '10px 0 0 0', color: 'white', fontSize: '0.95rem' }}>Tic-Tac-Toe</h4>
            <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.6, color: '#ccc' }}>Vs AI & PvP</p>
          </div>
        </Link>
        
        {/* Card 2: Angular Math Blitz */}
        <a href="/math-game.html" style={cardWrapperStyle}>
          <div className="glass-panel" style={cardInnerStyle('#bc13fe')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <FileText size={32} color="#bc13fe" />
            <h4 style={{ margin: '10px 0 0 0', color: 'white', fontSize: '0.95rem' }}>Math Blitz</h4>
            <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.6, color: '#ccc' }}>AngularJS Quiz</p>
          </div>
        </a>
        
        {/* Card 3: F1 Memory Game */}
        <Link to="/memory" style={cardWrapperStyle}>
          <div className="glass-panel" style={cardInnerStyle('#ff4444')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <LayoutGrid size={32} color="#ff4444" />
            <h4 style={{ margin: '10px 0 5px 0', color: 'white', fontSize: '0.95rem' }}>F1 Memory</h4>
            <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.6, color: '#ccc' }}>Match Drivers</p>
          </div>
        </Link>

        {/* Card 4: Reaction Test */}
        <Link to="/reaction" style={cardWrapperStyle}>
          <div className="glass-panel" style={cardInnerStyle('#00af3a')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Zap size={32} color="#00af3a" />
            <h4 style={{ margin: '10px 0 0 0', color: 'white', fontSize: '0.95rem' }}>Reaction Test</h4>
            <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.6, color: '#ccc' }}>Test Reactions</p>
          </div>
        </Link>

        {/* Card 5: The Grandmaster (Chess) */}
        <Link to="/chess" style={cardWrapperStyle}>
          <div className="glass-panel" style={cardInnerStyle('#ffd700')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Crown size={32} color="#ffd700" />
            <h4 style={{ margin: '10px 0 0 0', color: 'white', fontSize: '0.95rem' }}>Nexus Chess</h4>
            <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.6, color: '#ccc' }}>Vs Bot & PvP</p>
          </div>
        </Link>
        
      </div>
    </div>
  );
};

export default Home;