import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import highwayImg from '../assets/highway.png';
import logoImg from '../assets/mowt.jpg';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate network delay for UX
    await new Promise(resolve => setTimeout(resolve, 600));

    // Hardcoded Domain Check
    if (!email.toLowerCase().endsWith('@unra.go.ug')) {
      setError('Access Denied. Only @unra.go.ug domain emails are authorized.');
      setLoading(false);
      return;
    }

    // Role Validation
    if (password === 'super') {
      localStorage.setItem('role', 'super');
      navigate('/admin');
    } else if (password === 'admin') {
      localStorage.setItem('role', 'admin');
      navigate('/admin');
    } else {
      setError('Invalid credentials.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#050B14',
      backgroundImage: 'radial-gradient(circle at top left, rgba(14, 165, 233, 0.15) 0%, #050B14 50%)',
      fontFamily: 'Inter, sans-serif'
    }}>
      
      {/* Left Side - Animated Highway Graphic */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRight: '1px solid rgba(56, 189, 248, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.05) 1px, transparent 1px)',
          backgroundSize: '30px 30px', zIndex: 0
        }}></div>
        
        <img 
          src={highwayImg} 
          alt="Highway Graphic" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            zIndex: 1, 
            opacity: 0.8,
            animation: 'panImage 30s ease-in-out infinite alternate' 
          }} 
        />
        <style>{`
          @keyframes panImage {
            0% { transform: scale(1.05) translateX(-2%); }
            100% { transform: scale(1.05) translateX(2%); }
          }
        `}</style>
        
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, transparent 40%, #050B14 100%)', zIndex: 2 }}></div>
      </div>

      {/* Right Side - Login Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '8% 10%',
        position: 'relative'
      }}>
        
        <Link to="/" style={{ position: 'absolute', top: '2rem', right: '3rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
          &larr; Return to Application
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <img src={logoImg} alt="MoWT Logo" style={{ height: '80px', maxWidth: '120px', objectFit: 'contain', borderRadius: '8px' }} />
          <div>
            <h1 style={{ 
              fontSize: '1.8rem', 
              margin: '0', 
              fontWeight: 700, 
              color: 'var(--text-primary)',
              lineHeight: 1.2
            }}>
              Uganda National Roads Reserve Applications
            </h1>
          </div>
        </div>
        
        <div style={{ color: 'var(--accent-primary)', marginBottom: '3rem', fontSize: '1rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
          Ministry of Works and Transport <br />
          <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>UNRA Secure Portal</span>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '400px' }}>
          
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="first.lastname@unra.go.ug"
              required
              style={{
                width: '100%', background: 'transparent', border: 'none', borderBottom: '2px solid rgba(56, 189, 248, 0.5)',
                color: 'var(--text-primary)', padding: '0.5rem 0', fontSize: '1rem', outline: 'none',
                transition: 'border-color 0.3s'
              }} 
            />
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Security Token</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', background: 'transparent', border: 'none', borderBottom: '2px solid rgba(56, 189, 248, 0.5)',
                color: 'var(--text-primary)', padding: '0.5rem 0', fontSize: '1rem', outline: 'none',
                transition: 'border-color 0.3s'
              }} 
            />
          </div>

          {error && <div style={{ color: 'var(--error)', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            style={{
              marginTop: '1rem', background: 'linear-gradient(90deg, var(--accent-hover), var(--accent-primary))',
              color: 'white', border: 'none', padding: '1rem 2rem', width: 'fit-content', borderRadius: '4px',
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)', transition: 'transform 0.2s',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {loading ? 'Authenticating...' : 'Secure Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
}
