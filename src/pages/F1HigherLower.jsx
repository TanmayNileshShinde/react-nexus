import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trophy, Play, ChevronUp, ChevronDown, Flag } from 'lucide-react';
import styles from '../styles/Game.module.css';

// FIREBASE IMPORTS
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

// --- F1 DRIVER DATABASE (RACE WINS) ---
const f1Data = [
  { name: "Lewis Hamilton", wins: 105, flag: "🇬🇧" },
  { name: "Michael Schumacher", wins: 91, flag: "🇩🇪" },
  { name: "Max Verstappen", wins: 62, flag: "🇳🇱" },
  { name: "Sebastian Vettel", wins: 53, flag: "🇩🇪" },
  { name: "Alain Prost", wins: 51, flag: "🇫🇷" },
  { name: "Ayrton Senna", wins: 41, flag: "🇧🇷" },
  { name: "Fernando Alonso", wins: 32, flag: "🇪🇸" },
  { name: "Nigel Mansell", wins: 31, flag: "🇬🇧" },
  { name: "Jackie Stewart", wins: 27, flag: "🇬🇧" },
  { name: "Niki Lauda", wins: 25, flag: "🇦🇹" },
  { name: "Nico Rosberg", wins: 23, flag: "🇩🇪" },
  { name: "Kimi Raikkonen", wins: 21, flag: "🇫🇮" },
  { name: "Mika Hakkinen", wins: 20, flag: "🇫🇮" },
  { name: "Jenson Button", wins: 15, flag: "🇬🇧" },
  { name: "David Coulthard", wins: 13, flag: "🇬🇧" },
  { name: "Valtteri Bottas", wins: 10, flag: "🇫🇮" },
  { name: "Mark Webber", wins: 9, flag: "🇦🇺" },
  { name: "Charles Leclerc", wins: 8, flag: "🇲🇨" },
  { name: "Daniel Ricciardo", wins: 8, flag: "🇦🇺" },
  { name: "Sergio Perez", wins: 6, flag: "🇲🇽" },
  { name: "Carlos Sainz", wins: 4, flag: "🇪🇸" },
  { name: "Lando Norris", wins: 3, flag: "🇬🇧" },
  { name: "George Russell", wins: 2, flag: "🇬🇧" },
  { name: "Oscar Piastri", wins: 2, flag: "🇦🇺" },
  { name: "Pierre Gasly", wins: 1, flag: "🇫🇷" },
  { name: "Esteban Ocon", wins: 1, flag: "🇫🇷" },
  { name: "Nico Hulkenberg", wins: 0, flag: "🇩🇪" },
  { name: "Kevin Magnussen", wins: 0, flag: "🇩🇰" },
  { name: "Alexander Albon", wins: 0, flag: "🇹🇭" },
  { name: "Yuki Tsunoda", wins: 0, flag: "🇯🇵" },
  { name: "Lance Stroll", wins: 0, flag: "🇨🇦" }
];

const getRandomDriver = (excludeDriver) => {
  let driver;
  do {
    driver = f1Data[Math.floor(Math.random() * f1Data.length)];
  } while (excludeDriver && driver.name === excludeDriver.name);
  return driver;
};

