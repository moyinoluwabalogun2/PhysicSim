import React from 'react'
import '../styles/controls.css'

const MODE_OPTIONS = [
  { key: 'spring', label: 'Spring-Mass' },
  { key: 'pendulum', label: 'Pendulum / Bell' },
  { key: 'horizontal', label: 'Horizontal Spring' }
]

const SHMControls = ({
  mode,
  params,
  onModeChange,
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

      {(mode === 'spring' || mode === 'horizontal') && (
        <>
          <div className="control-group">
            <label htmlFor="mass">Mass: {params.mass} kg</label>
            <input
              type="range"
              id="mass"
              name="mass"
              min="0.5"
              max="50"
              step="0.5"
              value={params.mass}
              onChange={handleChange}
              disabled={isLoading}
            />
            <div className="range-values">
              <span>0.5kg</span>
              <span>25kg</span>
              <span>50kg</span>
            </div>
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
              max="200"
              step="1"
              value={params.springConstant}
              onChange={handleChange}
              disabled={isLoading}
            />
            <div className="range-values">
              <span>soft</span>
              <span>medium</span>
              <span>stiff</span>
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="amplitude">Amplitude: {params.amplitude} m</label>
            <input
              type="range"
              id="amplitude"
              name="amplitude"
              min="0.1"
              max="5"
              step="0.1"
              value={params.amplitude}
              onChange={handleChange}
              disabled={isLoading}
            />
            <div className="range-values">
              <span>small</span>
              <span>medium</span>
              <span>large</span>
            </div>
          </div>
        </>
      )}

      {mode === 'pendulum' && (
        <>
          <div className="control-group">
            <label htmlFor="length">Pendulum Length: {params.length} m</label>
            <input
              type="range"
              id="length"
              name="length"
              min="0.5"
              max="10"
              step="0.1"
              value={params.length}
              onChange={handleChange}
              disabled={isLoading}
            />
            <div className="range-values">
              <span>short</span>
              <span>medium</span>
              <span>long</span>
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
              <span>low</span>
              <span>Earth</span>
              <span>high</span>
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="initialAngle">
              Starting Angle: {params.initialAngle}°
            </label>
            <input
              type="range"
              id="initialAngle"
              name="initialAngle"
              min="-45"
              max="45"
              step="1"
              value={params.initialAngle}
              onChange={handleChange}
              disabled={isLoading}
            />
            <div className="range-values">
              <span>-45°</span>
              <span>0°</span>
              <span>45°</span>
            </div>
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

export default SHMControls