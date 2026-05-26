import React from 'react'
import '../styles/output-panel.css'

const OutputPanel = ({
  results,
  params,
  activeTab,
  selectedObject,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="output-panel loading">
        <div className="loader"></div>
        <p>Calculating trajectory...</p>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="output-panel">
        <h3>Simulation Results</h3>
        <p className="placeholder-text">
          Enter parameters and click "Calculate" to view the motion results.
        </p>
      </div>
    )
  }

  return (
    <div className="output-panel">
      <h3>Simulation Results</h3>

      <div className="results-grid">
        <div className="result-item">
          <label>Time of Flight</label>
          <div className="result-value">{results.time_of_flight} s</div>
        </div>

        <div className="result-item">
          <label>Maximum Height</label>
          <div className="result-value">{results.max_height} m</div>
        </div>

        <div className="result-item">
          <label>Horizontal Range</label>
          <div className="result-value">{results.range} m</div>
        </div>

        <div className="result-item">
          <label>Final Velocity</label>
          <div className="result-value">{results.final_velocity} m/s</div>
        </div>
      </div>

      <div className="simulation-info">
        <h4>Current Settings</h4>

        <div className="info-grid">
          <div className="info-item">
            <span>Mode</span>
            <strong>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</strong>
          </div>

          <div className="info-item">
            <span>Object</span>
            <strong>{selectedObject?.label || 'Cannonball'}</strong>
          </div>

          <div className="info-item">
            <span>Launch Angle</span>
            <strong>{params.angle}°</strong>
          </div>

          <div className="info-item">
            <span>Initial Velocity</span>
            <strong>{params.velocity} m/s</strong>
          </div>

          <div className="info-item">
            <span>Gravity</span>
            <strong>{params.gravity} m/s²</strong>
          </div>

          <div className="info-item">
            <span>Initial Height</span>
            <strong>{params.initialHeight} m</strong>
          </div>

          <div className="info-item">
            <span>Mass</span>
            <strong>{params.mass} kg</strong>
          </div>

          <div className="info-item">
            <span>Diameter</span>
            <strong>{params.diameter} m</strong>
          </div>

          <div className="info-item full-width">
            <span>Air Resistance</span>
            <strong>{params.airResistance ? 'Enabled' : 'Disabled'}</strong>
          </div>
        </div>

        {(activeTab === 'vectors' || activeTab === 'lab') && (
          <div className="air-resistance-note">
            <strong>Vectors:</strong>{' '}
            {params.showVelocityVector ? 'Velocity ' : ''}
            {params.showAccelerationVector ? 'Acceleration ' : ''}
            {params.showComponentVectors ? 'Components' : ''}
          </div>
        )}

        {params.airResistance && (
          <div className="air-resistance-note">
            <strong>Drag:</strong> Numerical drag model is active with drag
            coefficient {params.dragCoefficient}.
          </div>
        )}

        {params.compareIdealPath && (
          <div className="air-resistance-note">
            <strong>Comparison:</strong> Ideal and drag trajectories are both displayed.
          </div>
        )}
      </div>
    </div>
  )
}

export default OutputPanel