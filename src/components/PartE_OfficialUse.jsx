import React from 'react';

export default function PartE_OfficialUse({ formData, handleChange }) {
  return (
    <div className="form-section" style={{ border: '1px dashed rgba(239, 68, 68, 0.4)' }}>
      <h2>PART E: For Official Use Only</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Directorate of Road Infrastructure Protection</p>
      
      <div className="form-row">
        <div className="form-group">
          <label>Registration Number</label>
          <input type="number" name="registartionnumber" value={formData.registartionnumber || ''} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>File Reference Number</label>
          <input type="number" name="filereferencenumber" value={formData.filereferencenumber || ''} onChange={handleChange} />
        </div>
      </div>

      <div className="form-group">
        <label>Observations regarding suitability of site</label>
        <textarea name="observation" value={formData.observation || ''} onChange={handleChange} rows="3"></textarea>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Final recommendation</label>
          <select name="suitable_notsuitable" value={formData.suitable_notsuitable || ''} onChange={handleChange}>
            <option value="">Select recommendation</option>
            <option value="siutable">Suitable</option>
            <option value="notsuitable">Not Suitable</option>
          </select>
        </div>
        <div className="form-group">
          <label>Observations regarding suitability of specifications</label>
          <select name="suitablenotsuitable" value={formData.suitablenotsuitable || ''} onChange={handleChange}>
            <option value="">Select option</option>
            <option value="siutable">Suitable</option>
            <option value="notsuitable">Not Suitable</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Date of return</label>
          <input type="date" name="returndate" value={formData.returndate || ''} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Final Approval</label>
          <select name="notsuitablesuitable" value={formData.notsuitablesuitable || ''} onChange={handleChange}>
            <option value="">Select recommendation</option>
            <option value="siutable">Suitable</option>
            <option value="notsuitable">Not Suitable</option>
          </select>
        </div>
      </div>
    </div>
  );
}
