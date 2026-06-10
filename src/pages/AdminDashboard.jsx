import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#fcd34d', '#10b981', '#ef4444']; // Pending (Yellow), Approved (Green), Rejected (Red)

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('admin_authenticated');
    navigate('/login');
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
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
  }

  // Simulated data for empty state
  const mockMonthlyData = [
    { name: 'Jan', count: 0 },
    { name: 'Feb', count: 0 },
    { name: 'Mar', count: 0 },
    { name: 'Apr', count: 0 },
    { name: 'May', count: 0 },
    { name: 'Jun', count: 0 },
  ];

  const mockStatusData = [
    { name: 'Pending', value: 0 },
    { name: 'Approved', value: 0 },
    { name: 'Rejected', value: 0 },
  ];

  // If there is data, we would compute it here. For now we simulate empty state or use real data.
  const chartData = applications.length > 0 ? applications.reduce((acc, app) => {
    const month = new Date(app.created_at).toLocaleString('default', { month: 'short' });
    const existing = acc.find(item => item.name === month);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ name: month, count: 1 });
    }
    return acc;
  }, []) : mockMonthlyData;

  const statusData = applications.length > 0 ? [
    { name: 'Pending', value: applications.filter(a => a.status === 'Pending' || !a.status).length },
    { name: 'Approved', value: applications.filter(a => a.status === 'Approved').length },
    { name: 'Rejected', value: applications.filter(a => a.status === 'Rejected').length },
  ] : mockStatusData;

  // We want the pie chart to render even if values are 0, so if all values are 0, we can use a dummy value just to show the empty ring
  const hasStatusData = statusData.some(d => d.value > 0);
  const displayStatusData = hasStatusData ? statusData : [{ name: 'No Data', value: 1 }];

  return (
    <div className="app-container" style={{ maxWidth: '1200px' }}>
      <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ textAlign: 'left', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
          <p style={{ textAlign: 'left' }}>Official review of Road Reserve applications.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={handleSignOut} style={{ background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Sign Out
          </button>
          <Link to="/" className="btn-submit" style={{ width: 'auto', padding: '0.5rem 1rem', margin: 0, textDecoration: 'none' }}>
            &larr; Back to App
          </Link>
        </div>
      </div>

      {/* Dashboard Stats & Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>Total Applications</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0', color: 'var(--text-primary)' }}>{applications.length}</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>Pending Review</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0', color: '#fcd34d' }}>{applications.filter(a => a.status === 'Pending' || !a.status).length}</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>Approved</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0', color: '#10b981' }}>{applications.filter(a => a.status === 'Approved').length}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Bar Chart */}
        <div className="form-section" style={{ margin: 0 }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Applications Over Time {applications.length === 0 && <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-secondary)', marginLeft: '1rem'}}>(Simulated Empty State)</span>}</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
                <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }} />
                <Bar dataKey="count" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="form-section" style={{ margin: 0 }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Application Status {applications.length === 0 && <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-secondary)', marginLeft: '1rem'}}>(Simulated Empty State)</span>}</h3>
          <div style={{ width: '100%', height: 300, position: 'relative' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={displayStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {displayStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={!hasStatusData ? 'rgba(255,255,255,0.1)' : COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }} itemStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            {!hasStatusData && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                No Data
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2 style={{ marginBottom: '1rem' }}>Recent Applications</h2>
        
        {loading ? (
          <p>Loading applications...</p>
        ) : applications.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No applications have been submitted yet.</p>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>When users submit the form, their applications will appear here.</p>
          </div>
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
                    <td style={{ padding: '1rem' }}>{app.activitiesundertaken || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>{app.district || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', background: app.status === 'Approved' ? 'rgba(16, 185, 129, 0.2)' : app.status === 'Rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: app.status === 'Approved' ? '#10b981' : app.status === 'Rejected' ? '#ef4444' : '#fcd34d' }}>
                        {app.status || 'Pending'}
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
