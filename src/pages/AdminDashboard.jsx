import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) {
      console.error(error);
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="app-container" style={{ maxWidth: '1200px' }}>
      <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ textAlign: 'left', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
          <p style={{ textAlign: 'left' }}>Official review of Road Reserve applications.</p>
        </div>
        <Link to="/" className="btn-submit" style={{ width: 'auto', padding: '0.5rem 1rem', marginTop: 0, textDecoration: 'none' }}>
          &larr; Back to App
        </Link>
      </div>

      <div className="form-section">
        <h2 style={{ marginBottom: '1rem' }}>Recent Applications</h2>
        
        {loading ? (
          <p>Loading applications...</p>
        ) : applications.length === 0 ? (
          <p>No applications found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem' }}>ID</th>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>Applicant</th>
                  <th style={{ padding: '1rem' }}>Activity</th>
                  <th style={{ padding: '1rem' }}>Location</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1rem' }}>#{app.id}</td>
                    <td style={{ padding: '1rem' }}>{new Date(app.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{app.registeredname || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>{app.natureofbillboardsignagetool || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>{app.physicallocation || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d' }}>
                        Pending
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
