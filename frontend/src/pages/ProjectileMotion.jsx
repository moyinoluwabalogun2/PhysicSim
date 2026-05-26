import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react'

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

import Controls from '../components/Controls'

import CanvasArea from '../components/CanvasArea'

import OutputPanel from '../components/OutputPanel'

import { calculateProjectile } from '../services/api'

import '../styles/projectile.css'



const OBJECT_PRESETS = {

  cannonball: { key: 'cannonball', label: 'Cannonball', mass: 5, diameter: 0.2, dragCoefficient: 0.47 },

  golfBall: { key: 'golfBall', label: 'Golf Ball', mass: 0.046, diameter: 0.043, dragCoefficient: 0.25 },

  tennisBall: { key: 'tennisBall', label: 'Tennis Ball', mass: 0.058, diameter: 0.067, dragCoefficient: 0.55 },

  pumpkin: { key: 'pumpkin', label: 'Pumpkin', mass: 4, diameter: 0.3, dragCoefficient: 0.6 },

  bowlingBall: { key: 'bowlingBall', label: 'Bowling Ball', mass: 7, diameter: 0.218, dragCoefficient: 0.47 }

}



const TAB_OPTIONS = [

  { key: 'intro', label: 'Intro' },

  { key: 'vectors', label: 'Vectors' },

  { key: 'drag', label: 'Drag' },

  { key: 'lab', label: 'Lab' }

]



const DEFAULT_OBJECT_KEY = 'cannonball'



const getDefaultParams = () => ({

  angle: 45,

  velocity: 20,

  gravity: 9.81,

  initialHeight: 0,

  airResistance: false,

  objectType: DEFAULT_OBJECT_KEY,

  mass: OBJECT_PRESETS[DEFAULT_OBJECT_KEY].mass,

  diameter: OBJECT_PRESETS[DEFAULT_OBJECT_KEY].diameter,

  dragCoefficient: OBJECT_PRESETS[DEFAULT_OBJECT_KEY].dragCoefficient,

  showVelocityVector: false,

  showAccelerationVector: false,

  showComponentVectors: false,

  compareIdealPath: false

})



