import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trophy, ChevronUp, ChevronDown, Flag } from 'lucide-react';

// FIREBASE IMPORTS
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

// --- F1 DRIVER DATABASE (UPDATED TO PODIUMS FOR 2026) ---
const f1Data = [
  { id: 1, name: 'Albon', color: '#005AFF', img: '/drivers/albon.webp', podiums: 2 },
  { id: 2, name: 'Alonso', color: '#006F62', img: '/drivers/alonso.webp', podiums: 106 },
  { id: 3, name: 'Antonelli', color: '#00D2BE', img: '/drivers/antonelli.webp', podiums: 0 },
  { id: 4, name: 'Bearman', color: '#B6BABD', img: '/drivers/bearman.webp', podiums: 0 },
  { id: 5, name: 'Bortoleto', color: '#00e701', img: '/drivers/bortoleto.webp', podiums: 0 },
  { id: 6, name: 'Bottas', color: '#B6BABD', img: '/drivers/bottas.webp', podiums: 67 },
  { id: 7, name: 'Colapinto', color: '#005AFF', img: '/drivers/colapinto.webp', podiums: 0 },
  { id: 8, name: 'Gasly', color: '#FF87BC', img: '/drivers/gasly.webp', podiums: 4 },
  { id: 9, name: 'Hadjar', color: '#6692FF', img: '/drivers/hadjar.webp', podiums: 0 },
  { id: 10, name: 'Hamilton', color: '#EF1A2D', img: '/drivers/hamilton.webp', podiums: 201 },
  { id: 11, name: 'Hulkenberg', color: '#00e701', img: '/drivers/hulkenberg.webp', podiums: 0 },
  { id: 12, name: 'Lawson', color: '#6692FF', img: '/drivers/lawson.webp', podiums: 0 },
  { id: 13, name: 'Leclerc', color: '#EF1A2D', img: '/drivers/leclerc.webp', podiums: 41 },
  { id: 14, name: 'Lindblad', color: '#101C50', img: '/drivers/lindblad.webp', podiums: 0 },
  { id: 15, name: 'Norris', color: '#FF8000', img: '/drivers/norris.webp', podiums: 25 },
  { id: 16, name: 'Ocon', color: '#B6BABD', img: '/drivers/ocon.webp', podiums: 3 },
  { id: 17, name: 'Perez', color: '#101C50', img: '/drivers/perez.webp', podiums: 39 },
  { id: 18, name: 'Piastri', color: '#FF8000', img: '/drivers/piastri.webp', podiums: 9 },
  { id: 19, name: 'Russell', color: '#00D2BE', img: '/drivers/russell.webp', podiums: 14 },
  { id: 20, name: 'Sainz', color: '#005AFF', img: '/drivers/sainz.webp', podiums: 25 },
  { id: 21, name: 'Stroll', color: '#006F62', img: '/drivers/stroll.webp', podiums: 3 },
  { id: 22, name: 'Verstappen', color: '#101C50', img: '/drivers/verstappen.webp', podiums: 111 }
];