const F1HigherLower = () => {
  // --- STATES ---
  const [user, setUser] = useState(null);
  const [view, setView] = useState('menu'); 
  const [stats, setStats] = useState({ f1HighScore: 0, f1Matches: 0 });
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Game States
  const [currentDriver, setCurrentDriver] = useState(getRandomDriver(null));
  const [nextDriver, setNextDriver] = useState(getRandomDriver(currentDriver));
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [revealMode, setRevealMode] = useState(false);

  // --- 1. AUTH & DATA SYNC ---
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      
      const userRef = doc(db, "users", result.user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        const initialData = { 
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          f1HighScore: 0, f1Matches: 0 
        };
        await setDoc(userRef, initialData);
        setStats(initialData);
      } else {
        const data = docSnap.data();
        setStats({
          f1HighScore: data.f1HighScore || 0,
          f1Matches: data.f1Matches || 0
        });
      }
    } catch (error) { console.error("Login failed", error); }
  };

  // --- 2. LEADERBOARD FETCHER ---
  const fetchLeaderboard = async () => {
    setView('leaderboard');
    setIsLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("f1HighScore", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      setLeaderboardData(querySnapshot.docs.map(doc => doc.data()));
    } catch (error) { console.error("Error fetching leaderboard:", error); } 
    finally { setIsLoading(false); }
  };

  // --- 3. GAME ENGINE ---
  const resetGame = () => {
    const first = getRandomDriver(null);
    setCurrentDriver(first);
    setNextDriver(getRandomDriver(first));
    setScore(0);
    setIsGameOver(false);
    setRevealMode(false);
  };

  const gameOver = async () => {
    setIsGameOver(true);
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const isNewHighScore = score > stats.f1HighScore;
    
    setStats(prev => ({
      ...prev,
      f1HighScore: isNewHighScore ? score : prev.f1HighScore,
      f1Matches: prev.f1Matches + 1
    }));

    await updateDoc(userRef, {
      f1Matches: increment(1),
      ...(isNewHighScore && { f1HighScore: score })
    });
  };

  const handleGuess = (guessType) => {
    if (revealMode || isGameOver) return;
    setRevealMode(true);

    const isHigher = nextDriver.wins >= currentDriver.wins;
    const isLower = nextDriver.wins <= currentDriver.wins;
    
    let isCorrect = false;
    if (guessType === 'higher' && isHigher) isCorrect = true;
    if (guessType === 'lower' && isLower) isCorrect = true;

    setTimeout(() => {
      if (isCorrect) {
        setScore(s => s + 1);
        setCurrentDriver(nextDriver);
        setNextDriver(getRandomDriver(nextDriver));
        setRevealMode(false);
      } else {
        gameOver();
      }
    }, 1500); // 1.5 seconds to show the suspenseful reveal
  };

  // --- UI COMPONENTS ---
  const MenuCard = ({ icon: Icon, title, subtitle, onClick, color }) => (
    <div onClick={onClick} className="glass-panel" style={{ 
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', padding: '30px', 
      border: `1px solid ${color}`, background: `linear-gradient(145deg, rgba(255,255,255,0.03) 0%, ${color}10 100%)`,
      transition: 'all 0.3s ease', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)', marginBottom: '20px'
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 10px 40px ${color}30`; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)'; }}
    >
      <div style={{ background: `${color}20`, padding: '20px', borderRadius: '12px' }}>
        <Icon size={40} color={color}/>
      </div>
      <div style={{ textAlign: 'left' }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>{title}</h3>
        <p style={{ margin: 0, fontSize: '1rem', opacity: 0.6, color: 'white' }}>{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="glass-panel" style={{ 
      width: '100%', maxWidth: '800px', minHeight: '800px', 
      padding: '40px', margin: '40px auto', display: 'flex', flexDirection: 'column', boxSizing: 'border-box'
    }}>
      
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ 
          fontSize: '3rem', fontWeight: '800', margin: 0, 
          background: 'linear-gradient(to right, #ff1801, #ff6a00)', WebkitBackgroundClip: 'text', color: 'transparent',
          textTransform: 'uppercase', letterSpacing: '4px'
        }}>
          F1 Higher / Lower
        </h2>
      </div>

      {/* MENU VIEW */}
      {view === 'menu' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
          <MenuCard icon={Flag} title="Play Career Mode" subtitle="Ranked F1 Trivia" color="#ff1801" onClick={() => { setView('game'); resetGame(); }} />
          <MenuCard icon={Trophy} title="Hall of Fame" subtitle="Top Paddock Scores" color="#ffd700" onClick={fetchLeaderboard} />
          
          <Link to="/" style={{ textAlign: 'center', marginTop: '40px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <ArrowLeft size={16}/> Back to Nexus
          </Link>
        </div>
      )}

      {/* GAME VIEW */}
      {view === 'game' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Top Bar (Score & User) */}
          <div style={{ width: '100%', maxWidth: '700px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff1801', textShadow: '0 0 15px rgba(255, 24, 1, 0.5)' }}>
              STREAK: {score}
            </div>
            
            {!user ? (
              <button onClick={handleLogin} style={{ background: 'white', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '25px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>Login to Save</button>
            ) : (
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div>
                  <div style={{ fontSize: '1rem', color: 'white', fontWeight: 'bold' }}>{user.displayName}</div>
                  <div style={{ fontSize: '0.85rem', color: '#ffd700' }}>Best: {stats.f1HighScore}</div>
                </div>
                <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" style={{ width: 45, height: 45, borderRadius: '50%', border: '3px solid #ff1801' }} />
              </div>
            )}
          </div>

          {/* THE DRIVER CARDS ARENA */}
          <div style={{ 
            display: 'flex', width: '100%', maxWidth: '750px', gap: '20px', 
            minHeight: '400px', alignItems: 'stretch' 
          }}>
            
            {/* LEFT CARD: Current Driver */}
            <div className="glass-panel" style={{ 
              flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(0,0,0,0.5))', border: '2px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '5rem', marginBottom: '10px' }}>{currentDriver.flag}</div>
              <h2 style={{ color: 'white', fontSize: '2rem', textAlign: 'center', margin: '0 0 20px 0' }}>{currentDriver.name}</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', margin: 0 }}>Has</p>
              <h1 style={{ color: '#00f3ff', fontSize: '4.5rem', margin: '10px 0', textShadow: '0 0 20px rgba(0,243,255,0.5)' }}>{currentDriver.wins}</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>Race Wins</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: '#333', padding: '20px', borderRadius: '50%', color: 'white', fontWeight: '900', fontSize: '1.5rem', boxShadow: '0 0 20px rgba(0,0,0,0.8)' }}>
                VS
              </div>
            </div>

            {/* RIGHT CARD: Next Driver Guessing */}
            <div className="glass-panel" style={{ 
              flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(0,0,0,0.5))', border: `2px solid ${isGameOver ? '#ff1801' : 'rgba(255,255,255,0.2)'}`
            }}>
              <div style={{ fontSize: '5rem', marginBottom: '10px' }}>{nextDriver.flag}</div>
              <h2 style={{ color: 'white', fontSize: '2rem', textAlign: 'center', margin: '0 0 20px 0' }}>{nextDriver.name}</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', margin: 0 }}>Has</p>
              
              {/* Guessing UI or Reveal */}
              {!revealMode && !isGameOver ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', margin: '20px 0', width: '80%' }}>
                  <button onClick={() => handleGuess('higher')} style={{ background: 'rgba(0, 175, 58, 0.2)', border: '2px solid #00af3a', color: '#00af3a', padding: '15px', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                    <ChevronUp size={24}/> HIGHER
                  </button>
                  <button onClick={() => handleGuess('lower')} style={{ background: 'rgba(255, 24, 1, 0.2)', border: '2px solid #ff1801', color: '#ff1801', padding: '15px', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                    <ChevronDown size={24}/> LOWER
                  </button>
                </div>
              ) : (
                <h1 style={{ color: isGameOver ? '#ff1801' : '#00af3a', fontSize: '4.5rem', margin: '10px 0', textShadow: `0 0 20px ${isGameOver ? 'rgba(255,24,1,0.5)' : 'rgba(0,175,58,0.5)'}` }}>
                  {nextDriver.wins}
                </h1>
              )}

              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>Race Wins</p>
            </div>

          </div>

          {/* Game Over Message */}
          {isGameOver && (
             <div style={{ marginTop: '30px', textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
                <h2 style={{ color: '#ff1801', margin: '0 0 10px 0', fontSize: '2.5rem', textShadow: '0 0 20px rgba(255,24,1,0.6)' }}>CRASHED OUT!</h2>
             </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '20px', marginTop: '40px', width: '100%', maxWidth: '700px' }}>
            <button onClick={() => { setView('menu'); setIsGameOver(false); }} style={{ flex: 1, padding: '20px', background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              <ArrowLeft size={24}/> MENU
            </button>
            <button onClick={resetGame} style={{ flex: 1, padding: '20px', background: 'rgba(255, 24, 1, 0.1)', border: '2px solid #ff1801', color: '#ff1801', borderRadius: '12px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              <RefreshCw size={24}/> PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* LEADERBOARD VIEW */}
      {view === 'leaderboard' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
             <button onClick={() => setView('menu')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}><ArrowLeft size={32}/></button>
            <h3 style={{ margin: 0, fontSize: '2rem', color: '#ffcc00' }}>Hall of Fame</h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
            {isLoading ? (
               <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '50px', color: 'white', fontSize: '1.2rem' }}>Fetching Paddock Data...</div>
            ) : leaderboardData.length === 0 ? (
               <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '50px', color: 'white', fontSize: '1.2rem' }}>No streaks yet. Set the pace!</div>
            ) : (
              leaderboardData.map((player, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', marginBottom: '15px', borderRadius: '16px', background: index === 0 ? 'linear-gradient(90deg, rgba(255,215,0,0.2) 0%, rgba(255,255,255,0.05) 100%)' : 'rgba(255,255,255,0.05)', border: index === 0 ? '2px solid rgba(255,215,0,0.5)' : '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: index === 0 ? '#ffd700' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: index === 0 ? 'black' : 'white', fontSize: '1.2rem' }}>{index + 1}</div>
                    <img src={player.photoURL} alt="Player" referrerPolicy="no-referrer" style={{ width: 50, height: 50, borderRadius: '50%' }} />
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'white' }}>{player.displayName || "Unknown"}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#ff1801', fontWeight: 'bold', fontSize: '1.8rem' }}>{player.f1HighScore || 0}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.5, color: 'white' }}>Best Streak</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default F1HigherLower;