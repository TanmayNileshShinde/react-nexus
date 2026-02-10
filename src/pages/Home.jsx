// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, FileText, List, Info } from 'lucide-react';

const Home = () => {
  return (
    <div className="glass-panel" style={{ width: '100%', maxWidth: '600px' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {/* Card 1: The Game */}
        <Link to="/game" style={{ textDecoration: 'none' }}>
          <div className="glass-panel" style={{ 
            padding: '20px', 
            border: '1px solid #00f3ff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer'
          }}>
            <Gamepad2 size={32} color="#00f3ff" />
            <h4 style={{ margin: '10px 0 0 0', color: 'white' }}>Tic-Tac-Toe</h4>
          </div>
        </Link>
        
        {/* Card 2: AngularJS Module */}
        <a href="/angular-dashboard.html" style={{ textDecoration: 'none' }}>
        <div className="glass-panel" style={{ 
            padding: '20px', 
            border: '1px solid #bc13fe', /* Different color for Angular */
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s'
        }}>
            <FileText size={32} color="#bc13fe" />
            <h4 style={{ margin: '10px 0 0 0', color: 'white' }}>Angular Data</h4>
            <p style={{ fontSize: '0.7rem', color: '#ccc', margin: '5px 0 0 0' }}>Units II & III</p>
        </div>
        </a>
        
        {/* Card 3: Placeholder */}
        <div className="glass-panel" style={{ 
          padding: '20px', 
          opacity: 0.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <List size={32} color="#bc13fe" />
          <h4 style={{ margin: '10px 0 0 0', color: 'white' }}>List (Empty)</h4>
        </div>

        {/* Card 4: Placeholder */}
        <div className="glass-panel" style={{ 
          padding: '20px', 
          opacity: 0.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Info size={32} color="#bc13fe" />
          <h4 style={{ margin: '10px 0 0 0', color: 'white' }}>About (Empty)</h4>
        </div>
      </div>
    </div>
  );
};

export default Home;