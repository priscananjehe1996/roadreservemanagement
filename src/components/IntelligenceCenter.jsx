import React, { useState, useMemo } from 'react';

export default function IntelligenceCenter({ applications }) {
  const [query, setQuery] = useState('');
  const [botResponse, setBotResponse] = useState([]);
  
  // -- Similarity & Duplicate Detection Engine --
  const similarities = useMemo(() => {
    const nameMap = {};
    const tinMap = {};
    const locationMap = {};

    applications.forEach(app => {
      // Clean strings for fuzzy matching
      const cleanName = (app.registeredname || '').toLowerCase().trim();
      const tin = app.tin;
      const cleanLoc = (app.physicallocation || '').toLowerCase().trim();

      if (cleanName && cleanName !== 'n/a') {
        if (!nameMap[cleanName]) nameMap[cleanName] = [];
        nameMap[cleanName].push(app);
      }
      if (tin) {
        if (!tinMap[tin]) tinMap[tin] = [];
        tinMap[tin].push(app);
      }
      if (cleanLoc && cleanLoc.length > 5 && cleanLoc !== 'n/a') {
        if (!locationMap[cleanLoc]) locationMap[cleanLoc] = [];
        locationMap[cleanLoc].push(app);
      }
    });

    return {
      names: Object.entries(nameMap).filter(([k, v]) => v.length > 1),
      tins: Object.entries(tinMap).filter(([k, v]) => v.length > 1),
      locations: Object.entries(locationMap).filter(([k, v]) => v.length > 1)
    };
  }, [applications]);

  // -- Audit Triggers --
  const audits = useMemo(() => {
    const flags = [];
    applications.forEach(app => {
      const issues = [];
      if (!app.applicant_type) issues.push('Missing Applicant Type');
      if (!app.physicallocation) issues.push('Missing Location');
      if (!app.attachment_urls || app.attachment_urls.length === 0) issues.push('No Supporting Docs');
      
      const daysOld = Math.floor((new Date() - new Date(app.created_at)) / (1000 * 60 * 60 * 24));
      if ((!app.status || app.status === 'Pending') && daysOld > 14) {
        issues.push(`Pending for ${daysOld} days`);
      }

      if (issues.length > 0) {
        flags.push({ app, issues });
      }
    });
    return flags.sort((a, b) => b.issues.length - a.issues.length);
  }, [applications]);

  // -- Natural Language SQL Bot --
  const handleQuery = (e) => {
    e.preventDefault();
    if (!query) return setBotResponse([]);
    
    const q = query.toLowerCase();
    let results = [...applications];

    // Simple NLP Parsing
    if (q.includes('pending')) results = results.filter(a => (a.status || 'Pending') === 'Pending');
    if (q.includes('approved')) results = results.filter(a => a.status === 'Approved');
    if (q.includes('rejected')) results = results.filter(a => a.status === 'Rejected');
    
    if (q.includes('business')) results = results.filter(a => (a.applicant_type || '').toLowerCase().includes('business'));
    if (q.includes('government')) results = results.filter(a => (a.applicant_type || '').toLowerCase().includes('government'));
    
    // Extract location keyword (e.g., "in kampala")
    const inMatch = q.match(/in\s+(\w+)/);
    if (inMatch) {
      const loc = inMatch[1];
      results = results.filter(a => (a.physicallocation || '').toLowerCase().includes(loc));
    }

    setBotResponse(results);
  };

  return (
    <div style={{ background: '#0f172a', padding: '2rem', borderRadius: '1rem', border: '1px solid #334155', color: '#10b981', fontFamily: 'monospace' }}>
      <h2 style={{ color: '#34d399', borderBottom: '1px solid #064e3b', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>👁️</span> Central Intelligence Engine
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        
        {/* Similarity Matrix */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
          <h3 style={{ color: '#fcd34d', margin: '0 0 1rem 0' }}>// SIMILARITY_MATRIX</h3>
          
          {similarities.names.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#cbd5e1' }}>Duplicate Names Detected:</strong>
              {similarities.names.map(([name, apps], i) => (
                <div key={i} style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  <span style={{ color: '#ef4444' }}>{name}</span> - {apps.length} records (IDs: {apps.map(a => a.id).join(', ')})
                </div>
              ))}
            </div>
          )}

          {similarities.locations.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#cbd5e1' }}>Overlapping Locations Detected:</strong>
              {similarities.locations.slice(0, 5).map(([loc, apps], i) => (
                <div key={i} style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  <span style={{ color: '#ef4444' }}>{loc}</span> - {apps.length} records
                </div>
              ))}
            </div>
          )}
          
          {similarities.names.length === 0 && similarities.locations.length === 0 && (
            <span style={{ color: '#94a3b8' }}>No anomalies detected.</span>
          )}
        </div>

        {/* Audit Triggers */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
          <h3 style={{ color: '#fcd34d', margin: '0 0 1rem 0' }}>// SYSTEM_AUDITS</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {audits.slice(0, 10).map(({ app, issues }, i) => (
              <div key={i} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed #334155' }}>
                <strong style={{ color: '#cbd5e1' }}>App #{app.id} - {app.registeredname || 'Unknown'}</strong>
                <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem', color: '#ef4444', fontSize: '0.85rem' }}>
                  {issues.map((iss, j) => <li key={j}>{iss}</li>)}
                </ul>
              </div>
            ))}
            {audits.length === 0 && <span style={{ color: '#94a3b8' }}>All systems nominal.</span>}
          </div>
        </div>

      </div>

      {/* SQL Bot Terminal */}
      <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #1e293b', marginTop: '2rem' }}>
        <h3 style={{ color: '#38bdf8', margin: '0 0 1rem 0' }}>// QUERY_BOT_TERMINAL</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>Enter natural language query (e.g., "show pending businesses in kampala")</p>
        
        <form onSubmit={handleQuery} style={{ display: 'flex', gap: '1rem' }}>
          <span style={{ color: '#34d399', fontSize: '1.2rem', alignSelf: 'center' }}>{'>'}</span>
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid #38bdf8', color: '#f8fafc', fontSize: '1rem', outline: 'none', padding: '0.5rem 0', fontFamily: 'monospace' }}
            placeholder="Awaiting command..."
          />
          <button type="submit" style={{ background: '#0284c7', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace' }}>EXECUTE</button>
        </form>

        {botResponse.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h4 style={{ color: '#cbd5e1' }}>Results ({botResponse.length})</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', fontSize: '0.85rem', color: '#94a3b8' }}>
                <thead>
                  <tr style={{ color: '#38bdf8' }}>
                    <th style={{ padding: '0.5rem' }}>ID</th>
                    <th style={{ padding: '0.5rem' }}>Applicant</th>
                    <th style={{ padding: '0.5rem' }}>Status</th>
                    <th style={{ padding: '0.5rem' }}>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {botResponse.map(app => (
                    <tr key={app.id} style={{ borderTop: '1px solid #1e293b' }}>
                      <td style={{ padding: '0.5rem' }}>{app.id}</td>
                      <td style={{ padding: '0.5rem', color: '#f8fafc' }}>{app.registeredname}</td>
                      <td style={{ padding: '0.5rem' }}>{app.status || 'Pending'}</td>
                      <td style={{ padding: '0.5rem' }}>{app.physicallocation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
