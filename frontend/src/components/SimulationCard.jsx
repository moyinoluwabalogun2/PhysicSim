import React from 'react'
import '../styles/simulation-card.css'

const SimulationCard = ({ title, description, icon: Icon, color, onClick, disabled }) => {
  return (
    <div
      className={`simulation-card ${disabled ? 'disabled' : ''}`}
      onClick={!disabled ? onClick : undefined}
      style={{ '--accent-color': color }}
    >
      <div className="card-glow"></div>

      <div className="card-icon">
        {Icon && <Icon size={36} strokeWidth={2.2} />}
      </div>

      <div className="card-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <div className="card-footer">
        {!disabled ? (
          <button className="card-button">Launch Simulation</button>
        ) : (
          <span className="coming-soon-badge">Coming Soon</span>
        )}
      </div>
    </div>
  )
}

export default SimulationCard