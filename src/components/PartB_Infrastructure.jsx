import React from 'react';

export default function PartB_Infrastructure({ formData, handleChange }) {
  return (
    <div className="form-section">
      <h2>PART B: Particulars of Infrastructure / Activity</h2>
      
      <div className="form-group">
        <label>Nature/name of the billboard/signage/tool/infrastructure/activity</label>
        <input type="text" name="natureofbillboardsignagetool" value={formData.natureofbillboardsignagetool || ''} onChange={handleChange} required />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Physical Location</label>
          <input type="text" name="physicallocation" value={formData.physicallocation || ''} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>GIS Coordinates (Lat, Long)</label>
          <input type="text" name="giscoordinates" value={formData.giscoordinates || ''} onChange={handleChange} required placeholder="-1.234, 32.345" />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Landmark's main location features</label>
          <input type="text" name="landmarksmainlocationfeature" value={formData.landmarksmainlocationfeature || ''} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Name of the closest urban council/village</label>
          <input type="text" name="closesturbancoucilorvillage" value={formData.closesturbancoucilorvillage || ''} onChange={handleChange} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Road or Highway</label>
          <select name="roadorhighway" value={formData.roadorhighway || ''} onChange={handleChange}>
            <option value="">Select option</option>
            <option value="road">Road</option>
            <option value="highway">Highway</option>
          </select>
        </div>
        <div className="form-group">
          <label>Material used for Signage or Infrastructure</label>
          <select name="materialused" value={formData.materialused || ''} onChange={handleChange} required>
            <option value="">Select material</option>
            <option value="Steel">Steel</option>
            <option value="Concrete">Concrete</option>
            <option value="Glassreinforcedplastic">Glass reinforced plastic</option>
            <option value="Retroreflectivesheeting">Retro reflective sheeting</option>
            <option value="Thermalplasticpaint">Thermal plastic paint</option>
            <option value="Glassbeeds">Glass beeds</option>
            <option value="Roadmarkingpaint">Road marking paint</option>
            <option value="Asphalt">Asphalt</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Single/Double/Multi face (for adverts)</label>
          <select name="singledoublemultiface" value={formData.singledoublemultiface || ''} onChange={handleChange} required>
            <option value="">Select face type</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="multiface">Multi face</option>
          </select>
        </div>
        <div className="form-group">
          <label>Moving/Revolving/Flashing sign</label>
          <select name="moving_revolving_flashingsign" value={formData.moving_revolving_flashingsign || ''} onChange={handleChange} required>
            <option value="">Select sign behavior</option>
            <option value="moving">Moving sign</option>
            <option value="revolving">Revolving sign</option>
            <option value="flash">Flashing sign</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>How is the sign/Infrastructure affixed/attached?</label>
        <select name="signeorinfrastructureaffixed" value={formData.signeorinfrastructureaffixed || ''} onChange={handleChange} required>
          <option value="">Select affixation method</option>
          <option value="BoltedorWelded">Bolted or Welded</option>
          <option value="Laying">Laying</option>
          <option value="Spraying">Spraying</option>
        </select>
      </div>

      <h3 style={{marginTop: '2rem', marginBottom: '1rem', color: 'var(--accent-primary)'}}>Dimensions</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Length (meters)</label>
          <input type="number" step="0.01" name="lengthdimensions" value={formData.lengthdimensions || ''} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Width (meters)</label>
          <input type="number" step="0.01" name="widthdimension" value={formData.widthdimension || ''} onChange={handleChange} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Thickness (meters)</label>
          <input type="number" step="0.01" name="thicknessdimension" value={formData.thicknessdimension || ''} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Height above ground level (meters)</label>
          <input type="number" step="0.01" name="heightabovegroundlevel" value={formData.heightabovegroundlevel || ''} onChange={handleChange} required />
        </div>
      </div>

      <h3 style={{marginTop: '2rem', marginBottom: '1rem', color: 'var(--accent-primary)'}}>Advert Details (Optional)</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Color for Letters</label>
          <input type="text" name="colorsusedforletters" value={formData.colorsusedforletters || ''} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Color for Figures</label>
          <input type="text" name="colorusedforfigures" value={formData.colorusedforfigures || ''} onChange={handleChange} required />
        </div>
      </div>
      
      <div className="form-group">
        <label>Describe advert on the ferry</label>
        <textarea name="advertontheferry" value={formData.advertontheferry || ''} onChange={handleChange} rows="2"></textarea>
      </div>
      <div className="form-group">
        <label>Describe advert on the ferry landing site</label>
        <textarea name="advertontheferrylandingsite" value={formData.advertontheferrylandingsite || ''} onChange={handleChange} rows="2"></textarea>
      </div>
      <div className="form-group">
        <label>Describe advert on the over bridge</label>
        <textarea name="advertontheoverbridge" value={formData.advertontheoverbridge || ''} onChange={handleChange} rows="2"></textarea>
      </div>

    </div>
  );
}
