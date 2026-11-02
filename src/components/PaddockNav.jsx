import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Flag, Grid, GitBranch, Flame } from 'lucide-react';

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
    <div className="w-full max-w-4xl mx-auto mb-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Nexus Arcade</span>
        </Link>

        <div className="flex items-center gap-2 text-center">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 font-mono text-xs uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 animate-pulse" />
            <span>PaddockDle F1 Hub</span>
          </div>
        </div>

        <div className="text-right text-[11px] text-white/40 hidden sm:block font-mono">
          FIA Telemetry Engine
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="grid grid-cols-3 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
        {tabs.map((tab) => {
          const isActive =
            activeTab === tab.id || location.pathname === tab.path;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 py-2.5 px-2 rounded-xl text-center font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 border border-red-400/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <div className="flex flex-col sm:flex-row items-center sm:gap-2">
                <span className="text-xs sm:text-sm font-semibold tracking-wide">
                  {tab.label}
                </span>
                <span
                  className={`text-[9px] sm:text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-black/30 text-red-100'
                      : 'bg-white/10 text-white/50'
                  }`}
                >
                  {tab.badge}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PaddockNav;
