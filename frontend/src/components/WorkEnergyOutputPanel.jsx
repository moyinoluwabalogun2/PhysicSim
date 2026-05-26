import React from 'react'
import '../styles/output-panel.css'

const WorkEnergyOutputPanel = ({ mode, params, results, isLoading }) => {
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
          Choose a mode, set the values, and click Calculate.
        </p>
      </div>
    )
  }

  const explanation =
    mode === 'work'
      ? 'Work is done when force moves an object through a distance. If the force is angled, only the horizontal part of the force does the forward work.'
      : mode === 'energy'
        ? params.scenario === 'spring-launch'
          ? 'The compressed spring stores energy first. When released, that stored spring energy becomes kinetic energy.'
          : 'At the top, potential energy is high and kinetic energy is low. As the object moves down, potential energy changes into kinetic energy.'
        : 'Power tells how fast work is done. The same work done in less time gives higher power.'

  return (
    <div className="output-panel">
      <h3>Simulation Results</h3>
      <p className="newton-summary">{results.summary}</p>
      <p className="newton-summary">{explanation}</p>

      {mode === 'work' && (
        <div className="results-grid">
          <div className="result-item">
            <label>Force</label>
            <div className="result-value">{results.force} N</div>
          </div>

          <div className="result-item">
            <label>Distance</label>
            <div className="result-value">{results.distance} m</div>
          </div>

          <div className="result-item">
            <label>Force Angle</label>
            <div className="result-value">{results.angle}°</div>
          </div>

          <div className="result-item">
            <label>Work Done</label>
            <div className="result-value">{results.work_done} J</div>
          </div>
        </div>
      )}

      {mode === 'energy' && (
        <div className="results-grid">
          {results.scenario !== 'spring-launch' && (
            <>
              <div className="result-item">
                <label>Initial Potential Energy</label>
                <div className="result-value">{results.initial_potential_energy} J</div>
              </div>

              <div className="result-item">
                <label>Initial Kinetic Energy</label>
                <div className="result-value">{results.initial_kinetic_energy} J</div>
              </div>

              <div className="result-item">
                <label>Total Energy</label>
                <div className="result-value">{results.total_energy} J</div>
              </div>

              <div className="result-item">
                <label>Bottom Kinetic Energy</label>
                <div className="result-value">{results.kinetic_energy} J</div>
              </div>

              <div className="result-item">
                <label>Final Velocity</label>
                <div className="result-value">{results.final_velocity} m/s</div>
              </div>
            </>
          )}

          {results.scenario === 'spring-launch' && (
            <>
              <div className="result-item">
                <label>Spring Energy</label>
                <div className="result-value">{results.initial_spring_energy} J</div>
              </div>

              <div className="result-item">
                <label>Kinetic Energy</label>
                <div className="result-value">{results.kinetic_energy} J</div>
              </div>

              <div className="result-item">
                <label>Total Energy</label>
                <div className="result-value">{results.total_energy} J</div>
              </div>

              <div className="result-item">
                <label>Launch Velocity</label>
                <div className="result-value">{results.launch_velocity} m/s</div>
              </div>
            </>
          )}
        </div>
      )}

      {mode === 'power' && (
        <div className="results-grid">
          <div className="result-item">
            <label>Mass</label>
            <div className="result-value">{results.mass} kg</div>
          </div>

          <div className="result-item">
            <label>Height / Distance</label>
            <div className="result-value">{results.height} m</div>
          </div>

          <div className="result-item">
            <label>Time</label>
            <div className="result-value">{results.time} s</div>
          </div>

          <div className="result-item">
            <label>Work Done</label>
            <div className="result-value">{results.work_done} J</div>
          </div>

          <div className="result-item">
            <label>Power</label>
            <div className="result-value">{results.power} W</div>
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

          {mode === 'work' && (
            <>
              <div className="info-item">
                <span>Force</span>
                <strong>{params.force} N</strong>
              </div>

              <div className="info-item">
                <span>Distance</span>
                <strong>{params.distance} m</strong>
              </div>

              <div className="info-item full-width">
                <span>Angle</span>
                <strong>{params.angle}°</strong>
              </div>
            </>
          )}

          {mode === 'energy' && (
            <>
              <div className="info-item">
                <span>Mass</span>
                <strong>{params.mass} kg</strong>
              </div>

              {params.scenario === 'spring-launch' ? (
                <>
                  <div className="info-item">
                    <span>Spring Constant</span>
                    <strong>{params.springConstant} N/m</strong>
                  </div>

                  <div className="info-item full-width">
                    <span>Compression</span>
                    <strong>{params.compression} m</strong>
                  </div>
                </>
              ) : (
                <>
                  <div className="info-item">
                    <span>Height</span>
                    <strong>{params.height} m</strong>
                  </div>

                  <div className="info-item full-width">
                    <span>Gravity</span>
                    <strong>{params.gravity} m/s²</strong>
                  </div>
                </>
              )}
            </>
          )}

          {mode === 'power' && (
            <>
              <div className="info-item">
                <span>Mass</span>
                <strong>{params.mass} kg</strong>
              </div>

              <div className="info-item">
                <span>Time</span>
                <strong>{params.time} s</strong>
              </div>

              <div className="info-item full-width">
                <span>Height / Distance</span>
                <strong>{params.height} m</strong>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkEnergyOutputPanel