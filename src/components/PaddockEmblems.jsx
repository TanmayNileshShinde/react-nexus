import React from 'react';

const FLAG_DEFS = {
  Netherlands: () => (
    <>
      <rect width="36" height="8" y="0" fill="#AE1C28" />
      <rect width="36" height="8" y="8" fill="#FFFFFF" />
      <rect width="36" height="8" y="16" fill="#21468B" />
    </>
  ),
  Germany: () => (
    <>
      <rect width="36" height="8" y="0" fill="#111111" />
      <rect width="36" height="8" y="8" fill="#DD0000" />
      <rect width="36" height="8" y="16" fill="#FFCE00" />
    </>
  ),
  Austria: () => (
    <>
      <rect width="36" height="8" y="0" fill="#ED2939" />
      <rect width="36" height="8" y="8" fill="#FFFFFF" />
      <rect width="36" height="8" y="16" fill="#ED2939" />
    </>
  ),
  Monaco: () => (
    <>
      <rect width="36" height="12" y="0" fill="#CE1126" />
      <rect width="36" height="12" y="12" fill="#FFFFFF" />
    </>
  ),
  France: () => (
    <>
      <rect width="12" height="24" x="0" fill="#002395" />
      <rect width="12" height="24" x="12" fill="#FFFFFF" />
      <rect width="12" height="24" x="24" fill="#ED2939" />
    </>
  ),
  Spain: () => (
    <>
      <rect width="36" height="6" y="0" fill="#AA151B" />
      <rect width="36" height="12" y="6" fill="#F1BF00" />
      <rect width="36" height="6" y="18" fill="#AA151B" />
      <circle cx="11" cy="12" r="2.3" fill="#AA151B" />
    </>
  ),
  'United Kingdom': () => (
    <>
      <rect width="36" height="24" fill="#012169" />
      <path d="M0 0L36 24M36 0L0 24" stroke="#FFFFFF" strokeWidth="4.5" />
      <path d="M0 0L36 24M36 0L0 24" stroke="#C8102E" strokeWidth="2.2" />
      <path d="M18 0V24M0 12H36" stroke="#FFFFFF" strokeWidth="6.5" />
      <path d="M18 0V24M0 12H36" stroke="#C8102E" strokeWidth="3.8" />
    </>
  ),
  Finland: () => (
    <>
      <rect width="36" height="24" fill="#FFFFFF" />
      <rect width="6" height="24" x="10" fill="#003580" />
      <rect width="36" height="6" y="9" fill="#003580" />
    </>
  ),
  Denmark: () => (
    <>
      <rect width="36" height="24" fill="#C60C30" />
      <rect width="5" height="24" x="10" fill="#FFFFFF" />
      <rect width="36" height="5" y="9.5" fill="#FFFFFF" />
    </>
  ),
  Japan: () => (
    <>
      <rect width="36" height="24" fill="#FFFFFF" />
      <circle cx="18" cy="12" r="6.5" fill="#BC002D" />
    </>
  ),
  China: () => (
    <>
      <rect width="36" height="24" fill="#DE2910" />
      <polygon points="7,4 8.1,7.4 11.6,7.4 8.8,9.4 9.8,12.8 7,10.8 4.2,12.8 5.2,9.4 2.4,7.4 5.9,7.4" fill="#FFDE00" />
      <circle cx="13.5" cy="5.2" r="1.1" fill="#FFDE00" />
      <circle cx="15" cy="8.2" r="1.1" fill="#FFDE00" />
      <circle cx="14.5" cy="11.4" r="1.1" fill="#FFDE00" />
    </>
  ),
  Brazil: () => (
    <>
      <rect width="36" height="24" fill="#009C3B" />
      <polygon points="18,3 32,12 18,21 4,12" fill="#FFDF00" />
      <circle cx="18" cy="12" r="4.8" fill="#002776" />
      <path d="M13.5 11.4Q18 10 22.5 12.6" stroke="#FFFFFF" strokeWidth="1.1" fill="none" />
    </>
  ),
  Mexico: () => (
    <>
      <rect width="12" height="24" x="0" fill="#006847" />
      <rect width="12" height="24" x="12" fill="#FFFFFF" />
      <rect width="12" height="24" x="24" fill="#CE1126" />
      <circle cx="18" cy="12" r="2.6" fill="#8B5A2B" />
    </>
  ),
  Canada: () => (
    <>
      <rect width="9" height="24" x="0" fill="#D80621" />
      <rect width="18" height="24" x="9" fill="#FFFFFF" />
      <rect width="9" height="24" x="27" fill="#D80621" />
      <polygon points="18,6 19.6,10 23,9.5 20.8,12.5 22,15 18,14 14,15 15.2,12.5 13,9.5 16.4,10" fill="#D80621" />
      <rect width="1.6" height="4" x="17.2" y="14" fill="#D80621" />
    </>
  ),
  Australia: () => (
    <>
      <rect width="36" height="24" fill="#00008B" />
      <rect width="16" height="11" fill="#012169" />
      <path d="M0 0L16 11M16 0L0 11" stroke="#FFFFFF" strokeWidth="2.2" />
      <path d="M8 0V11M0 5.5H16" stroke="#FFFFFF" strokeWidth="3.2" />
      <path d="M8 0V11M0 5.5H16" stroke="#C8102E" strokeWidth="1.8" />
      <circle cx="8" cy="17.5" r="2" fill="#FFFFFF" />
      <circle cx="27" cy="6.5" r="1.3" fill="#FFFFFF" />
      <circle cx="24" cy="12" r="1.3" fill="#FFFFFF" />
      <circle cx="30" cy="11.5" r="1.3" fill="#FFFFFF" />
      <circle cx="27" cy="18" r="1.5" fill="#FFFFFF" />
    </>
  ),
  Thailand: () => (
    <>
      <rect width="36" height="4" y="0" fill="#A51931" />
      <rect width="36" height="4" y="4" fill="#F4F5F8" />
      <rect width="36" height="8" y="8" fill="#2D2A4A" />
      <rect width="36" height="4" y="16" fill="#F4F5F8" />
      <rect width="36" height="4" y="20" fill="#A51931" />
    </>
  ),
};

