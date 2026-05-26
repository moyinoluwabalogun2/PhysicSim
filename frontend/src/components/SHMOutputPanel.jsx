import React from 'react'
import '../styles/output-panel.css'

const SHMOutputPanel = ({ mode, params, results, isLoading }) => {
  if (isLoading) {
    return (
      <div className="output-panel loading">
        <div className="loader"></div>
        <p>Calculating simulation...</p>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="output-panel">
        <h3>Simulation Results</h3>
        <p className="placeholder-text">
          Choose a system, set the values, drag the preview if needed, and click Calculate.
        </p>
      </div>
    )
  }

  const explanation =
    mode === 'spring'
      ? 'The mass moves up and down repeatedly. The spring pulls it back toward the equilibrium position.'
      : mode === 'horizontal'
        ? 'The block slides left and right. The restoring force always points back toward the centre.'
        : 'The bell behaves like a pendulum. It swings around the centre position because gravity pulls it back.'

  const formula =
    mode === 'pendulum'
      ? 'For a pendulum: T = 2π√(L/g)'
      : 'For a spring: T = 2π√(m/k)'

  return (
    <div className="output-panel">
      <h3>Simulation Results</h3>

      <p className="newton-summary">{results.summary}</p>
      <p className="newton-summary">{explanation}</p>

      <div className="air-resistance-note">
        <strong>Formula:</strong> {formula}
      </div>

      <div className="results-grid">
        <div className="result-item">
          <label>Angular Frequency</label>
          <div className="result-value">{results.angular_frequency} rad/s</div>
        </div>

        <div className="result-item">
          <label>Period</label>
          <div className="result-value">{results.period} s</div>
        </div>

        <div className="result-item">
          <label>Max Velocity</label>
          <div className="result-value">{results.max_velocity} m/s</div>
        </div>

        <div className="result-item">
          <label>Max Acceleration</label>
          <div className="result-value">{results.max_acceleration} m/s²</div>
        </div>
      </div>

      <div className="simulation-info">
        <h4>Current Settings</h4>

        <div className="info-grid">
          <div className="info-item">
            <span>Mode</span>
            <strong>{mode}</strong>
          </div>

          {(mode === 'spring' || mode === 'horizontal') && (
            <>
              <div className="info-item">
                <span>Mass</span>
                <strong>{params.mass} kg</strong>
              </div>

              <div className="info-item">
                <span>Spring Constant</span>
                <strong>{params.springConstant} N/m</strong>
              </div>

              <div className="info-item full-width">
                <span>Amplitude</span>
                <strong>{params.amplitude} m</strong>
              </div>
            </>
          )}

          {mode === 'pendulum' && (
            <>
              <div className="info-item">
                <span>Length</span>
                <strong>{params.length} m</strong>
              </div>

              <div className="info-item">
                <span>Gravity</span>
                <strong>{params.gravity} m/s²</strong>
              </div>

              <div className="info-item full-width">
                <span>Starting Angle</span>
                <strong>{params.initialAngle}°</strong>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SHMOutputPanel