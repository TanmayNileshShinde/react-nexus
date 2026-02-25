import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trophy, Keyboard, Terminal } from 'lucide-react';
import styles from '../styles/Game.module.css';

// FIREBASE IMPORTS
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const codeSnippets = [
  // --- REACT & JSX ---
  "const [user, setUser] = useState(null);",
  "useEffect(() => {\n  console.log('Component mounted');\n}, []);",
  "<div className=\"glass-panel\">\n  <h1>React Nexus</h1>\n</div>",
  "const newBoard = [...board];\nnewBoard[index] = isXNext ? 'X' : 'O';",

  // --- PYTHON ---
  "def calculate_score(points, bonus):\n    return points + (bonus * 2)",
  "import pandas as pd\ndf = pd.read_csv('data.csv')\nprint(df.head())",
  "for i in range(10):\n    print(f'Processing item {i}')",
  "with open('config.json', 'r') as file:\n    data = json.load(file)",

  // --- ANGULAR (TypeScript) ---
  "@Component({\n  selector: 'app-root',\n  templateUrl: './app.component.html'\n})\nexport class AppComponent {}",
  "ngOnInit(): void {\n  this.dataService.fetchData().subscribe();\n}",
  "import { Injectable } from '@angular/core';\n@Injectable({ providedIn: 'root' })",

  // --- ANGULARJS (Legacy 1.x) ---
  "app.controller('MainCtrl', function($scope) {\n  $scope.greeting = 'Hello World';\n});",
  "angular.module('myApp', []).directive('myDirective', function() {});",
  "$http.get('/api/data').then(function(response) {\n  $scope.data = response.data;\n});",

  // --- NODE.JS / EXPRESS ---
  "app.get('/api/users', (req, res) => {\n  res.json({ status: 'success' });\n});",
  "mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });"
];

