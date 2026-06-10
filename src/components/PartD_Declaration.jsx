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
      <h2>PART D: Declaration</h2>
      
      <div className="note-box" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderLeftColor: 'var(--success)' }}>
        <div className="checkbox-group">
          <input type="checkbox" id="declaration" name="declaration_agreed" checked={formData.declaration_agreed || false} onChange={(e) => handleChange({ target: { name: 'declaration_agreed', value: e.target.checked } })} required />
          <label htmlFor="declaration">I/We hereby declare that the particulars herein are true and correct and that I/We undertake to abide by the terms and conditions as stipulated by the authority.</label>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>First Name</label>
          <input type="text" name="firstname" value={formData.firstname || ''} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input type="text" name="lastname" value={formData.lastname || ''} onChange={handleChange} required />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Other Name (Optional)</label>
          <input type="text" name="othername" value={formData.othername || ''} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Status (e.g. Director)</label>
          <input type="text" name="status" value={formData.status || ''} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Date & Time</label>
          <input type="datetime-local" name="daysdate" value={formData.daysdate || ''} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Place</label>
          <input type="text" name="place" value={formData.place || ''} onChange={handleChange} required />
        </div>
      </div>
      
      <div className="form-group">
        <label>Signature (Type full name to sign)</label>
        <input type="text" name="signature" value={formData.signature || ''} onChange={handleChange} required style={{ fontFamily: 'cursive', fontSize: '1.2rem' }} />
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
        <em>Note: In the case of a company, a partnership or trust, where the signatory is not a director, partner or trustee in the business, the application shall be accompanied by a letter of authority or powers of Attorney.</em>
      </p>
    </div>
  );
}
