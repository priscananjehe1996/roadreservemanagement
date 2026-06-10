import React, { useState, useMemo, useEffect, useRef } from 'react';

export default function IntelligenceCenter({ applications }) {
  const [query, setQuery] = useState('');
  
  // AI Bot State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('mowt_gemini_key') || '');
  const [showKeySettings, setShowKeySettings] = useState(!localStorage.getItem('mowt_gemini_key'));
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', text: 'Hello Admin. I am the MoWT Intelligence AI. I have full read-access to your database records. Ask me anything.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);
  
  // -- Similarity & Duplicate Detection Engine --
  const similarities = useMemo(() => {
    const nameMap = {};
    const tinMap = {};
    const locationMap = {};

    applications.forEach(app => {
      const cleanName = (app.registeredname || '').toLowerCase().trim();
      const tin = app.tin;
      const cleanLoc = (app.physicallocation || '').toLowerCase().trim();

      if (cleanName && cleanName !== 'n/a' && cleanName !== 'unspecified') {
        if (!nameMap[cleanName]) nameMap[cleanName] = [];
        nameMap[cleanName].push(app);
      }
      if (tin && tin !== 'unspecified') {
        if (!tinMap[tin]) tinMap[tin] = [];
        tinMap[tin].push(app);
      }
      if (cleanLoc && cleanLoc.length > 5 && cleanLoc !== 'n/a' && cleanLoc !== 'unspecified') {
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
      if (!app.applicant_type || app.applicant_type === 'Unspecified') issues.push('Missing Applicant Type');
      if (!app.physicallocation || app.physicallocation === 'Unspecified') issues.push('Missing Location');
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

  const handleSaveKey = (e) => {
    e.preventDefault();
    localStorage.setItem('mowt_gemini_key', apiKey.trim());
    setShowKeySettings(false);
  };

  // -- Gemini LLM Engine --
  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (!apiKey) {
      setShowKeySettings(true);
      return;
    }
    
    const userMessage = query.trim();
    setQuery('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const simplifiedApps = applications.map(a => ({
        id: a.id,
        status: a.status || 'Pending',
        type: a.applicant_type || 'Unknown',
        applicant: a.registeredname || 'Unknown',
        activity: a.activitiesundertaken || 'Unknown',
        location: a.physicallocation || 'Unknown'
      }));

      const systemPrompt = `You are the MoWT (Ministry of Works and Transport) AI Database Assistant. 
You are securely analyzing a database of Road Reserve Permit Applications. 
Here is the current database JSON data:
${JSON.stringify(simplifiedApps)}

Answer the user's question accurately based ONLY on this data. Format your response cleanly. You can use markdown bullet points. Keep it concise, helpful, and professional.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt + "\n\nUser Query: " + userMessage }] }],
          generationConfig: { temperature: 0.1 }
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "API Error");
      }

      const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I was unable to analyze the data.";
      setChatHistory(prev => [...prev, { role: 'model', text: botReply }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'model', text: `ERROR: ${err.message}. Please check your API key.` }]);
      if (err.message.toLowerCase().includes('api key')) setShowKeySettings(true);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h2 style={{ color: '#34d399', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>👁️</span> Central Intelligence Engine
        </h2>
        <button 
          onClick={() => setShowKeySettings(!showKeySettings)}
          style={{ background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
        >
          {showKeySettings ? 'Close AI Settings' : 'AI Settings'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
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

      {/* AI Chat Terminal */}
      <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #1e293b', marginTop: '2rem', display: 'flex', flexDirection: 'column', height: '500px' }}>
        <h3 style={{ color: '#38bdf8', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🤖</span> AI_QUERY_TERMINAL
        </h3>
        
        {showKeySettings ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px', padding: '2rem' }}>
            <div style={{ maxWidth: '400px', width: '100%' }}>
              <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Setup AI Connection</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                To enable the Intelligent LLM Chatbot, securely provide your Google Gemini API Key. This key is saved locally in your browser and never leaves your device.
              </p>
              <form onSubmit={handleSaveKey}>
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter Gemini API Key..."
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--accent-primary)', background: 'black', color: 'white', marginBottom: '1rem' }}
                />
                <button type="submit" style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: 'none', background: 'var(--accent-primary)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                  Save Key & Initialize
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#0B0E14', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {chatHistory.map((msg, idx) => (
                <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', textAlign: msg.role === 'user' ? 'right' : 'left', textTransform: 'uppercase' }}>
                    {msg.role === 'user' ? 'Admin' : 'MoWT AI'}
                  </div>
                  <div style={{ 
                    padding: '0.8rem 1rem', 
                    borderRadius: '8px', 
                    background: msg.role === 'user' ? 'var(--accent-primary)' : '#1e293b', 
                    color: msg.role === 'user' ? 'white' : '#f8fafc',
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{ alignSelf: 'flex-start' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', textTransform: 'uppercase' }}>MoWT AI</div>
                  <div style={{ padding: '0.8rem 1rem', borderRadius: '8px', background: '#1e293b', color: '#f8fafc', fontSize: '0.9rem' }}>
                    <span style={{ animation: 'pulse 1.5s infinite' }}>Analyzing database...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            
            <form onSubmit={handleQuery} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ color: '#34d399', fontSize: '1.2rem' }}>{'>'}</span>
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid #38bdf8', color: '#f8fafc', fontSize: '1rem', outline: 'none', padding: '0.5rem 0', fontFamily: 'monospace' }}
                placeholder="Ask me to summarize pending applications, find specific locations, or analyze trends..."
                disabled={isTyping}
              />
              <button 
                type="submit" 
                disabled={isTyping || !query.trim()}
                style={{ background: isTyping || !query.trim() ? '#334155' : '#0284c7', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '4px', cursor: isTyping || !query.trim() ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
              >
                SEND
              </button>
            </form>
          </>
        )}
      </div>

    </div>
  );
}
