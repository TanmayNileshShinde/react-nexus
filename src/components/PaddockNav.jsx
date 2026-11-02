import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Flag, Grid, GitBranch, Flame } from 'lucide-react';
import '../styles/paddockdle.css';

const PaddockNav = ({ activeTab }) => {
  const location = useLocation();

  const tabs = [
    {
      id: 'classic',
      label: 'Classic Wordle',
      icon: Flag,
      path: '/paddockdle',
      badge: '6 Guesses',
    },
    {
      id: 'grid',
      label: '3×3 Grid',
      icon: Grid,
      path: '/paddockdle-grid',
      badge: 'Immaculate',
    },
    {
      id: 'career',
      label: 'Career Guesser',
      icon: GitBranch,
      path: '/paddockdle-career',
      badge: 'Timeline',
    },
  ];

  return (
    <div className="paddock-nav-wrapper">
      {/* Top Header Bar */}
      <div className="paddock-nav-top">
        <Link to="/" className="paddock-nav-back">
          <ArrowLeft size={14} />
          <span>Nexus Arcade</span>
        </Link>

        <div className="paddock-nav-badge">
          <Flame size={14} />
          <span>PaddockDle F1 Hub</span>
        </div>

        <div className="paddock-nav-subtitle">
          FIA Telemetry Engine
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="paddock-nav-tabs">
        {tabs.map((tab) => {
          const isActive =
            activeTab === tab.id || location.pathname === tab.path;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`paddock-tab-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              <span className="paddock-tab-pill">{tab.badge}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PaddockNav;
