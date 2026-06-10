import React from 'react';

export default function PartA_Applicant({ formData, handleChange }) {
  return (
    <div className="form-section">
      <h2>PART A: Particulars of Applicant</h2>
      
      <div className="form-group">
        <label>Registered Name</label>
        <input type="text" name="registeredname" value={formData.registeredname || ''} onChange={handleChange} required placeholder="Enter registered name" />
      </div>

      <div className="form-group">
        <label>Applicant Type</label>
        <select name="applicant_type" value={formData.applicant_type || ''} onChange={handleChange}>
          <option value="">Select applicant type...</option>
          <option value="Government">Government</option>
          <option value="MDA">MDA (Ministries, Departments, and Agencies)</option>
          <option value="Business">Business / Corporate</option>
          <option value="NGO">NGO</option>
          <option value="Personal">Personal / Individual</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>TIN</label>
          <input type="number" name="tin" value={formData.tin || ''} onChange={handleChange} required placeholder="Tax Identification Number" />
        </div>
        <div className="form-group">
          <label>Physical Address</label>
          <input type="text" name="physicaladdress" value={formData.physicaladdress || ''} onChange={handleChange} placeholder="Full physical address" />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" name="emailaddress" value={formData.emailaddress || ''} onChange={handleChange} required placeholder="example@domain.com" />
        </div>
        <div className="form-group">
          <label>Office Tel No</label>
          <input type="text" name="officetelno" value={formData.officetelno || ''} onChange={handleChange} required placeholder="Phone number" />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Any permit/application denied?</label>
          <select name="yes_no" value={formData.yes_no || ''} onChange={handleChange}>
            <option value="">Select an option</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div className="form-group">
          <label>If yes, In Which Year</label>
          <input type="number" name="inwhichyear" value={formData.inwhichyear || ''} onChange={handleChange} disabled={formData.yes_no !== 'yes'} placeholder="YYYY" />
        </div>
      </div>
      
      <div className="form-group">
        <label>Name Road/Road Reserve/Ferry Activity to be undertaken</label>
        <textarea name="activitiesundertaken" value={formData.activitiesundertaken || ''} onChange={handleChange} required rows="3" placeholder="Describe the activity..."></textarea>
      </div>

      <h3 style={{marginTop: '2rem', marginBottom: '1rem', color: 'var(--accent-primary)'}}>Particulars of Contact Person</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label>Name of Contact Person</label>
          <input type="text" name="nameofcontactperson" value={formData.nameofcontactperson || ''} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Telephone Number</label>
          <input type="text" name="telephonenumber" value={formData.telephonenumber || ''} onChange={handleChange} />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" name="emailaddresses" value={formData.emailaddresses || ''} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Physical Address</label>
          <input type="text" name="physicaladdresses" value={formData.physicaladdresses || ''} onChange={handleChange} />
        </div>
      </div>
    </div>
  );
}