const ProjectileMotion = () => {

  const navigate = useNavigate()

  const canvasRef = useRef(null)



  const [activeTab, setActiveTab] = useState('intro')

  const [isControlsOpen, setIsControlsOpen] = useState(true)

  const [isResultsOpen, setIsResultsOpen] = useState(true)

  const [isPlaying, setIsPlaying] = useState(true)

  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 700 })

  const [params, setParams] = useState(getDefaultParams)

  const [results, setResults] = useState(null)

  const [trajectoryPoints, setTrajectoryPoints] = useState([])

  const [idealTrajectoryPoints, setIdealTrajectoryPoints] = useState([])

  const [isLoading, setIsLoading] = useState(false)

  const [error, setError] = useState(null)



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



  const objectOptions = useMemo(() => Object.values(OBJECT_PRESETS), [])



  const clearSimulation = useCallback(() => {

    setResults(null)

    setTrajectoryPoints([])

    setIdealTrajectoryPoints([])

    setError(null)

    setIsResultsOpen(false)

    setIsPlaying(true)

    canvasRef.current?.resetAnimation?.()

  }, [])



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

      const response = await calculateProjectile(params)

      setResults(response)

      setTrajectoryPoints(response.points || [])



      if (params.compareIdealPath && params.airResistance) {

        const idealResponse = await calculateProjectile({ ...params, airResistance: false })

        setIdealTrajectoryPoints(idealResponse.points || [])

      } else {

        setIdealTrajectoryPoints([])

      }

    } catch (err) {

      setError(err.message || 'Failed to calculate trajectory')

      setIsResultsOpen(true)

      setIsControlsOpen(true)

    } finally {

      setIsLoading(false)

    }

  }, [params])



  const handleParamChange = useCallback(

    (newParams) => {

      setParams((prev) => ({ ...prev, ...newParams }))

      clearSimulation()

    },

    [clearSimulation]

  )



  const handleCanvasParamChange = useCallback((newParams) => {

    setParams((prev) => ({ ...prev, ...newParams }))

  }, [])



  const handleObjectChange = useCallback(

    (objectKey) => {

      const selectedObject = OBJECT_PRESETS[objectKey]

      if (!selectedObject) return



      setParams((prev) => ({

        ...prev,

        objectType: selectedObject.key,

        mass: selectedObject.mass,

        diameter: selectedObject.diameter,

        dragCoefficient: selectedObject.dragCoefficient

      }))



      clearSimulation()

    },

    [clearSimulation]

  )



  const handleTabChange = useCallback(

    (tabKey) => {

      setActiveTab(tabKey)



      setParams((prev) => {

        if (tabKey === 'intro') {

          return {

            ...prev,

            showVelocityVector: false,

            showAccelerationVector: false,

            showComponentVectors: false,

            compareIdealPath: false

          }

        }



        if (tabKey === 'vectors') {

          return {

            ...prev,

            showVelocityVector: true,

            showAccelerationVector: true

          }

        }



        if (tabKey === 'drag') {

          return {

            ...prev,

            airResistance: true

          }

        }



        return prev

      })



      clearSimulation()

    },

    [clearSimulation]

  )



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

    setActiveTab('intro')

    setParams(getDefaultParams())

    setResults(null)

    setTrajectoryPoints([])

    setIdealTrajectoryPoints([])

    setError(null)

    setIsControlsOpen(true)

    setIsResultsOpen(true)

    setIsPlaying(true)

    canvasRef.current?.resetAnimation?.()

  }, [])



  const selectedObject = OBJECT_PRESETS[params.objectType]



  return (

    <div className="projectile-container">

      <div className="projectile-background-effects">

        <span className="projectile-orb orb-blue"></span>

        <span className="projectile-orb orb-purple"></span>

        <span className="projectile-grid"></span>

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

          <h1>Projectile Motion</h1>

          <p>

            Explore launch angle, velocity, height, gravity, air resistance, and

            object type through clear real-world projectile scenes.

          </p>

        </div>



        <div className="header-actions">

          <button type="button" className="header-toggle-btn" onClick={() => setIsResultsOpen((prev) => !prev)}>

            <BarChart3 size={16} />

            <span>{isResultsOpen ? 'Hide Results' : 'Show Results'}</span>

          </button>



          <button type="button" className="header-toggle-btn" onClick={() => setIsControlsOpen((prev) => !prev)}>

            {isControlsOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}

            <span>{isControlsOpen ? 'Hide Controls' : 'Show Controls'}</span>

          </button>



          <button type="button" className="header-toggle-btn" onClick={handlePlayPause} disabled={!results}>

            {isPlaying ? <Pause size={16} /> : <Play size={16} />}

            <span>{isPlaying ? 'Pause' : 'Play'}</span>

          </button>



          <button type="button" className="header-toggle-btn" onClick={handleReplay} disabled={!results}>

            <RotateCcw size={16} />

            <span>Replay</span>

          </button>

        </div>

      </header>



      <section className="simulation-stage">

        <div className="simulation-canvas-shell">

          <CanvasArea

            key={`${params.objectType}-${activeTab}`}

            ref={canvasRef}

            trajectoryPoints={trajectoryPoints}

            idealTrajectoryPoints={idealTrajectoryPoints}

            params={params}

            activeTab={activeTab}

            selectedObject={selectedObject}

            width={canvasSize.width}

            height={canvasSize.height}

            onAnimationComplete={handleAnimationComplete}

            onParamChange={handleCanvasParamChange}

          />

        </div>



        <aside className={`floating-controls drawer-panel ${isControlsOpen ? 'open' : 'closed'}`}>

          <Controls

            params={params}

            activeTab={activeTab}

            tabs={TAB_OPTIONS}

            objectOptions={objectOptions}

            onTabChange={handleTabChange}

            onObjectChange={handleObjectChange}

            onParamChange={handleParamChange}

            onCalculate={handleCalculate}

            onReset={handleReset}

            isLoading={isLoading}

          />

        </aside>



        <aside className={`floating-results results-panel ${isResultsOpen ? 'open' : 'closed'}`}>

          <OutputPanel

            results={results}

            params={params}

            activeTab={activeTab}

            selectedObject={selectedObject}

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



export default ProjectileMotion