/**
 * Renders a crisp cross-platform SVG national flag.
 */
export function FlagIcon({ country, size = 28, title }) {
  const renderFlag = FLAG_DEFS[country];
  const height = Math.round((size * 24) / 36);

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 36 24"
      role="img"
      aria-label={title || country}
      style={{
        borderRadius: '4px',
        flexShrink: 0,
        boxShadow: '0 1px 4px rgba(0,0,0,0.45)',
        border: '1px solid rgba(255,255,255,0.16)',
        display: 'block',
      }}
    >
      {renderFlag ? (
        renderFlag()
      ) : (
        <>
          <rect width="36" height="24" fill="#27272A" />
          <text
            x="18"
            y="15"
            textAnchor="middle"
            fill="#F4F4F5"
            fontSize="9"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            {(country || 'F1').slice(0, 3).toUpperCase()}
          </text>
        </>
      )}
    </svg>
  );
}

const TEAM_META = {
  'Red Bull': { abbr: 'RBR', label: 'Red Bull', accent: '#FCD700', secondary: '#E10600' },
  Ferrari: { abbr: 'SF', label: 'Ferrari', accent: '#FFF200', secondary: '#DC0000' },
  Mercedes: { abbr: 'MER', label: 'Mercedes', accent: '#E5E7EB', secondary: '#00D2BE' },
  McLaren: { abbr: 'MCL', label: 'McLaren', accent: '#FF8000', secondary: '#FFFFFF' },
  'Aston Martin': { abbr: 'AMR', label: 'Aston Martin', accent: '#FFFFFF', secondary: '#006F62' },
  Alpine: { abbr: 'ALP', label: 'Alpine', accent: '#38BDF8', secondary: '#EC4899' },
  Williams: { abbr: 'WIL', label: 'Williams', accent: '#38BDF8', secondary: '#FFFFFF' },
  Haas: { abbr: 'HAA', label: 'Haas', accent: '#FFFFFF', secondary: '#E10600' },
  RB: { abbr: 'RB', label: 'VCARB', accent: '#60A5FA', secondary: '#FFFFFF' },
  'Kick Sauber': { abbr: 'SAU', label: 'Sauber', accent: '#52E252', secondary: '#FFFFFF' },
  'Alfa Romeo': { abbr: 'ALF', label: 'Alfa Romeo', accent: '#FCA5A5', secondary: '#FFFFFF' },
};

/**
 * Normalizes retired/composite team strings and renders a clean vector F1 constructor badge.
 */
