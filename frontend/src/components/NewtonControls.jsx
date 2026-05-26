import React from 'react'
import '../styles/controls.css'

const LAW_OPTIONS = [
  { key: 'first', label: 'Law I' },
  { key: 'second', label: 'Law II' },
  { key: 'third', label: 'Law III' }
]

const PRESET_OPTIONS = {
  first: [
    { key: 'ice', label: 'Ice Surface' },
    { key: 'rough-floor', label: 'Rough Floor' },
    { key: 'moving-stop', label: 'Moving Stop' },
    { key: 'trolley', label: 'Trolley' }
  ],
  second: [
    { key: 'cart-push', label: 'Cart Push' },
    { key: 'heavy-crate', label: 'Heavy Crate' },
    { key: 'sled', label: 'Sled Push' }
  ],
  third: [
    { key: 'gun-recoil', label: 'Gun Recoil' },
    { key: 'wall-push', label: 'Wall Push' },
    { key: 'skaters', label: 'Skaters' },
    { key: 'jump-board', label: 'Jump Board' }
  ]
}

const NewtonControls = ({
  lawType,
  params,
  onLawChange,
  onPresetChange,
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

  return (
    <div className="controls-panel">
      <div className="tab-switcher">
        {LAW_OPTIONS.map((law) => (
          <button
            key={law.key}
            type="button"
            className={`tab-button ${lawType === law.key ? 'active' : ''}`}
            onClick={() => onLawChange(law.key)}
            disabled={isLoading}
          >
            {law.label}
          </button>
        ))}
      </div>

      <h3>Newton Controls</h3>

      <div className="control-group">
        <label htmlFor="scenarioPreset">Scenario Preset</label>
        <select
          id="scenarioPreset"
          name="scenarioPreset"
          value={params.scenarioPreset}
          onChange={(e) => onPresetChange(e.target.value)}
          disabled={isLoading}
          className="control-select"
        >
          {PRESET_OPTIONS[lawType].map((preset) => (
            <option key={preset.key} value={preset.key}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>

      {lawType === 'first' && (
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
            <label htmlFor="initialVelocity">
              Initial Velocity: {params.initialVelocity} m/s
            </label>
            <input
              type="range"
              id="initialVelocity"
              name="initialVelocity"
              min="-100"
              max="100"
              step="1"
              value={params.initialVelocity}
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
              max="20"
              step="0.5"
              value={params.time}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="control-group checkbox">
            <label>
              <input
                type="checkbox"
                name="frictionEnabled"
                checked={params.frictionEnabled}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span>Enable Friction</span>
            </label>
          </div>

          <div className="control-group">
            <label htmlFor="frictionCoefficient">
              Friction Coefficient: {params.frictionCoefficient}
            </label>
            <input
              type="range"
              id="frictionCoefficient"
              name="frictionCoefficient"
              min="0"
              max="2"
              step="0.01"
              value={params.frictionCoefficient}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
        </>
      )}

      {lawType === 'second' && (
        <>
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
          </div>

          <div className="control-group">
            <label htmlFor="appliedForce">
              Applied Force: {params.appliedForce} N
            </label>
            <input
              type="range"
              id="appliedForce"
              name="appliedForce"
              min="0"
              max="300"
              step="1"
              value={params.appliedForce}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="control-group">
            <label htmlFor="frictionCoefficient">
              Friction Coefficient: {params.frictionCoefficient}
            </label>
            <input
              type="range"
              id="frictionCoefficient"
              name="frictionCoefficient"
              min="0"
              max="2"
              step="0.01"
              value={params.frictionCoefficient}
              onChange={handleChange}
              disabled={isLoading}
            />
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
          </div>

          <div className="control-group">
            <label htmlFor="time">Time: {params.time} s</label>
            <input
              type="range"
              id="time"
              name="time"
              min="1"
              max="20"
              step="0.5"
              value={params.time}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
        </>
      )}

      {lawType === 'third' && (
        <>
          <div className="control-group">
            <label htmlFor="massA">Mass A: {params.massA} kg</label>
            <input
              type="range"
              id="massA"
              name="massA"
              min="1"
              max="200"
              step="0.5"
              value={params.massA}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="control-group">
            <label htmlFor="massB">Mass B: {params.massB} kg</label>
            <input
              type="range"
              id="massB"
              name="massB"
              min="1"
              max="2000"
              step="0.5"
              value={params.massB}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="control-group">
            <label htmlFor="interactionForce">
              Interaction Force: {params.interactionForce} N
            </label>
            <input
              type="range"
              id="interactionForce"
              name="interactionForce"
              min="1"
              max="300"
              step="1"
              value={params.interactionForce}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="control-group">
            <label htmlFor="interactionTime">
              Interaction Time: {params.interactionTime} s
            </label>
            <input
              type="range"
              id="interactionTime"
              name="interactionTime"
              min="0.5"
              max="10"
              step="0.1"
              value={params.interactionTime}
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

export default NewtonControls