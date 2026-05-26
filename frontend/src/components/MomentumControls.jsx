import React from 'react'
import '../styles/controls.css'

const MODE_OPTIONS = [
  { key: 'momentum', label: 'Momentum' },
  { key: 'collision', label: 'Collision' },
  { key: 'recoil', label: 'Recoil' }
]

const SCENARIOS = {
  momentum: [
    { key: 'shopping-cart', label: 'Shopping Cart' },
    { key: 'bowling-ball', label: 'Bowling Ball' },
    { key: 'moving-trolley', label: 'Moving Trolley' }
  ],
  collision: [
    { key: 'bumper-cars', label: 'Bumper Cars' },
    
    { key: 'two-trolleys', label: 'Two Trolleys' }
  ],
  recoil: [
    { key: 'gun-recoil', label: 'Gun Recoil' },
    { key: 'skater-push', label: 'Skater Push' },
    { key: 'cannon-recoil', label: 'Cannon Recoil' }
  ]
}

const MomentumControls = ({
  mode,
  params,
  onModeChange,
  onScenarioChange,
  onParamChange,
  onCalculate,
  onReset,
  isLoading
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target

    onParamChange({
      [name]: name === 'collisionType' ? value : parseFloat(value)
    })
  }

  return (
    <div className="controls-panel">
      <div className="tab-switcher">
        {MODE_OPTIONS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`tab-button ${mode === item.key ? 'active' : ''}`}
            onClick={() => onModeChange(item.key)}
            disabled={isLoading}
          >
            {item.label}
          </button>
        ))}
      </div>

      <h3>Simulation Controls</h3>

      <div className="control-group">
        <label htmlFor="scenario">Scenario</label>
        <select
          id="scenario"
          value={params.scenario}
          onChange={(e) => onScenarioChange(e.target.value)}
          disabled={isLoading}
          className="control-select"
        >
          {SCENARIOS[mode].map((scenario) => (
            <option key={scenario.key} value={scenario.key}>
              {scenario.label}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label htmlFor="mass1">
          {mode === 'recoil' ? 'Mass A / Recoil Body' : 'Mass 1'}: {params.mass1} kg
        </label>
        <input
          type="range"
          id="mass1"
          name="mass1"
          min="0.05"
          max="300"
          step="0.05"
          value={params.mass1}
          onChange={handleChange}
          disabled={isLoading}
        />
        <div className="range-values">
          <span>0.05kg</span>
          <span>150kg</span>
          <span>300kg</span>
        </div>
      </div>

      {mode !== 'recoil' && (
        <div className="control-group">
          <label htmlFor="velocity1">Velocity 1: {params.velocity1} m/s</label>
          <input
            type="range"
            id="velocity1"
            name="velocity1"
            min="-20"
            max="20"
            step="0.5"
            value={params.velocity1}
            onChange={handleChange}
            disabled={isLoading}
          />
          <div className="range-values">
            <span>-20</span>
            <span>0</span>
            <span>20</span>
          </div>
        </div>
      )}

      {(mode === 'collision' || mode === 'recoil') && (
        <>
          <div className="control-group">
            <label htmlFor="mass2">
              {mode === 'recoil' ? 'Mass B / Moving Body' : 'Mass 2'}: {params.mass2} kg
            </label>
            <input
              type="range"
              id="mass2"
              name="mass2"
              min="0.05"
              max={mode === 'recoil' ? 300 : 300}
              step="0.05"
              value={params.mass2}
              onChange={handleChange}
              disabled={isLoading}
            />
            <div className="range-values">
              <span>0.05kg</span>
              <span>150kg</span>
              <span>300kg</span>
            </div>
          </div>

          {mode === 'collision' && (
            <div className="control-group">
              <label htmlFor="velocity2">Velocity 2: {params.velocity2} m/s</label>
              <input
                type="range"
                id="velocity2"
                name="velocity2"
                min="-20"
                max="20"
                step="0.5"
                value={params.velocity2}
                onChange={handleChange}
                disabled={isLoading}
              />
              <div className="range-values">
                <span>-20</span>
                <span>0</span>
                <span>20</span>
              </div>
            </div>
          )}
        </>
      )}

      {mode === 'collision' && (
        <div className="control-group">
          <label htmlFor="collisionType">Collision Type</label>
          <select
            id="collisionType"
            name="collisionType"
            value={params.collisionType}
            onChange={handleChange}
            disabled={isLoading}
            className="control-select"
          >
            <option value="elastic">Elastic — bounce apart</option>
            <option value="inelastic">Inelastic — stick/move together</option>
          </select>
        </div>
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

export default MomentumControls