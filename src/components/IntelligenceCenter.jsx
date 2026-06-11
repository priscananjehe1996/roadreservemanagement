import React, { useState, useMemo, useEffect, useRef } from 'react';

export default function IntelligenceCenter({ applications }) {
  const [query, setQuery] = useState('');
  
  // AI Bot State
  const [engine, setEngine] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', text: 'Hello Admin. I am the MoWT Open Source Intelligence AI. I run entirely locally in your browser. I have full read-access to your database records. Ask me anything.' }
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

  // -- Initialize WebLLM Engine --
  const initializeEngine = async () => {
    if (engine || isInitializing) return;
    setIsInitializing(true);
    try {
      const initProgressCallback = (report) => {
        setProgressMsg(report.text);
      };
      
      // We use Llama-3.2-1B-Instruct-q4f16_1-MLC because it is highly capable but very lightweight (fast to download).
      const newEngine = await CreateMLCEngine("Llama-3.2-1B-Instruct-q4f16_1-MLC", { initProgressCallback });
      setEngine(newEngine);
      setChatHistory(prev => [...prev, { role: 'model', text: 'System initialized. Open Source LLM is online and ready for queries.' }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'model', text: `ERROR Initializing LLM: ${err.message}. Your device might not support WebGPU.` }]);
    } finally {
      setIsInitializing(false);
    }
  };

  // -- Local LLM Query --
  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim() || !engine) return;
    
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
You are analyzing a database of Road Reserve Permit Applications. 
Here is the current database JSON data:
${JSON.stringify(simplifiedApps)}

Answer the user's question accurately based ONLY on this data. Format your response cleanly using markdown bullet points. Keep it concise, helpful, and professional.`;

      // Structure messages for WebLLM chat.completions
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ];

      const reply = await engine.chat.completions.create({
        messages,
        temperature: 0.1
      });

      const botReply = reply.choices[0].message.content || "I was unable to analyze the data.";
      setChatHistory(prev => [...prev, { role: 'model', text: botReply }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'model', text: `ERROR: ${err.message}.` }]);
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
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Powered by Open Source Local AI
        </div>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🤖</span> LOCAL_LLM_TERMINAL
          </h3>
          {engine && <span style={{ color: '#34d399', fontSize: '0.75rem', border: '1px solid #34d399', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Model Ready</span>}
        </div>
        
        {!engine ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px', padding: '2rem' }}>
            <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
              <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Initialize Open Source AI</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Click below to load the Llama 3 LLM directly into your browser's memory using WebGPU. No API keys required. 
                (Note: ~1GB initial download required).
              </p>
              
              {!isInitializing ? (
                <button 
                  onClick={initializeEngine}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: 'none', background: 'var(--accent-primary)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Load Local LLM Engine
                </button>
              ) : (
                <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', color: 'var(--accent-primary)', fontSize: '0.85rem', textAlign: 'left', wordBreak: 'break-all' }}>
                  <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Loading Model...</div>
                  {progressMsg || "Initializing WebGPU..."}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#0B0E14', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {chatHistory.map((msg, idx) => (
                <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', textAlign: msg.role === 'user' ? 'right' : 'left', textTransform: 'uppercase' }}>
                    {msg.role === 'user' ? 'Admin' : 'Local AI'}
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
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', textTransform: 'uppercase' }}>Local AI</div>
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
                placeholder="Ask your local LLM anything about the applications..."
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
