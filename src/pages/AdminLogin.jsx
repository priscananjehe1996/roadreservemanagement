import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import highwayImg from '../assets/highway.png';
import logoImg from '../assets/mowt_logo.png';

const HARDCODED_PASSWORD = 'admin';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === HARDCODED_PASSWORD) {
      localStorage.setItem('admin_authenticated', 'true');
      navigate('/admin');
    } else {
      setError('Invalid master password.');
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
        {/* Subtle grid background pattern */}
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
        
        {/* Dark overlay to blend edges */}
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
          <img src={logoImg} alt="MoWT Logo" style={{ width: '80px', height: '80px', borderRadius: '12px', boxShadow: '0 0 20px rgba(56,189,248,0.2)' }} />
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
          <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>Department of National Roads</span>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '400px' }}>
          
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>User name</label>
            <input 
              type="text" 
              value="admin_root"
              disabled
              style={{
                width: '100%', background: 'transparent', border: 'none', borderBottom: '2px solid rgba(255,255,255,0.1)',
                color: 'var(--text-secondary)', padding: '0.5rem 0', fontSize: '1rem', outline: 'none'
              }} 
            />
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', background: 'transparent', border: 'none', borderBottom: '2px solid rgba(56, 189, 248, 0.5)',
                color: 'var(--text-primary)', padding: '0.5rem 0', fontSize: '1rem', outline: 'none',
                transition: 'border-color 0.3s'
              }} 
              autoFocus
            />
          </div>

          {error && <div style={{ color: 'var(--error)', fontSize: '0.85rem' }}>{error}</div>}

          <button 
            type="submit" 
            style={{
              marginTop: '1rem', background: 'linear-gradient(90deg, var(--accent-hover), var(--accent-primary))',
              color: 'white', border: 'none', padding: '1rem 2rem', width: 'fit-content', borderRadius: '4px',
              fontWeight: 600, cursor: 'pointer', boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)', transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Sign In
          </button>
        </form>

      </div>
    </div>
  );
}
