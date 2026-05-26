import React, { useMemo, useState } from 'react'
import '../styles/output-panel.css'

const buildSvgPath = (points, xKey, yKey, width = 280, height = 140) => {
  if (!points || points.length < 2) return ''

  const xs = points.map((p) => p[xKey])
  const ys = points.map((p) => p[yKey])

  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  const xRange = maxX - minX || 1
  const yRange = maxY - minY || 1

  return points
    .map((p, index) => {
      const x = ((p[xKey] - minX) / xRange) * (width - 20) + 10
      const y = height - (((p[yKey] - minY) / yRange) * (height - 20) + 10)
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

const GraphCard = ({ title, points, xKey, yKey, color }) => {
  const path = useMemo(() => buildSvgPath(points, xKey, yKey), [points, xKey, yKey])

  return (
    <div className="newton-graph-card">
      <h4>{title}</h4>
      <svg width="100%" height="160" viewBox="0 0 280 140">
        <line x1="10" y1="130" x2="270" y2="130" stroke="rgba(15,23,42,0.18)" />
        <line x1="10" y1="10" x2="10" y2="130" stroke="rgba(15,23,42,0.18)" />
        <path d={path} fill="none" stroke={color} strokeWidth="3" />
      </svg>
    </div>
  )
}

const NewtonOutputPanel = ({ lawType, results, isLoading }) => {
  const [graphTab, setGraphTab] = useState('displacement')

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
          Choose a law, set a scenario, and click Calculate.
        </p>
      </div>
    )
  }

  const singleLawPoints = results.points || []
  const dualPoints = results.dual_points || []

  return (
    <div className="output-panel">
      <h3>Simulation Results</h3>
      <p className="newton-summary">{results.summary}</p>

      {lawType !== 'third' && (
        <>
          <div className="results-grid">
            <div className="result-item">
              <label>Net Force</label>
              <div className="result-value">{results.net_force} N</div>
            </div>
            <div className="result-item">
              <label>Acceleration</label>
              <div className="result-value">{results.acceleration} m/s²</div>
            </div>
            <div className="result-item">
              <label>Final Velocity</label>
              <div className="result-value">{results.final_velocity} m/s</div>
            </div>
            <div className="result-item">
              <label>Displacement</label>
              <div className="result-value">{results.displacement} m</div>
            </div>
            <div className="result-item">
              <label>Friction Force</label>
              <div className="result-value">{results.friction_force ?? 0} N</div>
            </div>
          </div>

          <div className="newton-graph-tabs">
            <button
              className={graphTab === 'displacement' ? 'active' : ''}
              onClick={() => setGraphTab('displacement')}
            >
              x vs t
            </button>
            <button
              className={graphTab === 'velocity' ? 'active' : ''}
              onClick={() => setGraphTab('velocity')}
            >
              v vs t
            </button>
          </div>

          {graphTab === 'displacement' && (
            <GraphCard
              title="Displacement-Time Graph"
              points={singleLawPoints}
              xKey="t"
              yKey="x"
              color="#2563eb"
            />
          )}

          {graphTab === 'velocity' && (
            <GraphCard
              title="Velocity-Time Graph"
              points={singleLawPoints}
              xKey="t"
              yKey="v"
              color="#16a34a"
            />
          )}
        </>
      )}

      {lawType === 'third' && (
        <>
          <div className="results-grid">
            <div className="result-item">
              <label>Force on A</label>
              <div className="result-value">{results.force_on_a} N</div>
            </div>
            <div className="result-item">
              <label>Force on B</label>
              <div className="result-value">{results.force_on_b} N</div>
            </div>
            <div className="result-item">
              <label>Acceleration A</label>
              <div className="result-value">{results.acceleration_a} m/s²</div>
            </div>
            <div className="result-item">
              <label>Acceleration B</label>
              <div className="result-value">{results.acceleration_b} m/s²</div>
            </div>
            <div className="result-item">
              <label>Final Velocity A</label>
              <div className="result-value">{results.final_velocity_a} m/s</div>
            </div>
            <div className="result-item">
              <label>Final Velocity B</label>
              <div className="result-value">{results.final_velocity_b} m/s</div>
            </div>
            <div className="result-item">
              <label>Displacement A</label>
              <div className="result-value">{results.displacement_a} m</div>
            </div>
            <div className="result-item">
              <label>Displacement B</label>
              <div className="result-value">{results.displacement_b} m</div>
            </div>
          </div>

          <div className="newton-graph-dual-wrap">
            <GraphCard
              title="Body A Position-Time"
              points={dualPoints.map((p) => ({ t: p.t, value: p.xA }))}
              xKey="t"
              yKey="value"
              color="#2563eb"
            />
            <GraphCard
              title="Body B Position-Time"
              points={dualPoints.map((p) => ({ t: p.t, value: p.xB }))}
              xKey="t"
              yKey="value"
              color="#ec4899"
            />
          </div>
        </>
      )}
    </div>
  )
}

export default NewtonOutputPanel