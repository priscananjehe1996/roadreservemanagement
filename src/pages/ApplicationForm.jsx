import React, { useState } from 'react';
import PartA_Applicant from '../components/PartA_Applicant';
import PartB_Infrastructure from '../components/PartB_Infrastructure';
import PartC_ImportantNotes from '../components/PartC_ImportantNotes';
import PartD_Declaration from '../components/PartD_Declaration';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

export default function ApplicationForm() {
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [step, setStep] = useState(1);
  const [secretClicks, setSecretClicks] = useState(0);
  const totalSteps = 5;
  const navigate = useNavigate();

  const clickTimeout = React.useRef(null);

  const handleSecretClick = () => {
    const newCount = secretClicks + 1;
    setSecretClicks(newCount);
    
    if (clickTimeout.current) clearTimeout(clickTimeout.current);
    
    clickTimeout.current = setTimeout(() => {
      if (newCount >= 5) {
        navigate('/login');
      }
      setSecretClicks(0);
    }, 800);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files : value
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      submitForm();
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const uploadAttachments = async (files) => {
    const urls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('application-attachments')
        .upload(fileName, file);

      if (error) throw error;
      
      const { data } = supabase.storage
        .from('application-attachments')
        .getPublicUrl(fileName);
        
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const submitForm = async () => {
    setStatus('submitting');
    setErrorMessage('');

    try {
      let attachmentUrls = [];
      if (formData.attachments && formData.attachments.length > 0) {
        attachmentUrls = await uploadAttachments(formData.attachments);
      }

      const finalData = { ...formData };
      delete finalData.attachments;
      
      if (attachmentUrls.length > 0) {
        finalData.attachment_urls = attachmentUrls;
      }

      const { error } = await supabase
        .from('applications')
        .insert([finalData]);

      if (error) throw new Error(error.message);

      setStatus('success');
      setFormData({});
      setStep(1);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message);
      setStatus('error');
    }
  };

  const renderReviewStep = () => (
    <div className="form-section review-section">
      <h2>Step 4: Review Your Application</h2>
      <p style={{color: 'var(--text-secondary)', marginBottom: '1.5rem'}}>Please double check the details below before signing the declaration.</p>
      
      <h3 style={{color: 'var(--accent-primary)', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem'}}>Applicant Particulars</h3>
      <div className="form-row" style={{marginBottom: '1.5rem'}}>
        <div><strong>Registered Name:</strong> {formData.registeredname || '-'}</div>
        <div><strong>TIN:</strong> {formData.tin || '-'}</div>
        <div><strong>Email:</strong> {formData.emailaddress || '-'}</div>
        <div><strong>Phone:</strong> {formData.officetelno || '-'}</div>
      </div>

      <h3 style={{color: 'var(--accent-primary)', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem'}}>Infrastructure Activity</h3>
      <div className="form-row">
        <div><strong>Nature of Activity:</strong> {formData.natureofbillboardsignagetool || '-'}</div>
        <div><strong>Location:</strong> {formData.physicallocation || '-'}</div>
        <div><strong>Coordinates:</strong> {formData.giscoordinates || '-'}</div>
        <div><strong>Material Used:</strong> {formData.materialused || '-'}</div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <div className="form-header">
        <h1 onClick={handleSecretClick} style={{ cursor: 'default', userSelect: 'none' }}>Road Reserve Management</h1>
        <p>Application for Temporary Use of National Road, Road Reserve or Ferry Landing Facility</p>
      </div>

      {status === 'success' && (
        <div className="form-section" style={{ borderLeft: '4px solid var(--success)', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--success)' }}>Application Submitted Successfully!</h2>
          <p>Your application has been received and will be reviewed by the Directorate of Road Infrastructure Protection.</p>
          <button className="btn-submit" style={{ width: 'auto', padding: '0.5rem 1.5rem', marginTop: '1rem' }} onClick={() => setStatus('idle')}>
            Submit Another Application
          </button>
        </div>
      )}

      {status !== 'success' && (
        <div className="wizard-container">
          <div className="wizard-progress" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} style={{ 
                width: '30px', height: '30px', borderRadius: '50%', 
                backgroundColor: step >= s ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', transition: 'all 0.3s ease',
                boxShadow: step >= s ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none'
              }}>
                {s}
              </div>
            ))}
          </div>

          <form onSubmit={handleNext}>
            {status === 'error' && (
              <div className="note-box" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeftColor: 'var(--error)' }}>
                <p style={{ color: 'var(--error)' }}><strong>Error:</strong> {errorMessage}</p>
              </div>
            )}

            {step === 1 && <PartA_Applicant formData={formData} handleChange={handleChange} />}
            {step === 2 && <PartB_Infrastructure formData={formData} handleChange={handleChange} />}
            {step === 3 && <PartC_ImportantNotes />}
            {step === 4 && renderReviewStep()}
            {step === 5 && <PartD_Declaration formData={formData} handleChange={handleChange} />}
            
            <div className="button-group" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              {step > 1 && (
                <button type="button" className="btn-submit" onClick={handlePrevious} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  Previous
                </button>
              )}
              <button type="submit" className="btn-submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Submitting...' : (step === totalSteps ? 'Submit Application' : 'Next Step')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