const getRandomDriver = (excludeDriver) => {
  let driver;
  do {
    driver = f1Data[Math.floor(Math.random() * f1Data.length)];
  } while (excludeDriver && driver.id === excludeDriver.id);
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

  // --- AUTH & DATA SYNC ---
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

  // --- LEADERBOARD FETCHER ---
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

  // --- GAME ENGINE ---
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

    // LOGIC SWITCHED TO PODIUMS
    const isHigher = nextDriver.podiums >= currentDriver.podiums;
    const isLower = nextDriver.podiums <= currentDriver.podiums;
    
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
    }, 1500); 
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
          <div style={{ width: '100%', maxWidth: '750px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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

          {/* THE DRIVER CARDS ARENA - LOCKED HEIGHT */}
          <div style={{ 
            display: 'flex', width: '100%', maxWidth: '750px', gap: '20px', 
            height: '450px', alignItems: 'stretch' // STRICT HEIGHT PREVENTS JUMPING
          }}>
            
            {/* LEFT CARD: Current Driver */}
            <div className="glass-panel" style={{ 
              flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              background: `linear-gradient(to bottom, ${currentDriver.color}11, rgba(0,0,0,0.6))`, 
              border: `2px solid ${currentDriver.color}`,
              boxShadow: `0 0 30px ${currentDriver.color}33`,
              padding: '20px'
            }}>
              <img src={currentDriver.img} alt={currentDriver.name} style={{ width: '150px', height: '150px', objectFit: 'contain', marginBottom: '15px', filter: `drop-shadow(0 0 10px ${currentDriver.color}88)` }} />
              <h2 style={{ color: currentDriver.color, fontSize: '2.2rem', textAlign: 'center', margin: '0 0 15px 0', textShadow: `0 0 10px ${currentDriver.color}55` }}>{currentDriver.name}</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', margin: 0 }}>Has</p>
              
              {/* Fixed height container for numbers so layout doesn't shift */}
              <div style={{ height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h1 style={{ color: 'white', fontSize: '4.5rem', margin: '0', textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>{currentDriver.podiums}</h1>
              </div>
              
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>Podiums</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: '#333', padding: '20px', borderRadius: '50%', color: 'white', fontWeight: '900', fontSize: '1.5rem', boxShadow: '0 0 20px rgba(0,0,0,0.8)', zIndex: 10 }}>
                VS
              </div>
            </div>

            {/* RIGHT CARD: Next Driver Guessing */}
            <div className="glass-panel" style={{ 
              flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              background: `linear-gradient(to bottom, ${nextDriver.color}11, rgba(0,0,0,0.6))`, 
              border: `2px solid ${isGameOver ? '#ff1801' : nextDriver.color}`,
              boxShadow: `0 0 30px ${nextDriver.color}33`,
              padding: '20px'
            }}>
              <img src={nextDriver.img} alt={nextDriver.name} style={{ width: '150px', height: '150px', objectFit: 'contain', marginBottom: '15px', filter: `drop-shadow(0 0 10px ${nextDriver.color}88)` }} />
              <h2 style={{ color: nextDriver.color, fontSize: '2.2rem', textAlign: 'center', margin: '0 0 15px 0', textShadow: `0 0 10px ${nextDriver.color}55` }}>{nextDriver.name}</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', margin: 0 }}>Has</p>
              
              {/* Fixed Height Wrapper for Guessing UI or Reveal */}
              <div style={{ height: '140px', width: '85%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: '10px 0' }}>
                {!revealMode && !isGameOver ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
                    <button onClick={() => handleGuess('higher')} style={{ background: 'rgba(0, 175, 58, 0.2)', border: '2px solid #00af3a', color: '#00af3a', padding: '15px', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                      <ChevronUp size={24}/> HIGHER
                    </button>
                    <button onClick={() => handleGuess('lower')} style={{ background: 'rgba(255, 24, 1, 0.2)', border: '2px solid #ff1801', color: '#ff1801', padding: '15px', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                      <ChevronDown size={24}/> LOWER
                    </button>
                  </div>
                ) : (
                  <h1 style={{ color: isGameOver ? '#ff1801' : 'white', fontSize: '4.5rem', margin: '0', textShadow: `0 0 20px ${isGameOver ? 'rgba(255,24,1,0.5)' : 'rgba(255,255,255,0.5)'}` }}>
                    {nextDriver.podiums}
                  </h1>
                )}
              </div>

              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>Podiums</p>
            </div>

          </div>

          {/* Game Over Message */}
          <div style={{ height: '50px', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isGameOver && (
              <h2 style={{ color: '#ff1801', margin: 0, fontSize: '2.5rem', textShadow: '0 0 20px rgba(255,24,1,0.6)', animation: 'fadeIn 0.5s ease' }}>CRASHED OUT!</h2>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '20px', marginTop: '10px', width: '100%', maxWidth: '750px' }}>
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