export function TeamBadge({ team }) {
  const cleanTeam = (team || '').replace(/^Retired\s*\/\s*/i, '').trim();
  const isRetiredOnly = cleanTeam === 'Retired' || cleanTeam === 'Sky F1' || cleanTeam === 'Stock Car';
  const meta = TEAM_META[cleanTeam];

  if (!meta) {
    return (
      <span className="paddock-team-fallback" title={team}>
        {isRetiredOnly ? 'RET' : cleanTeam.slice(0, 7).toUpperCase()}
      </span>
    );
  }

  return (
    <div className="paddock-team-badge" title={team}>
      <ConstructorMark team={cleanTeam} accent={meta.accent} secondary={meta.secondary} />
      <span className="paddock-team-short">{meta.abbr}</span>
    </div>
  );
}

function ConstructorMark({ team, accent, secondary }) {
  switch (team) {
    case 'Ferrari':
      return (
        <svg width="18" height="22" viewBox="0 0 24 28" aria-hidden="true">
          <path d="M4 3H20V16C20 21.5 12 26 12 26C12 26 4 21.5 4 16V3Z" fill={accent} stroke="#111" strokeWidth="1.5" />
          <rect x="5.5" y="4.5" width="13" height="2.4" fill="#16A34A" />
          <path d="M10 19L12.5 11L15 13L13.5 19H10Z" fill="#111111" />
        </svg>
      );
    case 'Mercedes':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" fill="none" stroke={accent} strokeWidth="1.8" />
          <path d="M12 3V12M12 12L4.8 17.5M12 12L19.2 17.5" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'Red Bull':
      return (
        <svg width="24" height="18" viewBox="0 0 32 24" aria-hidden="true">
          <circle cx="16" cy="12" r="6" fill={accent} />
          <path d="M3 13L13 10L11 15L5 15Z" fill={secondary} />
          <path d="M29 13L19 10L21 15L27 15Z" fill={secondary} />
        </svg>
      );
    case 'McLaren':
      return (
        <svg width="22" height="16" viewBox="0 0 28 20" aria-hidden="true">
          <path d="M3 14C9 5 18 3 25 5C20 8 15 11 11 16C9 14 6 14 3 14Z" fill={accent} />
        </svg>
      );
    case 'Aston Martin':
      return (
        <svg width="26" height="16" viewBox="0 0 32 18" aria-hidden="true">
          <path d="M2 6H30L24 13H8L2 6Z" fill="none" stroke={accent} strokeWidth="1.7" />
          <path d="M6 9H26" stroke={secondary} strokeWidth="2.2" />
        </svg>
      );
    case 'Alpine':
      return (
        <svg width="20" height="18" viewBox="0 0 24 22" aria-hidden="true">
          <path d="M4 18L13 4H17L11 18H4Z" fill={accent} />
          <path d="M12 13H20L17 18" stroke={secondary} strokeWidth="2" fill="none" />
        </svg>
      );
    case 'Williams':
      return (
        <svg width="22" height="18" viewBox="0 0 26 20" aria-hidden="true">
          <path d="M3 5L7.5 15L12 7L16.5 15L21 5" stroke={accent} strokeWidth="2.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'Haas':
      return (
        <svg width="20" height="18" viewBox="0 0 24 22" aria-hidden="true">
          <path d="M5 4V18M19 4V18M5 11H19" stroke={secondary} strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );
    case 'RB':
      return (
        <svg width="22" height="18" viewBox="0 0 28 22" aria-hidden="true">
          <rect x="3" y="4" width="22" height="14" rx="4" fill="none" stroke={accent} strokeWidth="1.8" />
          <path d="M8 15V7H12.5C14.2 7 14.2 11 12.5 11H8M12 11L15 15M17 7V15H20.5" stroke={secondary} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'Kick Sauber':
      return (
        <svg width="20" height="18" viewBox="0 0 24 22" aria-hidden="true">
          <path d="M6 4V18M17 4L9 11L17 18" stroke={accent} strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'Alfa Romeo':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="none" stroke={accent} strokeWidth="1.8" />
          <path d="M12 4V20M5 12H19" stroke={secondary} strokeWidth="1.8" />
        </svg>
      );
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="10" r="7" fill="none" stroke={accent} strokeWidth="2" />
          <circle cx="10" cy="10" r="2.5" fill={secondary} />
        </svg>
      );
  }
}
