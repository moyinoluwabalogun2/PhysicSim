import React, {

  forwardRef,

  useCallback,

  useEffect,

  useImperativeHandle,

  useMemo,

  useRef,

  useState

} from 'react'

import {

  Stage,

  Layer,

  Rect,

  Circle,

  Line,

  Arrow,

  Text,

  Group,

  Ellipse,

  RegularPolygon

} from 'react-konva'



const clamp = (value, min, max) => Math.min(max, Math.max(min, value))



const PLAYBACK_MS_BY_LAW = {

  first: 7000,

  second: 7200,

  third: 7200

}



const DEFAULT_VISUAL_DROPS = {

  roughPatchX: null,

  stopperX: null,

  weightOnSingle: 0,

  helperPush: false,

  frictionStripX: null,

  massAExtra: 0,

  massBExtra: 0,

  recoilBoost: false

}



const formatMeters = (value) => {

  if (value >= 20) return `${Math.round(value)} m`

  return `${value.toFixed(1)} m`

}



const isInsideRect = (x, y, rect) => {

  if (!rect) return false

  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height

}



const getMassScale = (mass = 5, min = 0.85, max = 1.55) => {

  const scale = 0.78 + Math.sqrt(Math.max(mass, 1)) / 13

  return clamp(scale, min, max)

}



const SimpleLabel = ({ x, y, text, width = 180, fill = 'rgba(255,255,255,0.86)' }) => (

  <Group x={x} y={y}>

    <Rect width={width} height={36} fill={fill} cornerRadius={12} stroke="rgba(15,23,42,0.10)" />

    <Text x={10} y={9} width={width - 20} text={text} fontSize={12} fontStyle="bold" fill="#0f172a" />

  </Group>

)



const Cloud = ({ x, y, scale = 1, opacity = 0.92 }) => (

  <Group x={x} y={y} scaleX={scale} scaleY={scale} opacity={opacity}>

    <Circle x={0} y={0} radius={22} fill="#ffffff" />

    <Circle x={24} y={-8} radius={28} fill="#ffffff" />

    <Circle x={58} y={0} radius={22} fill="#ffffff" />

    <Ellipse x={30} y={10} radiusX={50} radiusY={18} fill="#ffffff" />

  </Group>

)



const SkyScene = ({ width, groundY }) => (

  <>

    <Rect x={0} y={0} width={width} height={groundY} fill="#bfe7ff" />

    <Circle x={width - 110} y={90} radius={34} fill="rgba(255, 221, 87, 0.95)" />

    <Circle x={width - 110} y={90} radius={52} fill="rgba(255, 221, 87, 0.18)" />

    <Cloud x={90} y={88} scale={1.05} opacity={0.96} />

    <Cloud x={250} y={128} scale={0.88} opacity={0.84} />

    <Cloud x={470} y={82} scale={1.15} opacity={0.92} />

    <Cloud x={690} y={118} scale={0.92} opacity={0.86} />

    <Cloud x={920} y={76} scale={1.08} opacity={0.94} />

  </>

)



const IceGround = ({ width, groundY, height, sceneShift = 0 }) => (

  <Group x={sceneShift} y={0}>

    <Rect x={-width * 2} y={groundY} width={width * 5} height={height - groundY} fill="#dff7ff" />

    {Array.from({ length: 80 }).map((_, i) => (

      <Line

        key={`ice-shine-${i}`}

        points={[-width * 2 + i * 78, groundY + 10, -width * 2 + i * 78 + 52, groundY + 24]}

        stroke="rgba(59,130,246,0.22)"

        strokeWidth={3}

      />

    ))}

    {Array.from({ length: 60 }).map((_, i) => (

      <Line

        key={`ice-crack-${i}`}

        points={[

          -width * 2 + 40 + i * 86,

          groundY + 28,

          -width * 2 + 58 + i * 86,

          groundY + 18,

          -width * 2 + 72 + i * 86,

          groundY + 30

        ]}

        stroke="rgba(148,163,184,0.28)"

        strokeWidth={2}

        lineCap="round"

      />

    ))}

  </Group>

)



const RoughGround = ({ width, groundY, height, sceneShift = 0 }) => (

  <Group x={sceneShift} y={0}>

    <Rect x={-width * 2} y={groundY} width={width * 5} height={height - groundY} fill="#8b5a2b" />

    {Array.from({ length: 180 }).map((_, i) => (

      <Line

        key={`rough-${i}`}

        points={[

          -width * 2 + i * 30,

          groundY + 4 + (i % 3) * 5,

          -width * 2 + i * 30 + 14,

          groundY + 10 + (i % 4) * 4

        ]}

        stroke="rgba(60,30,10,0.34)"

        strokeWidth={2}

      />

    ))}

    {Array.from({ length: 90 }).map((_, i) => (

      <Circle

        key={`stone-${i}`}

        x={-width * 2 + 28 + i * 52}

        y={groundY + 30 + (i % 3) * 6}

        radius={3 + (i % 3)}

        fill="rgba(85,55,25,0.42)"

      />

    ))}

  </Group>

)



const RoadGround = ({ width, groundY, height, roadOffset }) => (

  <>

    <Rect x={0} y={groundY} width={width} height={height - groundY} fill="#6b8e23" />

    <Group x={roadOffset} y={0}>

      <Rect x={-width * 2} y={groundY + 8} width={width * 5} height={height - groundY - 8} fill="#2f2f2f" />

      <Rect x={-width * 2} y={groundY + 8} width={width * 5} height={5} fill="rgba(255,255,255,0.15)" />

      {Array.from({ length: 90 }).map((_, i) => {

        const x = -width * 2 + i * 70

        return (

          <Rect

            key={`lane-${i}`}

            x={x}

            y={groundY + 44}

            width={36}

            height={6}

            fill="#f8fafc"

            opacity={0.75}

            cornerRadius={3}

          />

        )

      })}

    </Group>

  </>

)



const ForceArrow = ({ points, color, label, visible = true }) => {

  if (!visible) return null

  const [x1, y1, x2, y2] = points



  return (

    <>

      <Arrow

        points={[x1, y1, x2, y2]}

        pointerLength={11}

        pointerWidth={11}

        fill={color}

        stroke={color}

        strokeWidth={4}

      />

      <Text

        x={(x1 + x2) / 2 + 6}

        y={(y1 + y2) / 2 - 18}

        text={label}

        fontSize={13}

        fontStyle="bold"

        fill={color}

      />

    </>

  )

}



const Person = ({ x, y, color = '#22c55e', label = '', armToX = null, pose = 'push' }) => (

  <Group x={x} y={y}>

    <Circle x={0} y={0} radius={12} fill={color} />

    <Rect x={-9} y={14} width={18} height={38} fill={color} cornerRadius={4} />



    <Line points={[-4, 52, -15, 80]} stroke={color} strokeWidth={5} lineCap="round" />

    <Line points={[4, 52, 16, 78]} stroke={color} strokeWidth={5} lineCap="round" />



    {pose === 'push' && armToX !== null && (

      <Line points={[8, 24, armToX - x, 24]} stroke={color} strokeWidth={5} lineCap="round" />

    )}



    {pose === 'recoil' && (

      <>

        <Line points={[-7, 24, -28, 12]} stroke={color} strokeWidth={5} lineCap="round" />

        <Line points={[8, 24, 34, 20]} stroke={color} strokeWidth={5} lineCap="round" />

      </>

    )}



    {label ? (

      <Text x={-34} y={88} width={68} align="center" text={label} fontSize={13} fontStyle="bold" fill="#0f172a" />

    ) : null}

  </Group>

)



