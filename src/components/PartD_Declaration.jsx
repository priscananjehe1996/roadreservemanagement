import React, { useEffect } from 'react';

export default function PartD_Declaration({ formData, handleChange }) {
  useEffect(() => {
    if (!formData.daysdate) {
      const now = new Date();
      const localDateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      handleChange({ target: { name: 'daysdate', value: localDateTime } });
    }
  }, [formData.daysdate, handleChange]);

  return (
    <div className="form-section">
      <h2>PART D: Declaration & Attachments</h2>

      <div className="form-group" style={{ marginBottom: '2rem', padding: '1.5rem', border: '2px dashed var(--border-color)', borderRadius: '1rem', background: 'rgba(255,255,255,0.02)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Supporting Documents</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Attach any relevant images, site plans, ID copies, or billboard mockups.</p>
        <input 
          type="file" 
          name="attachments" 
          onChange={handleChange} 
          multiple 
          accept="image/*"
          style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-primary)' }}
        />
        {formData.attachments && formData.attachments.length > 0 && (
          <p style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginTop: '0.5rem' }}>
            {formData.attachments.length} file(s) selected
          </p>
        )}
      </div>

      <div className="note-box" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderLeftColor: 'var(--success)' }}>
        <div className="checkbox-group">
          <input type="checkbox" id="declaration" name="declaration_agreed" checked={formData.declaration_agreed || false} onChange={(e) => handleChange({ target: { name: 'declaration_agreed', value: e.target.checked } })} />
          <label htmlFor="declaration">I/We hereby declare that the particulars herein are true and correct and that I/We undertake to abide by the terms and conditions as stipulated by the authority.</label>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>First Name</label>
          <input type="text" name="firstname" value={formData.firstname || ''} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input type="text" name="lastname" value={formData.lastname || ''} onChange={handleChange} />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Other Name (Optional)</label>
          <input type="text" name="othername" value={formData.othername || ''} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Status (e.g. Director)</label>
          <input type="text" name="applicant_role" value={formData.applicant_role || ''} onChange={(e) => handleChange({target: {name: 'applicant_role', value: e.target.value}})} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Date & Time</label>
          <input type="datetime-local" name="daysdate" value={formData.daysdate || ''} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Place</label>
          <input type="text" name="place" value={formData.place || ''} onChange={handleChange} />
        </div>
      </div>
      
      <div className="form-group">
        <label>Signature (Type full name to sign)</label>
        <input type="text" name="signature" value={formData.signature || ''} onChange={handleChange} style={{ fontFamily: 'cursive', fontSize: '1.2rem' }} />
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
        <em>Note: In the case of a company, a partnership or trust, where the signatory is not a director, partner or trustee in the business, the application shall be accompanied by a letter of authority or powers of Attorney.</em>
      </p>
    </div>
  );
}
