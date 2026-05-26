import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  ArrowLeft,
  Sparkles,
  PanelRightOpen,
  PanelRightClose,
  BarChart3,
  Pause,
  Play,
  RotateCcw
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import WorkEnergyControls from '../components/WorkEnergyControls'
import WorkEnergyCanvas from '../components/WorkEnergyCanvas'
import WorkEnergyOutputPanel from '../components/WorkEnergyOutputPanel'
import { calculateWorkEnergyPower } from '../services/api'
import '../styles/work-energy.css'

const DEFAULT_PARAMS = {
  mode: 'work',
  scenario: 'push-crate',
  force: 40,
  distance: 10,
  angle: 0,
  mass: 5,
  gravity: 9.81,
  height: 6,
  velocity: 0,
  springConstant: 25,
  compression: 1.2,
  time: 5
}

const WorkEnergyPower = () => {
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  const [mode, setMode] = useState('work')
  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isControlsOpen, setIsControlsOpen] = useState(true)
  const [isResultsOpen, setIsResultsOpen] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 700 })

  useEffect(() => {
    const updateSize = () => {
      const mobile = window.innerWidth < 768
      const width = Math.min(1200, window.innerWidth - (mobile ? 24 : 80))
      const height = mobile ? 480 : 700
      setCanvasSize({ width: Math.max(320, width), height })
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const clearSimulation = useCallback(() => {
    setResults(null)
    setError(null)
    setIsResultsOpen(false)
    setIsPlaying(true)
    canvasRef.current?.resetAnimation?.()
  }, [])

  const applyModeDefaults = useCallback((nextMode, scenario) => {
    if (nextMode === 'work') {
      if (scenario === 'pull-sled') {
        return {
          ...DEFAULT_PARAMS,
          mode: 'work',
          scenario: 'pull-sled',
          force: 55,
          distance: 16,
          angle: 25,
          mass: 10
        }
      }

      if (scenario === 'drag-suitcase') {
        return {
          ...DEFAULT_PARAMS,
          mode: 'work',
          scenario: 'drag-suitcase',
          force: 35,
          distance: 18,
          angle: 18,
          mass: 12
        }
      }

      if (scenario === 'push-trolley') {
        return {
          ...DEFAULT_PARAMS,
          mode: 'work',
          scenario: 'push-trolley',
          force: 70,
          distance: 20,
          angle: 0,
          mass: 25
        }
      }

      return {
        ...DEFAULT_PARAMS,
        mode: 'work',
        scenario: 'push-crate',
        force: 50,
        distance: 14,
        angle: 0,
        mass: 15
      }
    }

    if (nextMode === 'energy') {
      if (scenario === 'cart-hill') {
        return {
          ...DEFAULT_PARAMS,
          mode: 'energy',
          scenario: 'cart-hill',
          mass: 6,
          height: 8
        }
      }

      if (scenario === 'spring-launch') {
        return {
          ...DEFAULT_PARAMS,
          mode: 'energy',
          scenario: 'spring-launch',
          mass: 4,
          springConstant: 45,
          compression: 1.5
        }
      }

      return {
        ...DEFAULT_PARAMS,
        mode: 'energy',
        scenario: 'ball-ramp',
        mass: 3,
        height: 6
      }
    }

    if (scenario === 'lift-fast') {
      return {
        ...DEFAULT_PARAMS,
        mode: 'power',
        scenario: 'lift-fast',
        mass: 20,
        height: 5,
        time: 2
      }
    }

    if (scenario === 'small-car') {
      return {
        ...DEFAULT_PARAMS,
        mode: 'power',
        scenario: 'small-car',
        mass: 900,
        height: 5,
        time: 9
      }
    }

    if (scenario === 'sports-car') {
      return {
        ...DEFAULT_PARAMS,
        mode: 'power',
        scenario: 'sports-car',
        mass: 1200,
        height: 5,
        time: 4
      }
    }

    return {
      ...DEFAULT_PARAMS,
      mode: 'power',
      scenario: 'lift-box',
      mass: 20,
      height: 5,
      time: 6
    }
  }, [])

  const handleModeChange = useCallback(
    (nextMode) => {
      setMode(nextMode)

      const firstScenario =
        nextMode === 'work'
          ? 'push-crate'
          : nextMode === 'energy'
            ? 'ball-ramp'
            : 'lift-box'

      setParams(applyModeDefaults(nextMode, firstScenario))
      clearSimulation()
    },
    [applyModeDefaults, clearSimulation]
  )

  const handleScenarioChange = useCallback(
    (scenario) => {
      setParams(applyModeDefaults(mode, scenario))
      clearSimulation()
    },
    [applyModeDefaults, clearSimulation, mode]
  )

  const handleParamChange = useCallback(
    (newParams) => {
      setParams((prev) => ({
        ...prev,
        ...newParams,
        mode
      }))
      clearSimulation()
    },
    [clearSimulation, mode]
  )

  const handleAnimationComplete = useCallback(() => {
    setIsResultsOpen(true)
    setIsControlsOpen(true)
    setIsPlaying(false)
  }, [])

  const handleCalculate = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setIsControlsOpen(false)
    setIsResultsOpen(false)
    setIsPlaying(true)

    try {
      const response = await calculateWorkEnergyPower({
        ...params,
        mode
      })
      setResults(response)
    } catch (err) {
      setError(err.message || 'Failed to calculate Work, Energy & Power simulation')
      setIsResultsOpen(true)
      setIsControlsOpen(true)
      setIsPlaying(false)
    } finally {
      setIsLoading(false)
    }
  }, [params, mode])

  const handlePlayPause = useCallback(() => {
    if (!results) return

    if (isPlaying) {
      canvasRef.current?.pauseAnimation?.()
      setIsPlaying(false)
    } else {
      canvasRef.current?.resumeAnimation?.()
      setIsPlaying(true)
    }
  }, [isPlaying, results])

  const handleReplay = useCallback(() => {
    if (!results) return
    setIsResultsOpen(false)
    setIsPlaying(true)
    canvasRef.current?.restartAnimation?.()
  }, [results])

  const handleReset = useCallback(() => {
    setMode('work')
    setParams(DEFAULT_PARAMS)
    setResults(null)
    setError(null)
    setIsControlsOpen(true)
    setIsResultsOpen(true)
    setIsPlaying(true)
    canvasRef.current?.resetAnimation?.()
  }, [])

  return (
    <div className="work-energy-container">
      <div className="work-energy-background-effects">
        <span className="work-energy-orb orb-orange"></span>
        <span className="work-energy-orb orb-green"></span>
        <span className="work-energy-grid"></span>
      </div>

      <header className="simulation-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <div className="simulation-title-block">
          <span className="simulation-chip">
            <Sparkles size={14} />
            Interactive Simulation
          </span>
          <h1>Work, Energy &amp; Power</h1>
          <p>
            Explore work done by forces, energy conversion, and power in realistic
            real-world scenarios with clear motion and visual explanation.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="header-toggle-btn"
            onClick={() => setIsResultsOpen((prev) => !prev)}
          >
            <BarChart3 size={16} />
            <span>{isResultsOpen ? 'Hide Results' : 'Show Results'}</span>
          </button>

          <button
            type="button"
            className="header-toggle-btn"
            onClick={() => setIsControlsOpen((prev) => !prev)}
          >
            {isControlsOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
            <span>{isControlsOpen ? 'Hide Controls' : 'Show Controls'}</span>
          </button>

          <button
            type="button"
            className="header-toggle-btn"
            onClick={handlePlayPause}
            disabled={!results}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            type="button"
            className="header-toggle-btn"
            onClick={handleReplay}
            disabled={!results}
          >
            <RotateCcw size={16} />
            <span>Replay</span>
          </button>
        </div>
      </header>

      <section className="simulation-stage">
        <div className="simulation-canvas-shell">
          <WorkEnergyCanvas
            ref={canvasRef}
            mode={mode}
            params={params}
            results={results}
            width={canvasSize.width}
            height={canvasSize.height}
            onAnimationComplete={handleAnimationComplete}
          />
        </div>

        <aside className={`floating-controls drawer-panel ${isControlsOpen ? 'open' : 'closed'}`}>
          <WorkEnergyControls
            mode={mode}
            params={params}
            onModeChange={handleModeChange}
            onScenarioChange={handleScenarioChange}
            onParamChange={handleParamChange}
            onCalculate={handleCalculate}
            onReset={handleReset}
            isLoading={isLoading}
          />
        </aside>

        <aside className={`floating-results results-panel ${isResultsOpen ? 'open' : 'closed'}`}>
          <WorkEnergyOutputPanel
            mode={mode}
            params={params}
            results={results}
            isLoading={isLoading}
          />
        </aside>

        {error && (
          <div className="floating-error">
            <strong>Error:</strong> {error}
          </div>
        )}
      </section>
    </div>
  )
}

export default WorkEnergyPower