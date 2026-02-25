import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, FileText, Zap, LayoutGrid, Crown } from 'lucide-react';

const Home = () => {
  return (
    <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
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

      {/* Strict 4-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
        
        {/* Row 1, Card 1: Tic-Tac-Toe */}
        <Link to="/game" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
          <div className="glass-panel" style={{ 
            padding: '20px', 
            border: '1px solid #00f3ff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            height: '100%'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Gamepad2 size={32} color="#00f3ff" />
            <h4 style={{ margin: '10px 0 0 0', color: 'white' }}>Tic-Tac-Toe</h4>
            <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.6, color: '#ccc' }}>Vs AI & PvP</p>
          </div>
        </Link>
        
        {/* Row 1, Card 2: Angular Math Blitz */}
        <a href="/math-game.html" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
          <div className="glass-panel" style={{ 
            padding: '20px', 
            border: '1px solid #bc13fe',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            height: '100%'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <FileText size={32} color="#bc13fe" />
            <h4 style={{ margin: '10px 0 0 0', color: 'white' }}>Math Blitz</h4>
            <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.6, color: '#ccc' }}>AngularJS Quiz</p>
          </div>
        </a>
        
        {/* Row 1, Card 3: F1 Memory Game */}
        <Link to="/memory" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
          <div className="glass-panel" style={{ 
            padding: '20px', 
            border: '1px solid #ff4444',
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            height: '100%'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <LayoutGrid size={32} color="#ff4444" />
            <h4 style={{ margin: '10px 0 5px 0', color: 'white' }}>F1 Memory</h4>
            <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.6, color: '#ccc' }}>Match Drivers</p>
          </div>
        </Link>

        {/* Row 1, Card 4: Reaction Test */}
        <Link to="/reaction" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
          <div className="glass-panel" style={{ 
            padding: '20px', 
            border: '1px solid #00af3a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            height: '100%'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Zap size={32} color="#00af3a" />
            <h4 style={{ margin: '10px 0 0 0', color: 'white' }}>Reaction Test</h4>
            <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.6, color: '#ccc' }}>Test Your Reactions</p>
          </div>
        </Link>

        {/* Row 2, Card 1: The Grandmaster (Chess) */}
        <Link to="/chess" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
          <div className="glass-panel" style={{ 
            padding: '20px', 
            border: '1px solid #ffd700',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            height: '100%'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Crown size={32} color="#ffd700" />
            <h4 style={{ margin: '10px 0 0 0', color: 'white' }}>Nexus Chess</h4>
            <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.6, color: '#ccc' }}>Vs Bot & PvP</p>
          </div>
        </Link>
        
      </div>
    </div>
  );
};

export default Home;