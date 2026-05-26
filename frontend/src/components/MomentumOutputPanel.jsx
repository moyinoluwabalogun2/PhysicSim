import React from 'react'
import '../styles/output-panel.css'

const MomentumOutputPanel = ({ mode, params, results, isLoading }) => {
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
          Choose a scenario, adjust values, drag objects if needed, and click Calculate.
        </p>
      </div>
    )
  }

  const explanation =
    mode === 'momentum'
      ? 'Momentum means an object is hard to stop because it has mass and velocity. More mass or more velocity gives more momentum.'
      : mode === 'collision'
        ? params.collisionType === 'elastic'
          ? 'In an elastic collision, objects collide and bounce apart. Momentum before collision equals momentum after collision.'
          : 'In an inelastic collision, objects collide and stick together or move together. Momentum is still conserved.'
        : 'Recoil happens because when one object moves forward, the other moves backward so total momentum stays balanced.'

  return (
    <div className="output-panel">
      <h3>Simulation Results</h3>

      <p className="newton-summary">{results.summary}</p>
      <p className="newton-summary">{explanation}</p>

      {mode === 'momentum' && (
        <div className="results-grid">
          <div className="result-item">
            <label>Mass</label>
            <div className="result-value">{results.mass1} kg</div>
          </div>

          <div className="result-item">
            <label>Velocity</label>
            <div className="result-value">{results.velocity1} m/s</div>
          </div>

          <div className="result-item">
            <label>Momentum</label>
            <div className="result-value">{results.momentum1} kg·m/s</div>
          </div>
        </div>
      )}

      {mode === 'collision' && (
        <div className="results-grid">
          <div className="result-item">
            <label>Initial Momentum</label>
            <div className="result-value">{results.initial_momentum} kg·m/s</div>
          </div>

          <div className="result-item">
            <label>Final Momentum</label>
            <div className="result-value">{results.final_momentum} kg·m/s</div>
          </div>

          <div className="result-item">
            <label>Final Velocity 1</label>
            <div className="result-value">{results.final_velocity1} m/s</div>
          </div>

          <div className="result-item">
            <label>Final Velocity 2</label>
            <div className="result-value">{results.final_velocity2} m/s</div>
          </div>
        </div>
      )}

      {mode === 'recoil' && (
        <div className="results-grid">
          <div className="result-item">
            <label>Initial Momentum</label>
            <div className="result-value">{results.initial_momentum} kg·m/s</div>
          </div>

          <div className="result-item">
            <label>Body 1 Final Velocity</label>
            <div className="result-value">{results.final_velocity1} m/s</div>
          </div>

          <div className="result-item">
            <label>Body 2 Final Velocity</label>
            <div className="result-value">{results.final_velocity2} m/s</div>
          </div>

          <div className="result-item">
            <label>Final Momentum</label>
            <div className="result-value">{results.final_momentum} kg·m/s</div>
          </div>
        </div>
      )}

      <div className="simulation-info">
        <h4>Current Settings</h4>

        <div className="info-grid">
          <div className="info-item">
            <span>Mode</span>
            <strong>{mode}</strong>
          </div>

          <div className="info-item">
            <span>Scenario</span>
            <strong>{params.scenario}</strong>
          </div>

          <div className="info-item">
            <span>Mass 1</span>
            <strong>{params.mass1} kg</strong>
          </div>

          {mode !== 'recoil' && (
            <div className="info-item">
              <span>Velocity 1</span>
              <strong>{params.velocity1} m/s</strong>
            </div>
          )}

          {(mode === 'collision' || mode === 'recoil') && (
            <div className="info-item">
              <span>Mass 2</span>
              <strong>{params.mass2} kg</strong>
            </div>
          )}

          {mode === 'collision' && (
            <>
              <div className="info-item">
                <span>Velocity 2</span>
                <strong>{params.velocity2} m/s</strong>
              </div>

              <div className="info-item full-width">
                <span>Collision Type</span>
                <strong>{params.collisionType}</strong>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default MomentumOutputPanel