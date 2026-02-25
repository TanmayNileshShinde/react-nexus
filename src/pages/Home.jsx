import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, FileText, Zap, LayoutGrid, Crown } from 'lucide-react';

const Home = () => {
  return (
    <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', margin: '0 auto', textAlign: 'center', minHeight: 'fit-content', paddingBottom: '40px' }}>
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

      {/* Replaced Grid with Flexbox for perfect centering */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
        
        {/* Card 1: Tic-Tac-Toe */}
        <Link to="/game" style={{ textDecoration: 'none', display: 'block', width: '180px' }}>
          <div className="glass-panel" style={{ 
            padding: '15px',
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
            <Gamepad2 size={28} color="#00f3ff" />
            <h4 style={{ margin: '10px 0 0 0', color: 'white', fontSize: '0.95rem' }}>Tic-Tac-Toe</h4>
            <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.6, color: '#ccc' }}>Vs AI & PvP</p>
          </div>
        </Link>
        
        {/* Card 2: Angular Math Blitz */}
        <a href="/math-game.html" style={{ textDecoration: 'none', display: 'block', width: '180px' }}>
          <div className="glass-panel" style={{ 
            padding: '15px',
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
            <FileText size={28} color="#bc13fe" />
            <h4 style={{ margin: '10px 0 0 0', color: 'white', fontSize: '0.95rem' }}>Math Blitz</h4>
            <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.6, color: '#ccc' }}>AngularJS Quiz</p>
          </div>
        </a>
        
        {/* Card 3: F1 Memory Game */}
        <Link to="/memory" style={{ textDecoration: 'none', display: 'block', width: '180px' }}>
          <div className="glass-panel" style={{ 
            padding: '15px',
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
            <LayoutGrid size={28} color="#ff4444" />
            <h4 style={{ margin: '10px 0 5px 0', color: 'white', fontSize: '0.95rem' }}>F1 Memory</h4>
            <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.6, color: '#ccc' }}>Match Drivers</p>
          </div>
        </Link>

        {/* Card 4: Reaction Test */}
        <Link to="/reaction" style={{ textDecoration: 'none', display: 'block', width: '180px' }}>
          <div className="glass-panel" style={{ 
            padding: '15px',
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
            <Zap size={28} color="#00af3a" />
            <h4 style={{ margin: '10px 0 0 0', color: 'white', fontSize: '0.95rem' }}>Reaction Test</h4>
            <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.6, color: '#ccc' }}>Test Reactions</p>
          </div>
        </Link>

        {/* Card 5: The Grandmaster (Chess) */}
        <Link to="/chess" style={{ textDecoration: 'none', display: 'block', width: '180px' }}>
          <div className="glass-panel" style={{ 
            padding: '15px',
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
            <Crown size={28} color="#ffd700" />
            <h4 style={{ margin: '10px 0 0 0', color: 'white', fontSize: '0.95rem' }}>Nexus Chess</h4>
            <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.6, color: '#ccc' }}>Vs Bot & PvP</p>
          </div>
        </Link>
        
      </div>
    </div>
  );
};

export default Home;