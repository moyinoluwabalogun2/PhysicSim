import React from 'react'
import '../styles/controls.css'

const Controls = ({
  params,
  activeTab,
  tabs = [],
  objectOptions = [],
  onTabChange,
  onObjectChange,
  onParamChange,
  onCalculate,
  onReset,
  isLoading
}) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    onParamChange({
      [name]: type === 'checkbox' ? checked : parseFloat(value)
    })
  }

  const renderBaseControls = () => (
    <>
      <div className="control-group">
        <label htmlFor="angle">Launch Angle: {params.angle}°</label>
        <input
          type="range"
          id="angle"
          name="angle"
          min="0"
          max="90"
          step="1"
          value={params.angle}
          onChange={handleChange}
          disabled={isLoading}
        />
        <div className="range-values">
          <span>0°</span>
          <span>45°</span>
          <span>90°</span>
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="velocity">Initial Velocity: {params.velocity} m/s</label>
        <input
          type="range"
          id="velocity"
          name="velocity"
          min="1"
          max="200"
          step="1"
          value={params.velocity}
          onChange={handleChange}
          disabled={isLoading}
        />
        <div className="range-values">
          <span>1 m/s</span>
          <span>100 m/s</span>
          <span>200 m/s</span>
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="gravity">Gravity: {params.gravity} m/s²</label>
        <input
          type="range"
          id="gravity"
          name="gravity"
          min="1"
          max="30"
          step="0.5"
          value={params.gravity}
          onChange={handleChange}
          disabled={isLoading}
        />
        <div className="range-values">
          <span>1 m/s²</span>
          <span>9.81 m/s²</span>
          <span>30 m/s²</span>
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="initialHeight">Initial Height: {params.initialHeight} m</label>
        <input
          type="range"
          id="initialHeight"
          name="initialHeight"
          min="0"
          max="100"
          step="1"
          value={params.initialHeight}
          onChange={handleChange}
          disabled={isLoading}
        />
        <div className="range-values">
          <span>0 m</span>
          <span>50 m</span>
          <span>100 m</span>
        </div>
      </div>
    </>
  )

  const renderObjectSelector = () => (
    <div className="control-group">
      <label htmlFor="objectType">Object Type</label>
      <select
        id="objectType"
        name="objectType"
        value={params.objectType}
        onChange={(e) => onObjectChange(e.target.value)}
        disabled={isLoading}
        className="control-select"
      >
        {objectOptions.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )

  const renderVectorControls = () => (
    <div className="control-section">
      <h4 className="section-subtitle">Vector Display</h4>

      <div className="control-group checkbox">
        <label>
          <input
            type="checkbox"
            name="showVelocityVector"
            checked={params.showVelocityVector}
            onChange={handleChange}
            disabled={isLoading}
          />
          <span>Show Velocity Vector</span>
        </label>
      </div>

      <div className="control-group checkbox">
        <label>
          <input
            type="checkbox"
            name="showAccelerationVector"
            checked={params.showAccelerationVector}
            onChange={handleChange}
            disabled={isLoading}
          />
          <span>Show Acceleration Vector</span>
        </label>
      </div>

      <div className="control-group checkbox">
        <label>
          <input
            type="checkbox"
            name="showComponentVectors"
            checked={params.showComponentVectors}
            onChange={handleChange}
            disabled={isLoading}
          />
          <span>Show Component Vectors</span>
        </label>
      </div>
    </div>
  )

  const renderDragControls = () => (
    <div className="control-section">
      <h4 className="section-subtitle">Drag Properties</h4>

      <div className="control-group checkbox">
        <label>
          <input
            type="checkbox"
            name="airResistance"
            checked={params.airResistance}
            onChange={handleChange}
            disabled={isLoading}
          />
          <span>Include Air Resistance</span>
        </label>
      </div>

      <div className="control-group">
        <label htmlFor="mass">Mass: {params.mass} kg</label>
        <input
          type="range"
          id="mass"
          name="mass"
          min="0.01"
          max="100"
          step="0.01"
          value={params.mass}
          onChange={handleChange}
          disabled={isLoading}
        />
        <div className="range-values">
          <span>0.01 kg</span>
          <span>50 kg</span>
          <span>100 kg</span>
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="diameter">Diameter: {params.diameter} m</label>
        <input
          type="range"
          id="diameter"
          name="diameter"
          min="0.01"
          max="3"
          step="0.01"
          value={params.diameter}
          onChange={handleChange}
          disabled={isLoading}
        />
        <div className="range-values">
          <span>0.01 m</span>
          <span>1.50 m</span>
          <span>3.00 m</span>
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="dragCoefficient">
          Drag Coefficient: {params.dragCoefficient}
        </label>
        <input
          type="range"
          id="dragCoefficient"
          name="dragCoefficient"
          min="0.01"
          max="2"
          step="0.01"
          value={params.dragCoefficient}
          onChange={handleChange}
          disabled={isLoading}
        />
        <div className="range-values">
          <span>0.01</span>
          <span>1.00</span>
          <span>2.00</span>
        </div>
      </div>
    </div>
  )

  const renderLabControls = () => (
    <div className="control-section">
      <h4 className="section-subtitle">Lab Options</h4>
      {renderObjectSelector()}
      {renderDragControls()}

      <div className="control-group checkbox">
        <label>
          <input
            type="checkbox"
            name="compareIdealPath"
            checked={params.compareIdealPath}
            onChange={handleChange}
            disabled={isLoading}
          />
          <span>Compare Ideal Path</span>
        </label>
      </div>
    </div>
  )

  return (
    <div className="controls-panel">
      <div className="tab-switcher">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => onTabChange(tab.key)}
            disabled={isLoading}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <h3>Simulation Controls</h3>

      {activeTab === 'intro' && (
        <>
          {renderBaseControls()}
          {renderObjectSelector()}
        </>
      )}

      {activeTab === 'vectors' && (
        <>
          {renderBaseControls()}
          {renderObjectSelector()}
          {renderVectorControls()}
        </>
      )}

      {activeTab === 'drag' && (
        <>
          {renderBaseControls()}
          {renderObjectSelector()}
          {renderDragControls()}
        </>
      )}

      {activeTab === 'lab' && (
        <>
          {renderBaseControls()}
          {renderLabControls()}
        </>
      )}

      <div className="control-buttons">
        <button
          className="calculate-btn"
          onClick={onCalculate}
          disabled={isLoading}
        >
          {isLoading ? 'Calculating...' : 'Calculate'}
        </button>

        <button
          className="reset-btn"
          onClick={onReset}
          disabled={isLoading}
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default Controls