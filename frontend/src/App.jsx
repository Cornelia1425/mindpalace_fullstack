import { useState, useRef, useEffect } from 'react'
import './App.css'
import Spiral3D from './Spiral3D';
import AuthForm from "./AuthForm";
import { API_BASE_URL } from './config';

function App() {
  const [milestones, setMilestones] = useState([]);
  const [date, setDate] = useState('');
  const [desc, setDesc] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));
  
  console.log('Initial token from localStorage:', localStorage.getItem("token"));

  // Fetch wins from backend on component mount
  useEffect(() => {
    console.log('useEffect triggered with token:', token);
    if (token) {
      console.log('Token exists, calling fetchWins');
      fetchWins();
    } else {
      console.log('No token, not fetching wins');
    }
  }, [token]);

  const fetchWins = async () => {
    console.log('Fetching wins with token:', token);
    console.log('Token length:', token?.length);
    
    try {
      const response = await fetch(`${API_BASE_URL}/wins`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const wins = await response.json();
        console.log('Fetched wins:', wins);
        console.log('Number of wins fetched:', wins?.length);
        
        // Handle different response formats (desc vs subject field)
        const formattedWins = wins.map(win => ({
          date: win.date,
          desc: win.desc || win.subject || win.text || ''
        }));
        
        setMilestones(formattedWins);
      } else {
        console.error('Failed to fetch wins, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching wins:', error);
      console.error('Error details:', error.message);
    } finally {
      setLoading(false);
    }
  };



  const handleAdd = async (e) => {
    e && e.preventDefault();
    
    // Ensure both date and desc are strings and not empty
    const dateStr = String(date || '').trim();
    const descStr = String(desc || '').trim();
    
    if (!dateStr || !descStr) {
      console.warn('Date and description must be non-empty strings');
      return;
    }
    
    try {
      // Try with 'desc' field first (local backend)
      let response = await fetch(`${API_BASE_URL}/wins`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date: dateStr, desc: descStr })
      });
      
      // If that fails, try with 'subject' field (production backend)
      if (!response.ok) {
        console.log('Trying with subject field for production backend...');
        response = await fetch(`${API_BASE_URL}/wins`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ date: dateStr, subject: descStr })
        });
      }
      
      if (response.ok) {
        // Add the new win to the local state
        setMilestones([...milestones, { date: dateStr, desc: descStr }]);
        setDate('');
        setDesc('');
        setShowModal(false);
      } else {
        console.error('Failed to save win');
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        // Try to parse the error response to provide better feedback
        try {
          const errorObj = JSON.parse(errorText);
          if (errorObj.msg) {
            console.error('Server error message:', errorObj.msg);
          }
        } catch (parseError) {
          console.error('Could not parse error response as JSON');
        }
      }
    } catch (error) {
      console.error('Error saving win:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setMilestones([]);
  };



  if (!token) {
    return <AuthForm onAuth={setToken} />;
  }

  console.log('Current milestones:', milestones);
  console.log('Loading state:', loading);
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: "'Oxygen', sans-serif",
        color: '#222'
      }}>
        Loading your mind palace...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24, position: 'relative' }}>
      {/* Minimal logout button */}
      <button
        onClick={handleLogout}
        style={{
          position: 'fixed',
          top: 18,
          right: 24,
          background: 'none',
          border: 'none',
          color: '#222',
          fontSize: 16,
          cursor: 'pointer',
          zIndex: 2000,
          fontFamily: "'Oxygen', sans-serif",
          textDecoration: 'underline',
          opacity: 0.7,
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = 1)}
        onMouseLeave={e => (e.currentTarget.style.opacity = 0.7)}
      >
        Log out
      </button>
      <Spiral3D milestones={milestones} />
      {/* Floating Add/Close Button */}
      <button
        onClick={() => setShowModal(show => !show)}
        style={{
          position: 'fixed',
          right: 32,
          bottom: 32,
          color: '#000',
          fontSize: 28,
          fontWeight: 400,
          border: 'none',
          background: 'none',
          boxShadow: 'none',
          outline: 'none',
          cursor: 'pointer',
          zIndex: 1201,
          fontFamily: "'Oxygen', sans-serif",
          padding: 0,
        }}
        aria-label={showModal ? 'Close' : 'Add milestone'}
        tabIndex={0}
        onFocus={e => e.currentTarget.style.outline = 'none'}
        onBlur={e => e.currentTarget.style.outline = 'none'}
      >
        {showModal ? '×' : '+'}
      </button>
      {/* Side Panel for adding milestone */}
      <div
        style={{
          position: 'fixed',
          right: 90,
          width: 340,
          height: 64,
          bottom: 20,
          background: 'none',
          boxShadow: 'none',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 16,
          transition: 'transform 0.35s cubic-bezier(.4,0,.2,1), opacity 0.25s cubic-bezier(.4,0,.2,1)',
          fontFamily: "'Oxygen', sans-serif",
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          borderLeft: 'none',
          transform: showModal ? 'translateX(0)' : 'translateX(120%)',
          opacity: showModal ? 1 : 0,
          pointerEvents: showModal ? 'auto' : 'none',
        }}
      >
        {showModal && (
          <form
            onSubmit={handleAdd}
            style={{
              width: '100%',
              padding: '0 16px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              fontFamily: "'Oxygen', sans-serif",
              background: 'none',
              boxShadow: 'none',
              position: 'relative',
            }}
          >
            <input
              type="text"
              placeholder="MM.DD or range"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ fontFamily: "'Oxygen', sans-serif", fontSize: 15, height: 36, padding: '0 10px', border: '0.5px solid #fff', borderRadius: 6, background: 'rgba(255,255,255,0.12)', color: '#fff', outline: 'none', boxShadow: 'none', margin: 0, flex: 1, minWidth: 0 }}
              autoFocus
            />
            <input
              type="text"
              placeholder="Describe your win..."
              value={desc}
              onChange={e => setDesc(e.target.value)}
              style={{ fontFamily: "'Oxygen', sans-serif", fontSize: 15, height: 36, padding: '0 10px', border: '0.5px solid #fff', borderRadius: 6, background: 'rgba(255,255,255,0.12)', color: '#fff', outline: 'none', boxShadow: 'none', margin: 0, flex: 2, minWidth: 0 }}
            />
            <button
              type="submit"
              style={{ fontFamily: "'Oxygen', sans-serif", fontSize: 15, height: 36, padding: '0 16px', border: '0.5px solid #fff', background: 'rgba(30,30,30,0.7)', color: '#fff', borderRadius: 6, cursor: 'pointer', marginLeft: 8, boxShadow: '0 2px 8px #0003', display: 'flex', alignItems: 'center' }}
            >
              Add
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;
