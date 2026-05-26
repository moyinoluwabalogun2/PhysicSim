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
import NewtonControls from '../components/NewtonControls'
import NewtonCanvas from '../components/NewtonKonvaCanvas'
import NewtonOutputPanel from '../components/NewtonOutputPanel'
import { calculateNewtonLaw } from '../services/api'
import '../styles/newton.css'

const DEFAULT_PARAMS = {
  lawType: 'first',
  scenarioPreset: 'ice',
  mass: 5,
  appliedForce: 20,
  frictionCoefficient: 0.02,
  gravity: 9.81,
  time: 5,
  initialVelocity: 10,
  frictionEnabled: false,
  massA: 5,
  massB: 8,
  interactionForce: 20,
  interactionTime: 2
}

const NewtonsLaws = () => {
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  const [lawType, setLawType] = useState('first')
  const [isControlsOpen, setIsControlsOpen] = useState(true)
  const [isResultsOpen, setIsResultsOpen] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)

  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

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
    setIsResultsOpen(false)

    if (canvasRef.current?.resetAnimation) {
      canvasRef.current.resetAnimation()
    }
  }, [])

  const applyPreset = useCallback((nextLaw, preset) => {
    if (nextLaw === 'first') {
      if (preset === 'ice') {
        return {
          lawType: 'first',
          scenarioPreset: 'ice',
          mass: 5,
          gravity: 9.81,
          time: 5,
          initialVelocity: 12,
          frictionEnabled: false,
          frictionCoefficient: 0.0
        }
      }

      if (preset === 'rough-floor') {
        return {
          lawType: 'first',
          scenarioPreset: 'rough-floor',
          mass: 6,
          gravity: 9.81,
          time: 5,
          initialVelocity: 10,
          frictionEnabled: true,
          frictionCoefficient: 0.35
        }
      }

      if (preset === 'moving-stop') {
        return {
          lawType: 'first',
          scenarioPreset: 'moving-stop',
          mass: 5,
          gravity: 9.81,
          time: 5,
          initialVelocity: 15,
          frictionEnabled: true,
          frictionCoefficient: 0.28
        }
      }

      return {
        lawType: 'first',
        scenarioPreset: 'trolley',
        mass: 4,
        gravity: 9.81,
        time: 5,
        initialVelocity: 8,
        frictionEnabled: true,
        frictionCoefficient: 0.12
      }
    }

    if (nextLaw === 'second') {
      if (preset === 'cart-push') {
        return {
          lawType: 'second',
          scenarioPreset: 'cart-push',
          mass: 5,
          appliedForce: 30,
          frictionCoefficient: 0.08,
          gravity: 9.81,
          time: 5
        }
      }

      if (preset === 'heavy-crate') {
        return {
          lawType: 'second',
          scenarioPreset: 'heavy-crate',
          mass: 12,
          appliedForce: 36,
          frictionCoefficient: 0.18,
          gravity: 9.81,
          time: 5
        }
      }

      return {
        lawType: 'second',
        scenarioPreset: 'sled',
        mass: 6,
        appliedForce: 24,
        frictionCoefficient: 0.04,
        gravity: 9.81,
        time: 5
      }
    }

    if (preset === 'gun-recoil') {
      return {
        lawType: 'third',
        scenarioPreset: 'gun-recoil',
        massA: 8,
        massB: 1,
        interactionForce: 24,
        interactionTime: 2.2
      }
    }

    if (preset === 'wall-push') {
      return {
        lawType: 'third',
        scenarioPreset: 'wall-push',
        massA: 6,
        massB: 1000,
        interactionForce: 24,
        interactionTime: 2.2
      }
    }

    if (preset === 'jump-board') {
      return {
        lawType: 'third',
        scenarioPreset: 'jump-board',
        massA: 5,
        massB: 12,
        interactionForce: 20,
        interactionTime: 1.8
      }
    }

    return {
      lawType: 'third',
      scenarioPreset: 'skaters',
      massA: 6,
      massB: 6,
      interactionForce: 24,
      interactionTime: 2.2
    }
  }, [])

  const handleLawChange = useCallback(
    (nextLaw) => {
      setLawType(nextLaw)

      const firstPreset =
        nextLaw === 'first'
          ? 'ice'
          : nextLaw === 'second'
            ? 'cart-push'
            : 'gun-recoil'

      const presetValues = applyPreset(nextLaw, firstPreset)

      setParams((prev) => ({
        ...prev,
        ...presetValues
      }))

      clearSimulation()
    },
    [applyPreset, clearSimulation]
  )

  const handlePresetChange = useCallback(
    (preset) => {
      const presetValues = applyPreset(lawType, preset)
      setParams((prev) => ({
        ...prev,
        ...presetValues
      }))
      clearSimulation()
    },
    [lawType, applyPreset, clearSimulation]
  )

  const handleParamChange = useCallback(
    (newParams) => {
      setParams((prev) => ({
        ...prev,
        ...newParams,
        lawType
      }))
      clearSimulation()
    },
    [clearSimulation, lawType]
  )

  const handleCanvasParamChange = useCallback(
    (newParams) => {
      setParams((prev) => ({
        ...prev,
        ...newParams,
        lawType
      }))
    },
    [lawType]
  )

  const handleAnimationComplete = useCallback(() => {
    setIsResultsOpen(true)
    setIsPlaying(false)
  }, [])

  const handleCalculate = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setIsControlsOpen(false)
    setIsResultsOpen(false)
    setIsPlaying(true)

    try {
      const response = await calculateNewtonLaw({
        ...params,
        lawType
      })
      setResults(response)
    } catch (err) {
      setError(err.message || 'Failed to calculate Newton simulation')
      setIsResultsOpen(true)
      setIsControlsOpen(true)
      setIsPlaying(false)
    } finally {
      setIsLoading(false)
    }
  }, [params, lawType])

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
    canvasRef.current?.restartAnimation?.()
    setIsPlaying(true)
  }, [results])

  const handleReset = useCallback(() => {
    setLawType('first')
    setParams(DEFAULT_PARAMS)
    setResults(null)
    setError(null)
    setIsControlsOpen(true)
    setIsResultsOpen(true)
    setIsPlaying(true)
    canvasRef.current?.resetAnimation?.()
  }, [])

  return (
    <div className="newton-container">
      <div className="newton-background-effects">
        <span className="newton-orb orb-red"></span>
        <span className="newton-orb orb-blue"></span>
        <span className="newton-grid"></span>
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
          <h1>Newton&apos;s Laws</h1>
          <p>
            Learn how pushes, friction, and reactions affect motion using simple,
            visual real-life scenes.
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
          <NewtonCanvas
            key={`${lawType}-${params.scenarioPreset}`}
            ref={canvasRef}
            lawType={lawType}
            params={params}
            results={results}
            width={canvasSize.width}
            height={canvasSize.height}
            onParamChange={handleCanvasParamChange}
            onAnimationComplete={handleAnimationComplete}
          />
        </div>

        <aside
          className={`floating-controls drawer-panel ${
            isControlsOpen ? 'open' : 'closed'
          }`}
        >
          <NewtonControls
            lawType={lawType}
            params={params}
            onLawChange={handleLawChange}
            onPresetChange={handlePresetChange}
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
          <NewtonOutputPanel
            lawType={lawType}
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

export default NewtonsLaws