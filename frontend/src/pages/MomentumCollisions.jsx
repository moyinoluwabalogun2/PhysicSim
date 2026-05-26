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
import MomentumControls from '../components/MomentumControls'
import MomentumCanvas from '../components/MomentumCanvas'
import MomentumOutputPanel from '../components/MomentumOutputPanel'
import { calculateMomentumCollision } from '../services/api'
import '../styles/momentum.css'

const DEFAULT_PARAMS = {
  mode: 'momentum',
  scenario: 'shopping-cart',
  mass1: 12,
  velocity1: 5,
  mass2: 0,
  velocity2: 0,
  collisionType: 'elastic'
}

const MomentumCollisions = () => {
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  const [mode, setMode] = useState('momentum')
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
    setIsResultsOpen(false)
    setIsPlaying(true)
    canvasRef.current?.resetAnimation?.()
  }, [])

  const applyModeDefaults = useCallback((nextMode, scenario) => {
    if (nextMode === 'momentum') {
      if (scenario === 'bowling-ball') {
        return {
          mode: 'momentum',
          scenario: 'bowling-ball',
          mass1: 7,
          velocity1: 8,
          mass2: 0,
          velocity2: 0,
          collisionType: 'elastic'
        }
      }

      if (scenario === 'moving-trolley') {
        return {
          mode: 'momentum',
          scenario: 'moving-trolley',
          mass1: 18,
          velocity1: 4,
          mass2: 0,
          velocity2: 0,
          collisionType: 'elastic'
        }
      }

      return {
        mode: 'momentum',
        scenario: 'shopping-cart',
        mass1: 12,
        velocity1: 5,
        mass2: 0,
        velocity2: 0,
        collisionType: 'elastic'
      }
    }

    if (nextMode === 'collision') {
      if (scenario === 'bumper-cars') {
        return {
          mode: 'collision',
          scenario: 'bumper-cars',
          mass1: 12,
          velocity1: 5,
          mass2: 10,
          velocity2: -3,
          collisionType: 'elastic'
        }
      }

      return {
        mode: 'collision',
        scenario: 'two-trolleys',
        mass1: 15,
        velocity1: 5,
        mass2: 12,
        velocity2: -2,
        collisionType: 'elastic'
      }
    }

    if (scenario === 'skater-push') {
      return {
        mode: 'recoil',
        scenario: 'skater-push',
        mass1: 60,
        velocity1: 0,
        mass2: 50,
        velocity2: 0,
        collisionType: 'elastic'
      }
    }

    if (scenario === 'cannon-recoil') {
      return {
        mode: 'recoil',
        scenario: 'cannon-recoil',
        mass1: 120,
        velocity1: 0,
        mass2: 5,
        velocity2: 0,
        collisionType: 'elastic'
      }
    }

    return {
      mode: 'recoil',
      scenario: 'gun-recoil',
      mass1: 4,
      velocity1: 0,
      mass2: 0.05,
      velocity2: 0,
      collisionType: 'elastic'
    }
  }, [])

  const handleModeChange = useCallback(
    (nextMode) => {
      const firstScenario =
        nextMode === 'momentum'
          ? 'shopping-cart'
          : nextMode === 'collision'
            ? 'bumper-cars'
            : 'gun-recoil'

      setMode(nextMode)
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
    [mode, applyModeDefaults, clearSimulation]
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
      setResults(null)
      setError(null)
      setIsResultsOpen(false)
      setIsPlaying(true)
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

    canvasRef.current?.resetAnimation?.()
    setResults(null)

    try {
      const response = await calculateMomentumCollision({
        ...params,
        mode
      })

      requestAnimationFrame(() => {
        setResults(response)
      })
    } catch (err) {
      setError(err.message || 'Failed to calculate Momentum & Collisions simulation')
      setIsControlsOpen(true)
      setIsResultsOpen(true)
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
    setMode('momentum')
    setParams(DEFAULT_PARAMS)
    setResults(null)
    setError(null)
    setIsControlsOpen(true)
    setIsResultsOpen(true)
    setIsPlaying(true)
    canvasRef.current?.resetAnimation?.()
  }, [])

  const canvasKey = [
    mode,
    params.scenario,
    params.collisionType,
    params.mass1,
    params.velocity1,
    params.mass2,
    params.velocity2
  ].join('-')

  return (
    <div className="momentum-container">
      <div className="momentum-background-effects">
        <span className="momentum-orb orb-orange"></span>
        <span className="momentum-orb orb-cyan"></span>
        <span className="momentum-grid"></span>
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
          <h1>Momentum &amp; Collisions</h1>
          <p>
            Explore moving objects, front-to-front collisions, and recoil with
            clear labels, realistic motion, and simple visual explanations.
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
          <MomentumCanvas
            key={canvasKey}
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

        <aside className={`floating-controls drawer-panel ${isControlsOpen ? 'open' : 'closed'}`}>
          <MomentumControls
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
          <MomentumOutputPanel
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

export default MomentumCollisions