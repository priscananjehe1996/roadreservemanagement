import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const HARDCODED_PASSWORD = 'admin'; // Keeping it simple as requested

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
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="app-container" style={{ maxWidth: '400px', marginTop: '10vh' }}>
      <div className="form-header">
        <h1 style={{ fontSize: '2rem' }}>Admin Access</h1>
        <p>Restricted to authorized officials</p>
      </div>

      <div className="form-section" style={{ padding: '2rem' }}>
        <form onSubmit={handleLogin}>
          {error && (
            <div className="note-box" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeftColor: 'var(--error)', padding: '0.75rem', marginBottom: '1.5rem' }}>
              <p style={{ color: 'var(--error)', margin: 0, fontSize: '0.9rem' }}>{error}</p>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label>Master Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter password"
              required 
              autoFocus
            />
          </div>

          <button type="submit" className="btn-submit" style={{ marginTop: 0 }}>
            Login to Dashboard
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem' }}>
            &larr; Back to Public Form
          </Link>
        </div>
      </div>
    </div>
  );
}