const TypingMaster = () => {
  // --- STATES ---
  const [user, setUser] = useState(null);
  const [view, setView] = useState('menu'); 
  const [stats, setStats] = useState({ typingWPM: 0, typingMatches: 0 });
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Game States
  const [snippet, setSnippet] = useState("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  const inputRef = useRef(null);

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
          typingWPM: 0, typingMatches: 0 
        };
        await setDoc(userRef, initialData);
        setStats(initialData);
      } else {
        const data = docSnap.data();
        setStats({
          typingWPM: data.typingWPM || 0,
          typingMatches: data.typingMatches || 0
        });
      }
    } catch (error) { console.error("Login failed", error); }
  };

  // --- 2. LEADERBOARD FETCHER ---
  const fetchLeaderboard = async () => {
    setView('leaderboard');
    setIsLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("typingWPM", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      setLeaderboardData(querySnapshot.docs.map(doc => doc.data()));
    } catch (error) { console.error("Error fetching leaderboard:", error); } 
    finally { setIsLoading(false); }
  };

  // --- 3. GAME ENGINE ---
  const resetGame = () => {
    const randomSnippet = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
    setSnippet(randomSnippet);
    setUserInput("");
    setStartTime(null);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(100);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleTyping = (e) => {
    if (isFinished) return;
    
    const val = e.target.value;
    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }
    
    setUserInput(val);

    // Calculate live accuracy
    let correctChars = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === snippet[i]) correctChars++;
    }
    setAccuracy(val.length === 0 ? 100 : Math.round((correctChars / val.length) * 100));

    // Check if finished
    if (val.length === snippet.length) {
      finishGame(val, correctChars);
    }
  };

  const finishGame = async (finalInput, correctChars) => {
    setIsFinished(true);
    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
    
    // WPM formula: (characters / 5) / minutes
    const calculatedWpm = Math.round((finalInput.length / 5) / timeElapsed);
    const finalWpm = isNaN(calculatedWpm) || calculatedWpm < 0 ? 0 : calculatedWpm;
    setWpm(finalWpm);

    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const isNewHighScore = finalWpm > stats.typingWPM;
    
    setStats(prev => ({
      ...prev,
      typingWPM: isNewHighScore ? finalWpm : prev.typingWPM,
      typingMatches: prev.typingMatches + 1
    }));

    await updateDoc(userRef, {
      typingMatches: increment(1),
      ...(isNewHighScore && { typingWPM: finalWpm })
    });
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
          background: 'linear-gradient(to right, #00ff88, #00b8ff)', WebkitBackgroundClip: 'text', color: 'transparent',
          textTransform: 'uppercase', letterSpacing: '4px'
        }}>
          Terminal Typer
        </h2>
      </div>

      {/* MENU VIEW */}
      {view === 'menu' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
          <MenuCard icon={Terminal} title="Start Hacking" subtitle="Code Speed Test" color="#00ff88" onClick={() => { setView('game'); resetGame(); }} />
          <MenuCard icon={Trophy} title="Mainframe Rankings" subtitle="Highest WPM" color="#ffd700" onClick={fetchLeaderboard} />
          
          <Link to="/" style={{ textAlign: 'center', marginTop: '40px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <ArrowLeft size={16}/> Back to Nexus
          </Link>
        </div>
      )}

      {/* GAME VIEW */}
      {view === 'game' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ width: '100%', maxWidth: '700px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00ff88' }}>
                WPM: {wpm}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: accuracy === 100 ? '#00ff88' : '#ffd700' }}>
                ACC: {accuracy}%
              </div>
            </div>
            
            {!user ? (
              <button onClick={handleLogin} style={{ background: 'white', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '25px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>Login to Save</button>
            ) : (
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div>
                  <div style={{ fontSize: '1rem', color: 'white', fontWeight: 'bold' }}>{user.displayName}</div>
                  <div style={{ fontSize: '0.85rem', color: '#00b8ff' }}>Best: {stats.typingWPM} WPM</div>
                </div>
                <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" style={{ width: 45, height: 45, borderRadius: '50%', border: '3px solid #00ff88' }} />
              </div>
            )}
          </div>

          {/* THE TERMINAL BOARD */}
          <div style={{ 
            width: '100%', maxWidth: '700px', background: '#0d1117', 
            border: `2px solid ${isFinished ? '#00ff88' : 'rgba(0, 255, 136, 0.3)'}`, borderRadius: '12px', 
            padding: '40px', position: 'relative', boxShadow: '0 0 40px rgba(0, 255, 136, 0.1)',
            minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start'
          }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
               <div style={{width: 12, height: 12, borderRadius: '50%', background: '#ff5f56'}}></div>
               <div style={{width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e'}}></div>
               <div style={{width: 12, height: 12, borderRadius: '50%', background: '#27c93f'}}></div>
            </div>

            {/* Displaying the text character by character */}
            <div style={{ fontSize: '1.6rem', fontFamily: 'monospace', lineHeight: '1.6', color: '#8b949e', whiteSpace: 'pre-wrap', textAlign: 'left', width: '100%' }} onClick={() => inputRef.current?.focus()}>
              {snippet.split('').map((char, idx) => {
                let color = '#8b949e'; // default gray
                let background = 'transparent';
                
                if (idx < userInput.length) {
                  const isCorrect = char === userInput[idx];
                  color = isCorrect ? '#00ff88' : '#ff4444';
                  background = isCorrect ? 'transparent' : 'rgba(255, 68, 68, 0.2)';
                }
                
                const isCursor = idx === userInput.length && !isFinished;

                return (
                  <span key={idx} style={{ 
                    color, 
                    background,
                    borderBottom: isCursor ? '3px solid #00ff88' : 'none',
                    animation: isCursor ? 'pulse 1s infinite' : 'none'
                  }}>
                    {char}
                  </span>
                );
              })}
            </div>

            {/* Hidden Input field to capture typing on desktop & mobile */}
            <textarea 
              ref={inputRef}
              value={userInput}
              onChange={handleTyping}
              disabled={isFinished}
              style={{ position: 'absolute', opacity: 0, top: 0, left: 0, height: '10px', width: '10px', pointerEvents: 'none' }}
              autoFocus
            />

            {isFinished && (
              <div style={{ marginTop: '40px', padding: '20px', background: 'rgba(0, 255, 136, 0.1)', borderRadius: '8px', width: '100%', textAlign: 'center', border: '1px solid rgba(0, 255, 136, 0.3)' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#00ff88', fontSize: '1.8rem' }}>HACK COMPLETE</h3>
                <p style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>Speed: <strong>{wpm} WPM</strong> | Accuracy: <strong>{accuracy}%</strong></p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '20px', marginTop: '40px', width: '100%', maxWidth: '700px' }}>
            <button onClick={() => { setView('menu'); setIsFinished(false); }} style={{ flex: 1, padding: '20px', background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              <ArrowLeft size={24}/> MENU
            </button>
            <button onClick={resetGame} style={{ flex: 1, padding: '20px', background: 'rgba(0, 255, 136, 0.1)', border: '2px solid #00ff88', color: '#00ff88', borderRadius: '12px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              <RefreshCw size={24}/> NEXT SCRIPT
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
               <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '50px', color: 'white', fontSize: '1.2rem' }}>Decrypting Database...</div>
            ) : leaderboardData.length === 0 ? (
               <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '50px', color: 'white', fontSize: '1.2rem' }}>No hacks recorded yet.</div>
            ) : (
              leaderboardData.map((player, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', marginBottom: '15px', borderRadius: '16px', background: index === 0 ? 'linear-gradient(90deg, rgba(255,215,0,0.2) 0%, rgba(255,255,255,0.05) 100%)' : 'rgba(255,255,255,0.05)', border: index === 0 ? '2px solid rgba(255,215,0,0.5)' : '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: index === 0 ? '#ffd700' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: index === 0 ? 'black' : 'white', fontSize: '1.2rem' }}>{index + 1}</div>
                    <img src={player.photoURL} alt="Player" referrerPolicy="no-referrer" style={{ width: 50, height: 50, borderRadius: '50%' }} />
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'white' }}>{player.displayName || "Unknown"}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#00ff88', fontWeight: 'bold', fontSize: '1.8rem' }}>{player.typingWPM || 0}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.5, color: 'white' }}>WPM</div>
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

export default TypingMaster;