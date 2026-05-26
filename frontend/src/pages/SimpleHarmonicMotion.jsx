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
import SHMControls from '../components/SHMControls'
import SHMCanvas from '../components/SHMCanvas'
import SHMOutputPanel from '../components/SHMOutputPanel'
import { calculateSHM } from '../services/api'
import '../styles/shm.css'

const DEFAULT_PARAMS = {
  mode: 'spring',
  mass: 2,
  springConstant: 20,
  amplitude: 1,
  gravity: 9.81,
  length: 2,
  initialAngle: 20
}

const SimpleHarmonicMotion = () => {
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  const [mode, setMode] = useState('spring')
  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isControlsOpen, setIsControlsOpen] = useState(true)
  const [isResultsOpen, setIsResultsOpen] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)

  const [canvasSize, setCanvasSize] = useState({
    width: 1200,
    height: 700
  })

  useEffect(() => {
    const updateSize = () => {
      const mobile = window.innerWidth < 768
      const width = Math.min(1200, window.innerWidth - (mobile ? 24 : 80))
      const height = mobile ? 500 : 700

      setCanvasSize({
        width: Math.max(320, width),
        height
      })
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const clearSimulation = useCallback(() => {
    setResults(null)
    setError(null)
    setIsPlaying(true)
    canvasRef.current?.resetAnimation?.()
  }, [])

  const applyModeDefaults = useCallback((nextMode) => {
    if (nextMode === 'spring') {
      return {
        mode: 'spring',
        mass: 2,
        springConstant: 20,
        amplitude: 1,
        gravity: 9.81,
        length: 2,
        initialAngle: 20
      }
    }

    if (nextMode === 'pendulum') {
      return {
        mode: 'pendulum',
        mass: 2,
        springConstant: 20,
        amplitude: 1,
        gravity: 9.81,
        length: 2,
        initialAngle: 20
      }
    }

    return {
      mode: 'horizontal',
      mass: 2,
      springConstant: 20,
      amplitude: 1,
      gravity: 9.81,
      length: 2,
      initialAngle: 20
    }
  }, [])

  const handleModeChange = useCallback(
    (nextMode) => {
      setMode(nextMode)
      setParams((prev) => ({
        ...prev,
        ...applyModeDefaults(nextMode)
      }))
      clearSimulation()
    },
    [applyModeDefaults, clearSimulation]
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
    [mode, clearSimulation]
  )

  const handleCanvasParamChange = useCallback(
    (newParams) => {
      setParams((prev) => ({
        ...prev,
        ...newParams,
        mode
      }))
    },
    [mode]
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
      const response = await calculateSHM({
        ...params,
        mode
      })
      setResults(response)
    } catch (err) {
      setError(err.message || 'Failed to calculate SHM simulation')
      setIsControlsOpen(true)
      setIsResultsOpen(true)
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
    canvasRef.current?.restartAnimation?.()
    setIsPlaying(true)
    setIsResultsOpen(false)
  }, [results])

  const handleReset = useCallback(() => {
    setMode('spring')
    setParams(DEFAULT_PARAMS)
    setResults(null)
    setError(null)
    setIsControlsOpen(true)
    setIsResultsOpen(true)
    setIsPlaying(true)
    canvasRef.current?.resetAnimation?.()
  }, [])

  return (
    <div className="shm-container">
      <div className="shm-background-effects">
        <span className="shm-orb orb-purple"></span>
        <span className="shm-orb orb-cyan"></span>
        <span className="shm-grid"></span>
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
          <h1>Simple Harmonic Motion</h1>
          <p>
            Explore oscillations using a spring-mass system, a pendulum, and a
            horizontal oscillator with clear motion and results.
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
          <SHMCanvas
            ref={canvasRef}
            mode={mode}
            params={params}
            results={results}
            width={canvasSize.width}
            height={canvasSize.height}
            onAnimationComplete={handleAnimationComplete}
            onParamChange={handleCanvasParamChange}
          />
        </div>

        <aside
          className={`floating-controls drawer-panel ${
            isControlsOpen ? 'open' : 'closed'
          }`}
        >
          <SHMControls
            mode={mode}
            params={params}
            onModeChange={handleModeChange}
            onParamChange={handleParamChange}
            onCalculate={handleCalculate}
            onReset={handleReset}
            isLoading={isLoading}
          />
        </aside>

        <aside
          className={`floating-results results-panel ${
            isResultsOpen ? 'open' : 'closed'
          }`}
        >
          <SHMOutputPanel
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

export default SimpleHarmonicMotion