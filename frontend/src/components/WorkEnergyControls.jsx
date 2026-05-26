import React from 'react'
import '../styles/controls.css'

const MODE_OPTIONS = [
  { key: 'work', label: 'Work' },
  { key: 'energy', label: 'Energy' },
  { key: 'power', label: 'Power' }
]

const SCENARIOS = {
  work: [
    { key: 'push-crate', label: 'Push Crate' },
    { key: 'pull-sled', label: 'Pull Sled' },
    { key: 'drag-suitcase', label: 'Drag Travel Bag' },
    { key: 'push-trolley', label: 'Push Trolley' }
  ],
  energy: [
    { key: 'ball-ramp', label: 'Ball on Ramp' },
    { key: 'cart-hill', label: 'Cart on Hill' },
    { key: 'spring-launch', label: 'Spring Launch' }
  ],
  power: [
    { key: 'lift-box', label: 'Lift Box' },
    { key: 'lift-fast', label: 'Lift Fast' },
    { key: 'small-car', label: 'Small Car' },
    { key: 'sports-car', label: 'Sports Car' }
  ]
}

const WorkEnergyControls = ({
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
      [name]: parseFloat(value)
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

      {mode === 'work' && (
        <>
          <div className="control-group">
            <label htmlFor="force">Force: {params.force} N</label>
            <input
              type="range"
              id="force"
              name="force"
              min="1"
              max="300"
              step="1"
              value={params.force}
              onChange={handleChange}
              disabled={isLoading}
            />
            <div className="range-values">
              <span>1 N</span>
              <span>150 N</span>
              <span>300 N</span>
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="distance">Distance: {params.distance} m</label>
            <input
              type="range"
              id="distance"
              name="distance"
              min="1"
              max="100"
              step="1"
              value={params.distance}
              onChange={handleChange}
              disabled={isLoading}
            />
            <div className="range-values">
              <span>1 m</span>
              <span>50 m</span>
              <span>100 m</span>
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="angle">Force Angle: {params.angle}°</label>
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
            <label htmlFor="mass">Mass: {params.mass} kg</label>
            <input
              type="range"
              id="mass"
              name="mass"
              min="1"
              max="150"
              step="0.5"
              value={params.mass}
              onChange={handleChange}
              disabled={isLoading}
            />
            <div className="range-values">
              <span>1 kg</span>
              <span>75 kg</span>
              <span>150 kg</span>
            </div>
          </div>
        </>
      )}

      {mode === 'energy' && params.scenario !== 'spring-launch' && (
        <>
          <div className="control-group">
            <label htmlFor="mass">Mass: {params.mass} kg</label>
            <input
              type="range"
              id="mass"
              name="mass"
              min="1"
              max="100"
              step="0.5"
              value={params.mass}
              onChange={handleChange}
              disabled={isLoading}
            />
            <div className="range-values">
              <span>1 kg</span>
              <span>50 kg</span>
              <span>100 kg</span>
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="height">Height: {params.height} m</label>
            <input
              type="range"
              id="height"
              name="height"
              min="1"
              max="100"
              step="1"
              value={params.height}
              onChange={handleChange}
              disabled={isLoading}
            />
            <div className="range-values">
              <span>1 m</span>
              <span>50 m</span>
              <span>100 m</span>
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
              step="0.1"
              value={params.gravity}
              onChange={handleChange}
              disabled={isLoading}
            />
            <div className="range-values">
              <span>1</span>
              <span>9.81</span>
              <span>30</span>
            </div>
          </div>
        </>
      )}

      {mode === 'energy' && params.scenario === 'spring-launch' && (
        <>
          <div className="control-group">
            <label htmlFor="mass">Mass: {params.mass} kg</label>
            <input
              type="range"
              id="mass"
              name="mass"
              min="1"
              max="100"
              step="0.5"
              value={params.mass}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="control-group">
            <label htmlFor="springConstant">
              Spring Constant: {params.springConstant} N/m
            </label>
            <input
              type="range"
              id="springConstant"
              name="springConstant"
              min="1"
              max="300"
              step="1"
              value={params.springConstant}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="control-group">
            <label htmlFor="compression">Compression: {params.compression} m</label>
            <input
              type="range"
              id="compression"
              name="compression"
              min="0.1"
              max="8"
              step="0.1"
              value={params.compression}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
        </>
      )}

      {mode === 'power' && (
        <>
          <div className="control-group">
            <label htmlFor="mass">Mass: {params.mass} kg</label>
            <input
              type="range"
              id="mass"
              name="mass"
              min="1"
              max="2500"
              step="1"
              value={params.mass}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="control-group">
            <label htmlFor="height">Height / Work Distance: {params.height} m</label>
            <input
              type="range"
              id="height"
              name="height"
              min="1"
              max="100"
              step="1"
              value={params.height}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="control-group">
            <label htmlFor="time">Time: {params.time} s</label>
            <input
              type="range"
              id="time"
              name="time"
              min="1"
              max="30"
              step="0.5"
              value={params.time}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
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

export default WorkEnergyControls