const BoxObject = ({ x, y, fill, label, mass = 5 }) => {

  const scale = getMassScale(mass)

  return (

    <Group x={x} y={y - (scale - 1) * 32} scaleX={scale} scaleY={scale}>

      <Rect

        width={110}

        height={60}

        fill={fill}

        cornerRadius={8}

        shadowBlur={6}

        shadowOpacity={0.15}

        stroke="rgba(15,23,42,0.15)"

        strokeWidth={2}

      />

      <Text x={0} y={18} width={110} align="center" text={label} fontSize={18} fontStyle="bold" fill="#ffffff" />

    </Group>

  )

}



const TrolleyObject = ({ x, y, mass = 5 }) => {

  const scale = getMassScale(mass)

  return (

    <Group x={x} y={y - (scale - 1) * 26} scaleX={scale} scaleY={scale}>

      <Rect width={110} height={44} y={8} fill="#14b8a6" cornerRadius={8} stroke="#0f766e" strokeWidth={2} />

      <Line points={[10, 8, 24, -8, 96, -8, 104, 8]} stroke="#0f766e" strokeWidth={3} />

      <Circle x={24} y={58} radius={9} fill="#1f2937" />

      <Circle x={86} y={58} radius={9} fill="#1f2937" />

      <Circle x={24} y={58} radius={4} fill="#94a3b8" />

      <Circle x={86} y={58} radius={4} fill="#94a3b8" />

      <Text x={0} y={18} width={110} align="center" text="Trolley" fontSize={16} fontStyle="bold" fill="#ffffff" />

    </Group>

  )

}



const CartObject = ({ x, y, mass = 5 }) => {

  const scale = getMassScale(mass)

  return (

    <Group x={x} y={y - (scale - 1) * 26} scaleX={scale} scaleY={scale}>

      <Rect width={110} height={42} y={10} fill="#f59e0b" cornerRadius={8} stroke="#b45309" strokeWidth={2} />

      <Line points={[8, 10, 26, -10, 102, -10]} stroke="#b45309" strokeWidth={3} />

      <Circle x={24} y={56} radius={9} fill="#1f2937" />

      <Circle x={86} y={56} radius={9} fill="#1f2937" />

      <Circle x={24} y={56} radius={4} fill="#94a3b8" />

      <Circle x={86} y={56} radius={4} fill="#94a3b8" />

      <Text x={0} y={20} width={110} align="center" text="Cart" fontSize={16} fontStyle="bold" fill="#ffffff" />

    </Group>

  )

}



const CrateObject = ({ x, y, mass = 10 }) => {

  const scale = getMassScale(mass, 0.9, 1.75)

  return (

    <Group x={x} y={y - (scale - 1) * 34} scaleX={scale} scaleY={scale}>

      <Rect width={110} height={60} fill="#7c3aed" cornerRadius={6} stroke="#5b21b6" strokeWidth={2} />

      <Line points={[8, 12, 102, 12]} stroke="#c4b5fd" strokeWidth={2} opacity={0.45} />

      <Line points={[8, 30, 102, 30]} stroke="#c4b5fd" strokeWidth={2} opacity={0.45} />

      <Line points={[8, 48, 102, 48]} stroke="#c4b5fd" strokeWidth={2} opacity={0.45} />

      <Text x={0} y={18} width={110} align="center" text="Crate" fontSize={17} fontStyle="bold" fill="#ffffff" />

    </Group>

  )

}



const SledObject = ({ x, y, mass = 5 }) => {

  const scale = getMassScale(mass)

  return (

    <Group x={x} y={y - (scale - 1) * 22} scaleX={scale} scaleY={scale}>

      <Rect width={110} height={28} y={14} fill="#06b6d4" cornerRadius={10} stroke="#0e7490" strokeWidth={2} />

      <Line points={[10, 46, 100, 46]} stroke="#475569" strokeWidth={4} lineCap="round" />

      <Line points={[14, 46, 4, 52]} stroke="#475569" strokeWidth={3} lineCap="round" />

      <Line points={[96, 46, 106, 52]} stroke="#475569" strokeWidth={3} lineCap="round" />

      <Text x={0} y={16} width={110} align="center" text="Sled" fontSize={16} fontStyle="bold" fill="#ffffff" />

    </Group>

  )

}



const JumpBoardObject = ({ x, y }) => (

  <Group x={x} y={y}>

    <Rect width={90} height={10} fill="#f59e0b" cornerRadius={4} />

    <Rect x={8} y={10} width={6} height={12} fill="#92400e" />

    <Rect x={76} y={10} width={6} height={12} fill="#92400e" />

  </Group>

)



const GunShooter = ({ x, y, recoil = false }) => (

  <Group x={x} y={y}>

    <Person x={0} y={0} color="#2563eb" pose={recoil ? 'recoil' : 'push'} />

    <Rect x={18} y={18} width={38} height={8} fill="#374151" cornerRadius={2} />

    <Rect x={52} y={16} width={22} height={4} fill="#4b5563" cornerRadius={2} />

  </Group>

)



const DragHandle = ({ x, y, text, onDragMove, onDragEnd, disabled }) => (

  <Group

    x={x}

    y={y}

    draggable={!disabled}

    dragBoundFunc={(pos) => ({ x: clamp(pos.x, 120, 390), y })}

    onDragMove={onDragMove}

    onDragEnd={onDragEnd}

  >

    <Rect width={132} height={36} fill="#facc15" cornerRadius={12} shadowBlur={6} shadowOpacity={0.18} />

    <Text

      x={0}

      y={10}

      width={132}

      align="center"

      text={text}

      fontSize={14}

      fontStyle="bold"

      fill="#1f2937"

    />

  </Group>

)



const PaletteItem = ({ x, y, label, color, itemId, onDrop }) => (

  <Group

    x={x}

    y={y}

    draggable

    onDragEnd={(e) => {

      onDrop(itemId, e.target.x(), e.target.y())

      e.target.position({ x, y })

    }}

  >

    <Rect width={84} height={32} fill={color} cornerRadius={10} shadowBlur={4} shadowOpacity={0.16} />

    <Text x={0} y={8} width={84} align="center" text={label} fontSize={12} fontStyle="bold" fill="#0f172a" />

  </Group>

)



const MeterRule = ({ ticks, groundY, width }) => (

  <>

    <Line points={[70, groundY, width - 70, groundY]} stroke="rgba(0,0,0,0.16)" strokeWidth={2} />

    {ticks.map((tick, i) => (

      <Group key={`meter-${i}`}>

        <Line points={[tick.x, groundY, tick.x, groundY + 12]} stroke="rgba(0,0,0,0.38)" strokeWidth={1.5} />

        <Text x={tick.x - 16} y={groundY + 16} text={tick.label} fontSize={10} fill="rgba(0,0,0,0.62)" />

      </Group>

    ))}

  </>

)



