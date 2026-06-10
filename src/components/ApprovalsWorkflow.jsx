import React, { useState } from 'react';

const WORKFLOW_STEPS = [
  { id: '1_document_review', label: '1. Document Review' },
  { id: '2_field_audit', label: '2. Field & Site Audit' },
  { id: '3_final_approval', label: '3. Final Approval' }
];

export default function ApprovalsWorkflow({ applications, onUpdateApplication }) {
  const [selectedId, setSelectedId] = useState(null);
  const [noteInput, setNoteInput] = useState('');
  
  // Filter only pending applications
  const pendingApps = applications.filter(a => (a.status || 'Pending') === 'Pending');
  const selectedApp = applications.find(a => a.id === selectedId);

  const handleStepAdvance = async (currentStepId) => {
    if (!selectedApp) return;
    
    const currentIndex = WORKFLOW_STEPS.findIndex(s => s.id === currentStepId);
    let newStatus = selectedApp.status || 'Pending';
    let newWorkflowStep = currentStepId;

    if (currentIndex < WORKFLOW_STEPS.length - 1) {
      newWorkflowStep = WORKFLOW_STEPS[currentIndex + 1].id;
    } else {
      newStatus = 'Approved';
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      user: 'Admin Root',
      action: `Advanced workflow from ${WORKFLOW_STEPS[currentIndex].label}`,
      note: ''
    };

    const updatedLogs = [...(selectedApp.audit_logs || []), logEntry];
    await onUpdateApplication(selectedApp.id, { workflow_step: newWorkflowStep, status: newStatus, audit_logs: updatedLogs });
    if (newStatus === 'Approved') setSelectedId(null); // Deselect if finished
  };

  const handleAddNote = async () => {
    if (!selectedApp || !noteInput.trim()) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      user: 'Admin Root',
      action: 'Added Audit Note',
      note: noteInput.trim()
    };
    
    const updatedLogs = [...(selectedApp.audit_logs || []), logEntry];
    await onUpdateApplication(selectedApp.id, { audit_logs: updatedLogs });
    setNoteInput('');
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    const logEntry = {
      timestamp: new Date().toISOString(),
      user: 'Admin Root',
      action: 'Application Rejected',
      note: noteInput.trim() || 'Rejected during workflow.'
    };
    const updatedLogs = [...(selectedApp.audit_logs || []), logEntry];
    await onUpdateApplication(selectedApp.id, { status: 'Rejected', audit_logs: updatedLogs });
    setSelectedId(null);
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', height: '100%', minHeight: '600px' }}>
      
      {/* Queue List (Left Pane) */}
      <div className="glass-panel" style={{ flex: '0 0 350px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(56, 189, 248, 0.1)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Approval Queue</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{pendingApps.length} Applications require review</p>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {pendingApps.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Queue is empty.</div>
          ) : (
            pendingApps.map(app => {
              const currentStep = app.workflow_step || '1_document_review';
              const stepIndex = WORKFLOW_STEPS.findIndex(s => s.id === currentStep) + 1;
              const isSelected = selectedId === app.id;
              
              return (
                <div 
                  key={app.id} 
                  onClick={() => setSelectedId(app.id)}
                  style={{ 
                    padding: '1rem 1.5rem', 
                    borderBottom: '1px solid rgba(255,255,255,0.05)', 
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                    borderLeft: isSelected ? '4px solid var(--accent-primary)' : '4px solid transparent',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                  onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>#{app.id} - {app.registeredname || 'Unknown'}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>Step {stepIndex}/3</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {app.physicallocation || 'No Location'}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Audit Detail (Right Pane) */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        {!selectedApp ? (
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            Select an application from the queue to begin auditing.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(56, 189, 248, 0.1)', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Applicant: {selectedApp.registeredname}</h2>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span><strong>ID:</strong> #{selectedApp.id}</span>
                    <span><strong>TIN:</strong> {selectedApp.tin}</span>
                    <span><strong>Date:</strong> {new Date(selectedApp.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button onClick={handleReject} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Reject Application
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              
              {/* Left Column: Workflow Steps */}
              <div style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', overflowY: 'auto' }}>
                <h3 style={{ marginTop: 0, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Workflow Progress</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                  {WORKFLOW_STEPS.map((step, index) => {
                    const currentAppStep = selectedApp.workflow_step || '1_document_review';
                    const currentIndex = WORKFLOW_STEPS.findIndex(s => s.id === currentAppStep);
                    const isCompleted = index < currentIndex;
                    const isActive = index === currentIndex;
                    
                    return (
                      <div key={step.id} style={{ display: 'flex', gap: '1rem', opacity: isCompleted || isActive ? 1 : 0.4 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isCompleted ? 'var(--success)' : isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold', fontSize: '0.8rem' }}>
                            {isCompleted ? '✓' : (index + 1)}
                          </div>
                          {index < WORKFLOW_STEPS.length - 1 && <div style={{ width: '2px', height: '100%', background: isCompleted ? 'var(--success)' : 'rgba(255,255,255,0.1)', minHeight: '30px', marginTop: '0.5rem' }}></div>}
                        </div>
                        <div style={{ paddingBottom: '1rem' }}>
                          <h4 style={{ margin: '0 0 0.5rem 0', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{step.label}</h4>
                          {isActive && (
                            <div>
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>Verify requirements for this stage and click to proceed.</p>
                              <button onClick={() => handleStepAdvance(step.id)} style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Mark Completed & Advance
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Audit Logs */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem', background: 'rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginTop: 0, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>Audit Trail</h3>
                
                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(!selectedApp.audit_logs || selectedApp.audit_logs.length === 0) ? (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No audit logs recorded yet.</div>
                  ) : (
                    selectedApp.audit_logs.map((log, i) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '6px', borderLeft: '2px solid var(--accent-primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{log.user}</span>
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>{log.action}</div>
                        {log.note && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>"{log.note}"</div>}
                      </div>
                    ))
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    placeholder="Add an audit note..." 
                    style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '4px', outline: 'none' }}
                  />
                  <button onClick={handleAddNote} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.75rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                    Save Note
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
}
