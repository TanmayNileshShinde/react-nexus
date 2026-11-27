import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Home, Flag, Grid, GitBranch } from 'lucide-react';
import AudioController from './AudioController';
import '../styles/paddockdle.css';

const PaddockNav = ({ activeTab, onOpenStats }) => {
  const location = useLocation();

  const tabs = [
    { id: 'classic', label: 'Wordle', icon: Flag, path: '/paddockdle' },
    { id: 'grid', label: 'Grid', icon: Grid, path: '/paddockdle-grid' },
    { id: 'career', label: 'Career', icon: GitBranch, path: '/paddockdle-career' },
  ];

  return (
    <>
      <div className="paddock-page-backdrop" aria-hidden="true" />
      <header className="paddock-topbar">
        <div className="paddock-topbar-inner">
          <div className="paddock-topbar-left">
            {onOpenStats && (
              <button
                type="button"
                onClick={onOpenStats}
                className="paddock-topbar-icon-btn"
                title="View statistics"
                aria-label="View statistics"
              >
                <Trophy size={17} strokeWidth={1.8} />
              </button>
            )}

            <nav className="paddock-mode-links" aria-label="PaddockDle modes">
              {tabs.map((tab) => {
                const isActive =
                  activeTab === tab.id || location.pathname === tab.path;
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    className={`paddock-mode-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={14} strokeWidth={1.9} />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <Link to="/paddockdle" className="paddock-wordmark">
            <span>PADDOCK</span>
            <span className="paddock-wordmark-red">DLE</span>
          </Link>

          <div className="paddock-topbar-right">
            <AudioController />
            <Link
              to="/"
              className="paddock-topbar-icon-btn"
              title="Back to React Nexus"
              aria-label="Back to React Nexus"
            >
              <Home size={17} strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default PaddockNav;