const NewtonKonvaCanvas = forwardRef(function NewtonKonvaCanvas(

  { lawType, params, results, width = 1200, height = 700, onParamChange, onAnimationComplete },

  ref

) {

  const groundY = height - 110

  const animationRef = useRef(null)

  const pausedRef = useRef(false)

  const completedRef = useRef(false)

  const animationStartTimeRef = useRef(null)

  const playbackDurationRef = useRef(PLAYBACK_MS_BY_LAW.first)



  const [frameIndex, setFrameIndex] = useState(0)

  const [dragState, setDragState] = useState(null)

  const [visualDrops, setVisualDrops] = useState(DEFAULT_VISUAL_DROPS)



  const resetVisualDrops = useCallback(() => {

    setVisualDrops(DEFAULT_VISUAL_DROPS)

  }, [])



  const points = useMemo(() => results?.points ?? [], [results])

  const dualPoints = useMemo(() => results?.dual_points ?? [], [results])

  const pointCount = lawType === 'third' ? dualPoints.length : points.length



  const animationProgress = useMemo(() => {

    if (pointCount <= 1) return 0

    return frameIndex / Math.max(pointCount - 1, 1)

  }, [frameIndex, pointCount])



  const currentSinglePoint = useMemo(() => {

    return (

      points[Math.min(frameIndex, Math.max(points.length - 1, 0))] ?? {

        t: 0,

        x: 0,

        v: params.initialVelocity || 0

      }

    )

  }, [points, frameIndex, params.initialVelocity])



  const currentDualPoint = useMemo(() => {

    return (

      dualPoints[Math.min(frameIndex, Math.max(dualPoints.length - 1, 0))] ?? {

        t: 0,

        xA: 0,

        xB: 0,

        vA: 0,

        vB: 0

      }

    )

  }, [dualPoints, frameIndex])



  const getPlaybackDuration = useCallback(() => {

    return PLAYBACK_MS_BY_LAW[lawType] ?? 6500

  }, [lawType])



  const resetAnimation = useCallback(() => {

    if (animationRef.current) {

      cancelAnimationFrame(animationRef.current)

      animationRef.current = null

    }

    pausedRef.current = false

    completedRef.current = false

    animationStartTimeRef.current = null

    setFrameIndex(0)

  }, [])



  const startAnimation = useCallback(() => {

    if (animationRef.current) {

      cancelAnimationFrame(animationRef.current)

      animationRef.current = null

    }



    if (pointCount <= 0) return



    pausedRef.current = false

    completedRef.current = false

    animationStartTimeRef.current = null

    playbackDurationRef.current = getPlaybackDuration()



    const animate = (timestamp) => {

      if (pausedRef.current) return



      if (animationStartTimeRef.current === null) {

        animationStartTimeRef.current = timestamp

      }



      const elapsed = timestamp - animationStartTimeRef.current

      const progress = Math.min(elapsed / playbackDurationRef.current, 1)

      const nextIndex = Math.floor(progress * Math.max(pointCount - 1, 0))



      setFrameIndex(nextIndex)



      if (progress < 1) {

        animationRef.current = requestAnimationFrame(animate)

      } else {

        animationRef.current = null

        if (!completedRef.current) {

          completedRef.current = true

          onAnimationComplete?.()

        }

      }

    }



    animationRef.current = requestAnimationFrame(animate)

  }, [pointCount, onAnimationComplete, getPlaybackDuration])



  useImperativeHandle(

    ref,

    () => ({

      resetAnimation: () => {

        resetAnimation()

        resetVisualDrops()

      },

      pauseAnimation: () => {

        pausedRef.current = true

        if (animationRef.current) {

          cancelAnimationFrame(animationRef.current)

          animationRef.current = null

        }

      },

      resumeAnimation: () => {

        if (pointCount <= 0) return

        if (!pausedRef.current && animationRef.current) return



        pausedRef.current = false

        const currentProgress = pointCount > 1 ? frameIndex / (pointCount - 1) : 0

        animationStartTimeRef.current =

          performance.now() - currentProgress * playbackDurationRef.current



        const animate = (timestamp) => {

          if (pausedRef.current) return



          const elapsed = timestamp - animationStartTimeRef.current

          const progress = Math.min(elapsed / playbackDurationRef.current, 1)

          const nextIndex = Math.floor(progress * Math.max(pointCount - 1, 0))



          setFrameIndex(nextIndex)



          if (progress < 1) {

            animationRef.current = requestAnimationFrame(animate)

          } else {

            animationRef.current = null

            if (!completedRef.current) {

              completedRef.current = true

              onAnimationComplete?.()

            }

          }

        }



        animationRef.current = requestAnimationFrame(animate)

      },

      restartAnimation: () => {

        resetAnimation()

        resetVisualDrops()

        startAnimation()

      }

    }),

    [pointCount, frameIndex, resetAnimation, resetVisualDrops, startAnimation, onAnimationComplete]

  )



  useEffect(() => {

    if (animationRef.current) {

      cancelAnimationFrame(animationRef.current)

      animationRef.current = null

    }



    pausedRef.current = false

    completedRef.current = false

    animationStartTimeRef.current = null



    const id = requestAnimationFrame(() => {

      setFrameIndex(0)

      if (pointCount > 0) {

        startAnimation()

      }

    })



    return () => {

      cancelAnimationFrame(id)

      if (animationRef.current) {

        cancelAnimationFrame(animationRef.current)

        animationRef.current = null

      }

    }

  }, [results, lawType, pointCount, startAnimation])



  const displayDistanceMax = useMemo(() => {

    if (lawType === 'third') return 20

    const maxAbsDistance = Math.max(...points.map((p) => Math.abs(p.x)), 1)

    return Math.max(maxAbsDistance, 10)

  }, [lawType, points])



  const objectTrackStartX = 250

  const objectTrackEndX = Math.max(360, width - 280)

  const objectTrackWidth = objectTrackEndX - objectTrackStartX



  const mapSingleXToCanvas = useCallback(

    (xMeters) => {

      const ratio = Math.abs(xMeters) / displayDistanceMax

      const unclamped = objectTrackStartX + ratio * objectTrackWidth

      return Math.min(unclamped, objectTrackEndX)

    },

    [displayDistanceMax, objectTrackWidth, objectTrackEndX]

  )



  const meterTicks = useMemo(() => {

    const tickCount = 8

    const stepMeters = displayDistanceMax / tickCount



    return Array.from({ length: tickCount + 1 }).map((_, i) => {

      const ratio = i / tickCount

      return {

        x: objectTrackStartX + ratio * (objectTrackEndX - objectTrackStartX),

        label: formatMeters(i * stepMeters)

      }

    })

  }, [objectTrackEndX, displayDistanceMax])



  const singlePreviewX = useMemo(() => {

    if (lawType === 'first' && dragState?.type === 'speed') {

      return objectTrackStartX + dragState.value * 4

    }

    if (lawType === 'second' && dragState?.type === 'force') {

      return objectTrackStartX + dragState.value * 1.5

    }

    return objectTrackStartX

  }, [lawType, dragState])



  const singleX = useMemo(() => {

    if (!points.length) return singlePreviewX

    return mapSingleXToCanvas(currentSinglePoint.x)

  }, [points.length, singlePreviewX, mapSingleXToCanvas, currentSinglePoint.x])



  const groundScrollShift = useMemo(() => {

    if (lawType === 'third') return 0

    if (!points.length) return 0

    const currentRatio = Math.abs(currentSinglePoint.x) / Math.max(displayDistanceMax, 1)

    return -currentRatio * Math.max(displayDistanceMax * 35, 280)

  }, [lawType, points.length, currentSinglePoint.x, displayDistanceMax])



  const roadOffset = useMemo(() => groundScrollShift % 70, [groundScrollShift])



  const thirdScene = useMemo(() => {

    if (params.scenarioPreset === 'wall-push') {

      const wallX = width * 0.76

      const personStartX = width * 0.42

      const contactX = wallX - 44

      const progress = animationProgress



      if (!results || dualPoints.length === 0) {

        return { wallX, personX: personStartX, personStartX, contactX, impactPhase: false }

      }



      const maxA = Math.max(...dualPoints.map((p) => Math.abs(p.xA)), 1)

      const approachPhase = progress < 0.45

      const impactPhase = progress >= 0.45 && progress <= 0.58



      let personX = personStartX



      if (approachPhase) {

        const p = progress / 0.45

        personX = personStartX + (contactX - personStartX) * p

      } else if (impactPhase) {

        personX = contactX

      } else {

        const recoil = (Math.abs(currentDualPoint.xA) / maxA) * 120

        personX = contactX - recoil

      }



      return { wallX, personX, personStartX, contactX, impactPhase }

    }



    if (params.scenarioPreset === 'skaters') {

      const contactCenter = width / 2

      const startAX = contactCenter - 220

      const startBX = contactCenter + 160

      const contactAX = contactCenter - 54

      const contactBX = contactCenter + 8

      const progress = animationProgress



      if (!results || dualPoints.length === 0) {

        return { ax: startAX, bx: startBX, contactCenter, impactPhase: false }

      }



      const maxA = Math.max(...dualPoints.map((p) => Math.abs(p.xA)), 1)

      const maxB = Math.max(...dualPoints.map((p) => Math.abs(p.xB)), 1)

      const approachPhase = progress < 0.5

      const impactPhase = progress >= 0.5 && progress <= 0.58



      let ax = startAX

      let bx = startBX



      if (approachPhase) {

        const p = progress / 0.5

        ax = startAX + (contactAX - startAX) * p

        bx = startBX + (contactBX - startBX) * p

      } else if (impactPhase) {

        ax = contactAX

        bx = contactBX

      } else {

        ax = contactAX - (Math.abs(currentDualPoint.xA) / maxA) * 190

        bx = contactBX + (Math.abs(currentDualPoint.xB) / maxB) * 190

      }



      return { ax, bx, contactCenter, impactPhase }

    }



    if (params.scenarioPreset === 'jump-board') {

      const boardBaseX = width * 0.55

      const jumperStartX = width * 0.42

      const boardContactX = boardBaseX - 18

      const progress = animationProgress



      if (!results || dualPoints.length === 0) {

        return { jumperX: jumperStartX, boardX: boardBaseX, boardContactX, impactPhase: false }

      }



      const maxA = Math.max(...dualPoints.map((p) => Math.abs(p.xA)), 1)

      const maxB = Math.max(...dualPoints.map((p) => Math.abs(p.xB)), 1)

      const approachPhase = progress < 0.45

      const impactPhase = progress >= 0.45 && progress <= 0.56



      let jumperX = jumperStartX

      let boardX = boardBaseX



      if (approachPhase) {

        const p = progress / 0.45

        jumperX = jumperStartX + (boardContactX - jumperStartX) * p

      } else if (impactPhase) {

        jumperX = boardContactX

        boardX = boardBaseX

      } else {

        jumperX = boardContactX + (Math.abs(currentDualPoint.xA) / maxA) * 145

        boardX = boardBaseX - (Math.abs(currentDualPoint.xB) / maxB) * 95

      }



      return { jumperX, boardX, boardContactX, impactPhase }

    }



    const shooterBaseX = width * 0.3

    const bulletStartX = shooterBaseX + 74

    const progress = animationProgress



    if (!results || dualPoints.length === 0) {

      return { shooterX: shooterBaseX, bulletX: bulletStartX, muzzleFlash: false }

    }



    const maxA = Math.max(...dualPoints.map((p) => Math.abs(p.xA)), 1)

    const maxB = Math.max(...dualPoints.map((p) => Math.abs(p.xB)), 1)



    const idlePhase = progress < 0.22

    const firePhase = progress >= 0.22 && progress <= 0.3



    let shooterX = shooterBaseX

    let bulletX = bulletStartX



    if (!idlePhase) {

      shooterX = shooterBaseX - (Math.abs(currentDualPoint.xA) / maxA) * 120

      bulletX = bulletStartX + (Math.abs(currentDualPoint.xB) / maxB) * 390

    }



    return { shooterX, bulletX, muzzleFlash: firePhase }

  }, [params.scenarioPreset, width, currentDualPoint, dualPoints, results, animationProgress])



  const handleDragMove = useCallback(

    (e) => {

      const x = e.target.x()



      if (lawType === 'first') {

        const speed = clamp((x - 180) / 8, -100, 100)

        setDragState({ type: 'speed', value: speed })

        onParamChange?.({ initialVelocity: parseFloat(speed.toFixed(1)) })

        return

      }



      if (lawType === 'second') {

        const force = clamp((x - 180) * 1.2, 0, 300)

        setDragState({ type: 'force', value: force })

        onParamChange?.({ appliedForce: parseFloat(force.toFixed(1)) })

        return

      }



      const interactionValue = clamp((x - 180) * 1.2, 1, 300)

      setDragState({ type: 'interaction', value: interactionValue })

      onParamChange?.({ interactionForce: parseFloat(interactionValue.toFixed(1)) })

    },

    [lawType, onParamChange]

  )



  const handleDragEnd = useCallback((e) => {

    e.target.position({ x: 180, y: e.target.y() })

    setDragState(null)

  }, [])



  const singleDropZone = useMemo(

    () => ({ x: singleX - 10, y: groundY - 86, width: 145, height: 112 }),

    [singleX, groundY]

  )



  const pathDropZone = useMemo(

    () => ({ x: objectTrackStartX, y: groundY - 8, width: objectTrackWidth, height: 80 }),

    [groundY, objectTrackWidth]

  )



  const helperDropZone = useMemo(

    () => ({ x: singleX - 130, y: groundY - 110, width: 115, height: 125 }),

    [singleX, groundY]

  )



  const personWallDropZone = useMemo(

    () => ({ x: (thirdScene.personX ?? 0) - 20, y: groundY - 90, width: 90, height: 125 }),

    [thirdScene.personX, groundY]

  )



  const personADropZone = useMemo(

    () => ({ x: (thirdScene.ax ?? 0) - 20, y: groundY - 90, width: 82, height: 115 }),

    [thirdScene.ax, groundY]

  )



  const personBDropZone = useMemo(

    () => ({ x: (thirdScene.bx ?? 0) - 20, y: groundY - 90, width: 82, height: 115 }),

    [thirdScene.bx, groundY]

  )



  const gunDropZone = useMemo(

    () => ({ x: (thirdScene.shooterX ?? 0) - 10, y: groundY - 90, width: 98, height: 125 }),

    [thirdScene.shooterX, groundY]

  )



  const jumpDropZone = useMemo(

    () => ({ x: (thirdScene.jumperX ?? 0) - 10, y: groundY - 90, width: 98, height: 125 }),

    [thirdScene.jumperX, groundY]

  )



  const liveInteractionForce =

    dragState?.type === 'interaction' ? dragState.value : params.interactionForce



  const handlePaletteDrop = useCallback(

    (itemId, dropX, dropY) => {

      if (lawType === 'first') {

        if ((itemId === 'weight5' || itemId === 'weight10') && isInsideRect(dropX, dropY, singleDropZone)) {

          const addMass = itemId === 'weight5' ? 5 : 10

          setVisualDrops((prev) => ({ ...prev, weightOnSingle: prev.weightOnSingle + addMass }))

          onParamChange?.({ mass: parseFloat((params.mass + addMass).toFixed(1)) })

          return

        }



        if (itemId === 'roughPatch' && isInsideRect(dropX, dropY, pathDropZone)) {

          setVisualDrops((prev) => ({ ...prev, roughPatchX: dropX }))

          onParamChange?.({

            frictionEnabled: true,

            frictionCoefficient: Math.max(params.frictionCoefficient, 0.45)

          })

          return

        }



        if (itemId === 'stopper' && isInsideRect(dropX, dropY, pathDropZone)) {

          setVisualDrops((prev) => ({ ...prev, stopperX: dropX }))

          onParamChange?.({

            frictionEnabled: true,

            frictionCoefficient: Math.max(params.frictionCoefficient, 0.9)

          })

        }



        return

      }



      if (lawType === 'second') {

        if ((itemId === 'weight5' || itemId === 'weight10') && isInsideRect(dropX, dropY, singleDropZone)) {

          const addMass = itemId === 'weight5' ? 5 : 10

          setVisualDrops((prev) => ({ ...prev, weightOnSingle: prev.weightOnSingle + addMass }))

          onParamChange?.({ mass: parseFloat((params.mass + addMass).toFixed(1)) })

          return

        }



        if (itemId === 'helperPush' && isInsideRect(dropX, dropY, helperDropZone)) {

          setVisualDrops((prev) => ({ ...prev, helperPush: true }))

          onParamChange?.({ appliedForce: Math.min(params.appliedForce + 25, 300) })

          return

        }



        if (itemId === 'frictionStrip' && isInsideRect(dropX, dropY, pathDropZone)) {

          setVisualDrops((prev) => ({ ...prev, frictionStripX: dropX }))

          onParamChange?.({ frictionCoefficient: Math.min(params.frictionCoefficient + 0.25, 2) })

        }



        return

      }



      if (lawType === 'third') {

        if (params.scenarioPreset === 'wall-push') {

          if (itemId === 'massA5' && isInsideRect(dropX, dropY, personWallDropZone)) {

            setVisualDrops((prev) => ({ ...prev, massAExtra: prev.massAExtra + 5 }))

            onParamChange?.({ massA: parseFloat((params.massA + 5).toFixed(1)) })

            return

          }



          if (itemId === 'recoilBoost' && isInsideRect(dropX, dropY, personWallDropZone)) {

            setVisualDrops((prev) => ({ ...prev, recoilBoost: true }))

            onParamChange?.({ interactionForce: Math.min(params.interactionForce + 30, 300) })

            return

          }

        }



        if (params.scenarioPreset === 'skaters') {

          if (itemId === 'massA5' && isInsideRect(dropX, dropY, personADropZone)) {

            setVisualDrops((prev) => ({ ...prev, massAExtra: prev.massAExtra + 5 }))

            onParamChange?.({ massA: parseFloat((params.massA + 5).toFixed(1)) })

            return

          }



          if (itemId === 'massB5' && isInsideRect(dropX, dropY, personBDropZone)) {

            setVisualDrops((prev) => ({ ...prev, massBExtra: prev.massBExtra + 5 }))

            onParamChange?.({ massB: parseFloat((params.massB + 5).toFixed(1)) })

            return

          }



          if (itemId === 'recoilBoost') {

            setVisualDrops((prev) => ({ ...prev, recoilBoost: true }))

            onParamChange?.({ interactionForce: Math.min(params.interactionForce + 30, 300) })

            return

          }

        }



        if (params.scenarioPreset === 'gun-recoil') {

          if (itemId === 'massA5' && isInsideRect(dropX, dropY, gunDropZone)) {

            setVisualDrops((prev) => ({ ...prev, massAExtra: prev.massAExtra + 5 }))

            onParamChange?.({ massA: parseFloat((params.massA + 5).toFixed(1)) })

            return

          }



          if (itemId === 'recoilBoost' && isInsideRect(dropX, dropY, gunDropZone)) {

            setVisualDrops((prev) => ({ ...prev, recoilBoost: true }))

            onParamChange?.({ interactionForce: Math.min(params.interactionForce + 30, 300) })

            return

          }

        }



        if (params.scenarioPreset === 'jump-board') {

          if (itemId === 'massA5' && isInsideRect(dropX, dropY, jumpDropZone)) {

            setVisualDrops((prev) => ({ ...prev, massAExtra: prev.massAExtra + 5 }))

            onParamChange?.({ massA: parseFloat((params.massA + 5).toFixed(1)) })

            return

          }



          if (itemId === 'recoilBoost' && isInsideRect(dropX, dropY, jumpDropZone)) {

            setVisualDrops((prev) => ({ ...prev, recoilBoost: true }))

            onParamChange?.({ interactionForce: Math.min(params.interactionForce + 30, 300) })

          }

        }

      }

    },

    [

      lawType,

      singleDropZone,

      pathDropZone,

      helperDropZone,

      personWallDropZone,

      personADropZone,

      personBDropZone,

      gunDropZone,

      jumpDropZone,

      onParamChange,

      params

    ]

  )



  const lawOnePalette = [

    { id: 'weight5', label: '+5kg', color: '#fde68a' },

    { id: 'weight10', label: '+10kg', color: '#fcd34d' },

    { id: 'roughPatch', label: 'Rough', color: '#c4b5fd' },

    { id: 'stopper', label: 'Stop', color: '#fca5a5' }

  ]



  const lawTwoPalette = [

    { id: 'weight5', label: '+5kg', color: '#fde68a' },

    { id: 'weight10', label: '+10kg', color: '#fcd34d' },

    { id: 'helperPush', label: 'Helper', color: '#86efac' },

    { id: 'frictionStrip', label: 'Friction', color: '#c4b5fd' }

  ]



  const lawThreePalette = [

    { id: 'massA5', label: 'Mass A', color: '#93c5fd' },

    { id: 'massB5', label: 'Mass B', color: '#f9a8d4' },

    { id: 'recoilBoost', label: 'Boost', color: '#86efac' }

  ]



  const lawExplanation =

    lawType === 'first'

      ? params.scenarioPreset === 'moving-stop'

        ? 'A moving object keeps moving until an outside force slows or stops it.'

        : params.frictionEnabled

          ? 'Friction is the outside force, so the object slows down.'

          : 'With almost no opposing force, the object keeps moving.'

      : lawType === 'second'

        ? 'Acceleration depends on force and mass: bigger force moves it faster, bigger mass resists motion.'

        : params.scenarioPreset === 'gun-recoil'

          ? 'The bullet moves forward, and the gun/shooter recoils backward.'

          : params.scenarioPreset === 'wall-push'

            ? 'The person pushes the wall, and the wall pushes back equally.'

            : params.scenarioPreset === 'jump-board'

              ? 'The jumper pushes the board back, and the board pushes the jumper forward.'

              : 'The two skaters push each other apart with equal opposite forces.'

return (

    <div className="canvas-container">

      <Stage width={width} height={height} className="simulation-canvas">

        <Layer>

          <SkyScene width={width} groundY={groundY} />



          {lawType === 'first' && params.scenarioPreset === 'ice' && (

            <IceGround width={width} groundY={groundY} height={height} sceneShift={groundScrollShift} />

          )}



          {lawType === 'first' && params.scenarioPreset === 'rough-floor' && (

            <RoughGround width={width} groundY={groundY} height={height} sceneShift={groundScrollShift} />

          )}



          {((lawType === 'first' &&

            (params.scenarioPreset === 'trolley' || params.scenarioPreset === 'moving-stop')) ||

            lawType === 'second') && (

            <RoadGround

              width={width}

              groundY={groundY}

              height={height}

              roadOffset={roadOffset}

            />

          )}



          {lawType === 'third' && (

            <RoadGround

              width={width}

              groundY={groundY}

              height={height}

              roadOffset={0}

            />

          )}



          <MeterRule ticks={meterTicks} groundY={groundY} width={width} />



          <Rect

            x={width - 270}

            y={16}

            width={235}

            height={138}

            cornerRadius={14}

            fill="rgba(255,255,255,0.84)"

            stroke="rgba(15,23,42,0.10)"

          />



          <Text

            x={width - 248}

            y={34}

            text={`Newton Law ${lawType === 'first' ? 'I' : lawType === 'second' ? 'II' : 'III'}`}

            fontSize={15}

            fontStyle="bold"

            fill="#0f172a"

          />



          <Text

            x={width - 248}

            y={58}

            width={195}

            text={

              lawType === 'first'

                ? `Mass: ${params.mass} kg\nVelocity: ${currentSinglePoint.v.toFixed(2)} m/s\nDistance: ${currentSinglePoint.x.toFixed(2)} m`

                : lawType === 'second'

                  ? `Mass: ${params.mass} kg\nForce: ${params.appliedForce} N\nAcceleration: ${(results?.acceleration ?? 0).toFixed(2)} m/s²`

                  : `Force: ${params.interactionForce} N\nMass A: ${params.massA} kg\nMass B: ${params.massB} kg`

            }

            fontSize={12}

            lineHeight={1.45}

            fill="#0f172a"

          />



          <Rect

            x={width / 2 - 310}

            y={16}

            width={620}

            height={58}

            cornerRadius={14}

            fill="rgba(255,255,255,0.82)"

            stroke="rgba(15,23,42,0.10)"

          />



          <Text

            x={width / 2 - 286}

            y={32}

            width={572}

            text={lawExplanation}

            fontSize={13}

            lineHeight={1.35}

            fill="#0f172a"

          />



          {!results && (

            <>

              <Rect

                x={20}

                y={18}

                width={305}

                height={58}

                cornerRadius={12}

                fill="rgba(255,255,255,0.84)"

                stroke="rgba(15,23,42,0.10)"

              />

              <Text

                x={36}

                y={36}

                width={270}

                text={

                  lawType === 'first'

                    ? 'Drag speed or drop mass/friction/stopper.'

                    : lawType === 'second'

                      ? 'Drag force or add mass/helper/friction.'

                      : 'Drag force or add mass/boost.'

                }

                fontSize={13}

                fill="#334155"

              />

            </>

          )}



          {!results && lawType === 'first' && (

            <>

              {lawOnePalette.map((item, index) => (

                <PaletteItem

                  key={item.id}

                  x={24 + index * 92}

                  y={height - 48}

                  label={item.label}

                  color={item.color}

                  itemId={item.id}

                  onDrop={handlePaletteDrop}

                />

              ))}

            </>

          )}



          {!results && lawType === 'second' && (

            <>

              {lawTwoPalette.map((item, index) => (

                <PaletteItem

                  key={item.id}

                  x={24 + index * 92}

                  y={height - 48}

                  label={item.label}

                  color={item.color}

                  itemId={item.id}

                  onDrop={handlePaletteDrop}

                />

              ))}

            </>

          )}



          {!results && lawType === 'third' && (

            <>

              {lawThreePalette.map((item, index) => (

                <PaletteItem

                  key={item.id}

                  x={24 + index * 92}

                  y={height - 48}

                  label={item.label}

                  color={item.color}

                  itemId={item.id}

                  onDrop={handlePaletteDrop}

                />

              ))}

            </>

          )}



          {visualDrops.roughPatchX !== null && (

            <>

              <Rect

                x={visualDrops.roughPatchX - 42}

                y={groundY + 4}

                width={84}

                height={26}

                fill="#7c3aed"

                opacity={0.72}

                cornerRadius={6}

              />

              <Text

                x={visualDrops.roughPatchX - 34}

                y={groundY + 10}

                text="rough"

                fontSize={12}

                fontStyle="bold"

                fill="#ffffff"

              />

            </>

          )}



          {visualDrops.frictionStripX !== null && (

            <>

              <Rect

                x={visualDrops.frictionStripX - 44}

                y={groundY + 4}

                width={88}

                height={26}

                fill="#7c3aed"

                opacity={0.72}

                cornerRadius={6}

              />

              <Text

                x={visualDrops.frictionStripX - 34}

                y={groundY + 10}

                text="friction"

                fontSize={12}

                fontStyle="bold"

                fill="#ffffff"

              />

            </>

          )}



          {visualDrops.stopperX !== null && (

            <>

              <Rect

                x={visualDrops.stopperX - 8}

                y={groundY - 46}

                width={16}

                height={46}

                fill="#ef4444"

                cornerRadius={4}

              />

              <RegularPolygon

                x={visualDrops.stopperX}

                y={groundY - 56}

                sides={3}

                radius={13}

                fill="#ef4444"

                rotation={180}

              />

              <Text

                x={visualDrops.stopperX - 22}

                y={groundY - 78}

                text="stop"

                fontSize={12}

                fontStyle="bold"

                fill="#ef4444"

              />

            </>

          )}



          {lawType === 'first' && (

            <>

              {params.scenarioPreset === 'trolley' && (

                <TrolleyObject x={singleX} y={groundY - 50} mass={params.mass} />

              )}



              {(params.scenarioPreset === 'ice' ||

                params.scenarioPreset === 'rough-floor') && (

                <BoxObject

                  x={singleX}

                  y={groundY - 50}

                  fill={params.scenarioPreset === 'ice' ? '#60a5fa' : '#8b5cf6'}

                  label="Box"

                  mass={params.mass}

                />

              )}



              {params.scenarioPreset === 'moving-stop' && (

                <>

                  <CartObject x={singleX} y={groundY - 50} mass={params.mass} />

                  <SimpleLabel

                    x={singleX - 20}

                    y={groundY - 128}

                    width={230}

                    text="It moves first. Then friction/stop force slows it."

                  />

                  <ForceArrow

                    points={[singleX + 55, groundY - 78, singleX + 130, groundY - 78]}

                    color="#22c55e"

                    label="motion"

                    visible={Math.abs(currentSinglePoint.v) > 0.1}

                  />

                  <ForceArrow

                    points={[singleX + 55, groundY - 48, singleX - 10, groundY - 48]}

                    color="#ef4444"

                    label="outside force"

                    visible={Math.abs(currentSinglePoint.v) > 0.1}

                  />

                </>

              )}



              {visualDrops.weightOnSingle > 0 && (

                <>

                  <Rect

                    x={singleX + 34}

                    y={groundY - 90}

                    width={46}

                    height={22}

                    fill="#facc15"

                    cornerRadius={5}

                    stroke="#92400e"

                    strokeWidth={1}

                  />

                  <Text

                    x={singleX + 38}

                    y={groundY - 86}

                    text={`+${visualDrops.weightOnSingle}kg`}

                    fontSize={11}

                    fontStyle="bold"

                    fill="#1f2937"

                  />

                </>

              )}



              {params.scenarioPreset !== 'moving-stop' && (frameIndex < 20 || !results) && (

                <ForceArrow

                  points={[singleX - 8, groundY - 22, singleX + 48, groundY - 22]}

                  color="#22c55e"

                  label="push starts it"

                />

              )}



              <ForceArrow

                points={[singleX + 55, groundY + 45, singleX + 55, groundY - 30]}

                color="#38bdf8"

                label="N"

              />



              <ForceArrow

                points={[singleX + 55, groundY - 40, singleX + 55, groundY + 28]}

                color="#ef4444"

                label="W"

              />



              {params.scenarioPreset !== 'moving-stop' && (

                <ForceArrow

                  points={[singleX + 55, groundY - 78, singleX + 124, groundY - 78]}

                  color="#22c55e"

                  label="motion"

                  visible={Math.abs(currentSinglePoint.v) > 0.1}

                />

              )}



              <ForceArrow

                points={[singleX + 55, groundY - 50, singleX + 5, groundY - 50]}

                color="#f87171"

                label="friction"

                visible={params.frictionEnabled && Math.abs(currentSinglePoint.v) > 0.1}

              />



              {params.scenarioPreset === 'ice' && (

                <SimpleLabel

                  x={singleX - 18}

                  y={groundY - 126}

                  width={220}

                  text="Ice has very little friction, so motion continues."

                />

              )}



              {params.scenarioPreset === 'rough-floor' && (

                <SimpleLabel

                  x={singleX - 18}

                  y={groundY - 126}

                  width={230}

                  text="Rough floor creates friction, so it slows down."

                />

              )}



              {params.scenarioPreset === 'trolley' && (

                <SimpleLabel

                  x={singleX - 18}

                  y={groundY - 126}

                  width={230}

                  text="Trolley keeps rolling until friction reduces motion."

                />

              )}



              {!results && (

                <DragHandle

                  x={180}

                  y={groundY - 104}

                  text="Drag speed"

                  onDragMove={handleDragMove}

                  onDragEnd={handleDragEnd}

                  disabled={false}

                />

              )}

            </>

          )}



          {lawType === 'second' && (

            <>

              {params.scenarioPreset === 'cart-push' && (

                <CartObject x={singleX} y={groundY - 50} mass={params.mass} />

              )}



              {params.scenarioPreset === 'heavy-crate' && (

                <CrateObject x={singleX} y={groundY - 50} mass={params.mass} />

              )}



              {params.scenarioPreset === 'sled' && (

                <SledObject x={singleX} y={groundY - 50} mass={params.mass} />

              )}



              <Person x={singleX - 42} y={groundY - 42} armToX={singleX - 2} />



              {visualDrops.helperPush && (

                <Person x={singleX - 104} y={groundY - 42} color="#10b981" armToX={singleX - 34} />

              )}



              {visualDrops.weightOnSingle > 0 && (

                <>

                  <Rect

                    x={singleX + 34}

                    y={groundY - 92}

                    width={48}

                    height={22}

                    fill="#facc15"

                    cornerRadius={5}

                    stroke="#92400e"

                    strokeWidth={1}

                  />

                  <Text

                    x={singleX + 38}

                    y={groundY - 88}

                    text={`+${visualDrops.weightOnSingle}kg`}

                    fontSize={11}

                    fontStyle="bold"

                    fill="#1f2937"

                  />

                </>

              )}



              <ForceArrow

                points={[

                  singleX - 10,

                  groundY - 22,

                  singleX - 10 + Math.max(Math.min((dragState?.type === 'force' ? dragState.value : params.appliedForce) * 0.75, 145), 28),

                  groundY - 22

                ]}

                color="#22c55e"

                label="applied force"

              />



              <ForceArrow

                points={[singleX + 55, groundY + 45, singleX + 55, groundY - 30]}

                color="#38bdf8"

                label="N"

              />



              <ForceArrow

                points={[singleX + 55, groundY - 40, singleX + 55, groundY + 28]}

                color="#ef4444"

                label="W"

              />



              <ForceArrow

                points={[

                  singleX + 55,

                  groundY - 50,

                  singleX + 55 - Math.min(params.frictionCoefficient * 70, 62),

                  groundY - 50

                ]}

                color="#f87171"

                label="friction"

                visible={params.frictionCoefficient > 0}

              />



              <ForceArrow

                points={[

                  singleX + 55,

                  groundY - 86,

                  singleX +

                    55 +

                    ((results?.net_force ?? params.appliedForce) >= 0 ? 1 : -1) *

                      Math.max(

                        Math.min(Math.abs(results?.net_force ?? params.appliedForce) * 0.75, 105),

                        20

                      ),

                  groundY - 86

                ]}

                color="#f59e0b"

                label="net force"

              />



              <SimpleLabel

                x={singleX - 20}

                y={groundY - 136}

                width={270}

                text={

                  params.mass >= 25

                    ? 'Large mass: same push gives smaller acceleration.'

                    : params.appliedForce >= 80

                      ? 'Large push: acceleration becomes bigger.'

                      : 'Force and mass together decide acceleration.'

                }

              />



              {!results && (

                <DragHandle

                  x={180}

                  y={groundY - 104}

                  text="Drag force"

                  onDragMove={handleDragMove}

                  onDragEnd={handleDragEnd}

                  disabled={false}

                />

              )}

            </>

          )}



          {lawType === 'third' && params.scenarioPreset === 'gun-recoil' && (

            <>

              <GunShooter

                x={thirdScene.shooterX}

                y={groundY - 44}

                recoil={animationProgress >= 0.22}

              />



              <Rect

                x={thirdScene.bulletX}

                y={groundY - 22}

                width={24}

                height={7}

                fill="#111827"

                cornerRadius={3}

              />



              <Circle

                x={thirdScene.bulletX + 24}

                y={groundY - 18.5}

                radius={3.5}

                fill="#111827"

              />



              {thirdScene.muzzleFlash && (

                <>

                  <Circle x={thirdScene.bulletX - 6} y={groundY - 18} radius={10} fill="#facc15" opacity={0.9} />

                  <Circle x={thirdScene.bulletX - 2} y={groundY - 18} radius={22} fill="rgba(250,204,21,0.28)" />

                </>

              )}



              {visualDrops.massAExtra > 0 && (

                <Rect x={thirdScene.shooterX + 36} y={groundY - 80} width={32} height={18} fill="#93c5fd" cornerRadius={4} />

              )}



              <SimpleLabel

                x={thirdScene.shooterX - 20}

                y={groundY - 138}

                width={250}

                text="Bullet forward, shooter backward: equal opposite forces."

              />



              <ForceArrow

                points={[

                  thirdScene.shooterX + 62,

                  groundY - 86,

                  thirdScene.shooterX - Math.min(liveInteractionForce * 0.75, 110),

                  groundY - 86

                ]}

                color="#f472b6"

                label="recoil backward"

                visible={animationProgress >= 0.22}

              />



              <ForceArrow

                points={[

                  thirdScene.bulletX,

                  groundY - 58,

                  thirdScene.bulletX + Math.min(liveInteractionForce * 0.95, 130),

                  groundY - 58

                ]}

                color="#22c55e"

                label="bullet forward"

                visible={animationProgress >= 0.22}

              />



              {!results && (

                <DragHandle

                  x={180}

                  y={groundY - 104}

                  text="Drag force"

                  onDragMove={handleDragMove}

                  onDragEnd={handleDragEnd}

                  disabled={false}

                />

              )}

            </>

          )}



          {lawType === 'third' && params.scenarioPreset === 'wall-push' && (

            <>

              <Rect

                x={thirdScene.wallX}

                y={groundY - 76}

                width={50}

                height={128}

                fill="#475569"

                cornerRadius={4}

              />

              <Rect

                x={thirdScene.wallX + 9}

                y={groundY - 76}

                width={9}

                height={128}

                fill="#64748b"

              />

              <Text

                x={thirdScene.wallX - 2}

                y={groundY + 58}

                text="Wall"

                fontSize={14}

                fontStyle="bold"

                fill="#0f172a"

              />



              <Person x={thirdScene.personX} y={groundY - 40} armToX={thirdScene.wallX - 6} />



              {thirdScene.impactPhase && (

                <>

                  <Circle x={thirdScene.contactX + 10} y={groundY - 18} radius={10} fill="#facc15" opacity={0.92} />

                  <Circle x={thirdScene.contactX + 10} y={groundY - 18} radius={22} fill="rgba(250,204,21,0.28)" />

                </>

              )}



              {visualDrops.massAExtra > 0 && (

                <Rect x={thirdScene.personX + 16} y={groundY - 80} width={32} height={18} fill="#93c5fd" cornerRadius={4} />

              )}



              <SimpleLabel

                x={thirdScene.personX - 28}

                y={groundY - 138}

                width={270}

                text="Person pushes wall. Wall pushes person back."

              />



              <ForceArrow

                points={[

                  thirdScene.wallX - 10,

                  groundY - 22,

                  thirdScene.wallX + 10 + Math.min(liveInteractionForce * 0.85, 120),

                  groundY - 22

                ]}

                color="#22c55e"

                label="action"

                visible={animationProgress >= 0.45}

              />



              <ForceArrow

                points={[

                  thirdScene.personX + 4,

                  groundY + 12,

                  thirdScene.personX - Math.min(liveInteractionForce * 0.85, 120),

                  groundY + 12

                ]}

                color="#f472b6"

                label="reaction"

                visible={animationProgress >= 0.45}

              />



              {!results && (

                <DragHandle

                  x={180}

                  y={groundY - 104}

                  text="Drag force"

                  onDragMove={handleDragMove}

                  onDragEnd={handleDragEnd}

                  disabled={false}

                />

              )}

            </>

          )}



          {lawType === 'third' && params.scenarioPreset === 'skaters' && (

            <>

              <Person x={thirdScene.ax} y={groundY - 40} color="#3b82f6" label="A" />

              <Person x={thirdScene.bx} y={groundY - 40} color="#ef4444" label="B" />



              {visualDrops.massAExtra > 0 && (

                <Rect x={thirdScene.ax + 18} y={groundY - 78} width={32} height={18} fill="#93c5fd" cornerRadius={4} />

              )}



              {visualDrops.massBExtra > 0 && (

                <Rect x={thirdScene.bx + 18} y={groundY - 78} width={32} height={18} fill="#f9a8d4" cornerRadius={4} />

              )}



              <Line

                points={[thirdScene.ax - 24, groundY + 4, thirdScene.ax + 24, groundY + 4]}

                stroke="#64748b"

                strokeWidth={4}

              />



              <Line

                points={[thirdScene.bx - 24, groundY + 4, thirdScene.bx + 24, groundY + 4]}

                stroke="#64748b"

                strokeWidth={4}

              />



              {!results && (

                <Line

                  points={[thirdScene.contactCenter, groundY - 18, thirdScene.contactCenter, groundY + 34]}

                  stroke="rgba(15,23,42,0.20)"

                  strokeWidth={2}

                  dash={[6, 4]}

                />

              )}



              {thirdScene.impactPhase && (

                <>

                  <Circle x={thirdScene.contactCenter} y={groundY - 18} radius={10} fill="#facc15" opacity={0.92} />

                  <Circle x={thirdScene.contactCenter} y={groundY - 18} radius={22} fill="rgba(250,204,21,0.28)" />

                </>

              )}



              <SimpleLabel

                x={thirdScene.contactCenter - 145}

                y={groundY - 140}

                width={290}

                text="They meet, push each other, then move apart."

              />



              <ForceArrow

                points={[

                  thirdScene.ax + 16,

                  groundY - 24,

                  thirdScene.ax + 16 - Math.min(liveInteractionForce * 0.8, 110),

                  groundY - 24

                ]}

                color="#60a5fa"

                label="action"

                visible={animationProgress >= 0.45}

              />



              <ForceArrow

                points={[

                  thirdScene.bx - 16,

                  groundY - 24,

                  thirdScene.bx - 16 + Math.min(liveInteractionForce * 0.8, 110),

                  groundY - 24

                ]}

                color="#f472b6"

                label="reaction"

                visible={animationProgress >= 0.45}

              />



              {!results && (

                <DragHandle

                  x={180}

                  y={groundY - 104}

                  text="Drag force"

                  onDragMove={handleDragMove}

                  onDragEnd={handleDragEnd}

                  disabled={false}

                />

              )}

            </>

          )}



          {lawType === 'third' && params.scenarioPreset === 'jump-board' && (

            <>

              <Person x={thirdScene.jumperX} y={groundY - 40} color="#22c55e" label="Jumper" />

              <JumpBoardObject x={thirdScene.boardX} y={groundY - 16} />



              {thirdScene.impactPhase && (

                <>

                  <Circle x={thirdScene.boardContactX + 8} y={groundY - 18} radius={10} fill="#facc15" opacity={0.92} />

                  <Circle x={thirdScene.boardContactX + 8} y={groundY - 18} radius={22} fill="rgba(250,204,21,0.28)" />

                </>

              )}



              {visualDrops.massAExtra > 0 && (

                <Rect x={thirdScene.jumperX + 14} y={groundY - 80} width={32} height={18} fill="#93c5fd" cornerRadius={4} />

              )}



              <SimpleLabel

                x={thirdScene.jumperX - 24}

                y={groundY - 138}

                width={290}

                text="Jumper pushes board back. Board pushes jumper forward."

              />



              <ForceArrow

                points={[

                  thirdScene.boardX + 50,

                  groundY - 30,

                  thirdScene.boardX + 50 - Math.min(liveInteractionForce * 0.8, 110),

                  groundY - 30

                ]}

                color="#f59e0b"

                label="board back"

                visible={animationProgress >= 0.45}

              />



              <ForceArrow

                points={[

                  thirdScene.jumperX,

                  groundY + 10,

                  thirdScene.jumperX + Math.min(liveInteractionForce * 0.8, 120),

                  groundY + 10

                ]}

                color="#22c55e"

                label="jumper forward"

                visible={animationProgress >= 0.45}

              />



              {!results && (

                <DragHandle

                  x={180}

                  y={groundY - 104}

                  text="Drag force"

                  onDragMove={handleDragMove}

                  onDragEnd={handleDragEnd}

                  disabled={false}

                />

              )}

            </>

          )}

        </Layer>

      </Stage>



      {!results && (

        <div className="canvas-placeholder">

          <p>Choose a law, choose a scenario, then drag the yellow handle or drag-drop the blocks below.</p>

        </div>

      )}

    </div>

  )

})



export default NewtonKonvaCanvas

