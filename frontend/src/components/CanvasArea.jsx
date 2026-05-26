import React, {

  useRef,

  useEffect,

  useCallback,

  forwardRef,

  useImperativeHandle

} from 'react'

import '../styles/canvas.css'



const OBJECT_STYLES = {

  cannonball: { fill: '#111827', stroke: '#475569', radiusFactor: 1, label: 'Cannonball' },

  golfBall: { fill: '#f8fafc', stroke: '#94a3b8', radiusFactor: 0.65, label: 'Golf Ball' },

  tennisBall: { fill: '#d9f99d', stroke: '#84cc16', radiusFactor: 0.75, label: 'Tennis Ball' },

  pumpkin: { fill: '#f97316', stroke: '#c2410c', radiusFactor: 1.1, label: 'Pumpkin' },

  bowlingBall: { fill: '#1e293b', stroke: '#64748b', radiusFactor: 1.05, label: 'Bowling Ball' }

}



const PLAYBACK_DURATION_MS = 7000



const clamp = (value, min, max) => Math.min(max, Math.max(min, value))



const CanvasArea = forwardRef(

  (

    {

      trajectoryPoints,

      idealTrajectoryPoints = [],

      params,

      activeTab = 'intro',

      selectedObject,

      width = 1200,

      height = 700,

      onAnimationComplete,

      onParamChange

    },

    ref

  ) => {

    const canvasRef = useRef(null)

    const animationId = useRef(null)

    const progressRef = useRef(0)

    const animationStartTimeRef = useRef(null)

    const animateRef = useRef(null)

    const completedRef = useRef(false)

    const pausedRef = useRef(false)



    const paddingLeft = 95

    const paddingRight = 55

    const paddingTop = 40

    const groundOffset = 82

    const groundY = height - groundOffset



    const getScale = useCallback(() => {

      const allPoints = [...(trajectoryPoints || []), ...(idealTrajectoryPoints || [])]



      const maxX = allPoints.length

        ? Math.max(...allPoints.map((point) => point.x), 1)

        : 10



      const maxYFromTrajectory = allPoints.length

        ? Math.max(...allPoints.map((point) => point.y), 1)

        : 10



      const maxYFromHeight = params.initialHeight || 0

      const maxY = Math.max(maxYFromTrajectory, maxYFromHeight, 10)



      const usableWidth = width - paddingLeft - paddingRight - 130

      const usableHeight = groundY - paddingTop - 100



      const scaleX = usableWidth / Math.max(maxX, 10)

      const scaleY = usableHeight / Math.max(maxY, 10)

      const scale = Math.min(scaleX, scaleY, 16)



      return { scaleX: scale, scaleY: scale }

    }, [trajectoryPoints, idealTrajectoryPoints, width, groundY, params.initialHeight])



    const getLauncherGeometry = useCallback(() => {

      const angle = (params.angle || 45) * (Math.PI / 180)

      const { scaleY } = getScale()



      const barrelLength = params.objectType === 'cannonball' ? 92 : 48

      const lift = Math.min((params.initialHeight || 0) * scaleY, groundY - 160)



      const launcherX = paddingLeft

      const launcherY = groundY - lift

      const barrelBaseY = launcherY - 12



      const muzzleX = launcherX + Math.cos(angle) * barrelLength

      const muzzleY = barrelBaseY - Math.sin(angle) * barrelLength



      return {

        angle,

        barrelLength,

        launcherX,

        launcherY,

        barrelBaseY,

        muzzleX,

        muzzleY

      }

    }, [params.angle, params.objectType, params.initialHeight, getScale, groundY])



    const mapPointToCanvas = useCallback(

      (point) => {

        const { scaleX, scaleY } = getScale()

        const { muzzleX, muzzleY } = getLauncherGeometry()

        const relativeY = point.y - (params.initialHeight || 0)



        return {

          x: muzzleX + point.x * scaleX,

          y: muzzleY - relativeY * scaleY

        }

      },

      [getScale, getLauncherGeometry, params.initialHeight]

    )



    const getVisibleIndex = useCallback(() => {

      if (!trajectoryPoints?.length) return 0

      const maxIndex = trajectoryPoints.length - 1

      return Math.min(Math.floor(progressRef.current * maxIndex), maxIndex)

    }, [trajectoryPoints])



    const drawCloud = useCallback((ctx, x, y, scale = 1) => {

      ctx.beginPath()

      ctx.arc(x, y, 18 * scale, 0, 2 * Math.PI)

      ctx.arc(x + 20 * scale, y - 8 * scale, 24 * scale, 0, 2 * Math.PI)

      ctx.arc(x + 48 * scale, y, 18 * scale, 0, 2 * Math.PI)

      ctx.fill()

    }, [])



    const drawArrow = useCallback((ctx, fromX, fromY, toX, toY) => {

      const headLength = 10

      const angle = Math.atan2(toY - fromY, toX - fromX)



      ctx.beginPath()

      ctx.moveTo(fromX, fromY)

      ctx.lineTo(toX, toY)

      ctx.stroke()



      ctx.beginPath()

      ctx.moveTo(toX, toY)

      ctx.lineTo(

        toX - headLength * Math.cos(angle - Math.PI / 6),

        toY - headLength * Math.sin(angle - Math.PI / 6)

      )

      ctx.lineTo(

        toX - headLength * Math.cos(angle + Math.PI / 6),

        toY - headLength * Math.sin(angle + Math.PI / 6)

      )

      ctx.closePath()

      ctx.fill()

    }, [])



    const drawPerson = useCallback((ctx, x, y, color = '#2563eb', pose = 'throw') => {

      ctx.save()

      ctx.fillStyle = color

      ctx.strokeStyle = color

      ctx.lineWidth = 5

      ctx.lineCap = 'round'



      ctx.beginPath()

      ctx.arc(x, y - 42, 10, 0, 2 * Math.PI)

      ctx.fill()



      ctx.fillRect(x - 7, y - 30, 14, 34)



      ctx.beginPath()



      if (pose === 'golf') {

        ctx.moveTo(x - 5, y - 16)

        ctx.lineTo(x + 26, y - 35)

        ctx.moveTo(x + 5, y - 16)

        ctx.lineTo(x + 22, y - 8)

      } else if (pose === 'tennis') {

        ctx.moveTo(x - 5, y - 16)

        ctx.lineTo(x - 20, y - 2)

        ctx.moveTo(x + 5, y - 16)

        ctx.lineTo(x + 22, y - 35)

      } else if (pose === 'bowl') {

        ctx.moveTo(x - 5, y - 16)

        ctx.lineTo(x - 18, y - 4)

        ctx.moveTo(x + 5, y - 16)

        ctx.lineTo(x + 32, y - 4)

      } else {

        ctx.moveTo(x - 5, y - 16)

        ctx.lineTo(x - 18, y - 6)

        ctx.moveTo(x + 5, y - 16)

        ctx.lineTo(x + 20, y - 14)

      }



      ctx.moveTo(x - 4, y + 4)

      ctx.lineTo(x - 15, y + 30)

      ctx.moveTo(x + 4, y + 4)

      ctx.lineTo(x + 14, y + 30)

      ctx.stroke()



      ctx.restore()

    }, [])



    const drawRaisedPlatform = useCallback(

      (ctx, launcherY, label = 'Launch height') => {

        if ((params.initialHeight || 0) <= 0) return



        ctx.save()



        ctx.strokeStyle = '#475569'

        ctx.lineWidth = 5

        ctx.beginPath()

        ctx.moveTo(paddingLeft - 56, launcherY + 18)

        ctx.lineTo(paddingLeft + 72, launcherY + 18)

        ctx.stroke()



        ctx.strokeStyle = '#64748b'

        ctx.lineWidth = 4

        ctx.beginPath()

        ctx.moveTo(paddingLeft - 42, launcherY + 20)

        ctx.lineTo(paddingLeft - 56, groundY)

        ctx.moveTo(paddingLeft + 56, launcherY + 20)

        ctx.lineTo(paddingLeft + 72, groundY)

        ctx.stroke()



        ctx.setLineDash([5, 4])

        ctx.strokeStyle = '#16a34a'

        ctx.lineWidth = 2

        ctx.beginPath()

        ctx.moveTo(paddingLeft + 88, launcherY)

        ctx.lineTo(paddingLeft + 88, groundY)

        ctx.stroke()

        ctx.setLineDash([])



        ctx.fillStyle = '#0f172a'

        ctx.font = 'bold 11px Arial'

        ctx.fillText(`${params.initialHeight} m`, paddingLeft + 96, launcherY + (groundY - launcherY) / 2)

        ctx.fillText(label, paddingLeft + 96, launcherY + 16)



        ctx.restore()

      },

      [params.initialHeight, paddingLeft, groundY]

    )



    const getMassRadius = useCallback(() => {

      const style = OBJECT_STYLES[params.objectType] || OBJECT_STYLES.cannonball

      const diameterScale = Math.sqrt(Math.max(params.diameter || 0.05, 0.01)) * 8

      const massScale = Math.log10(Math.max(params.mass || 0.01, 0.01) + 1) * 5

      return clamp(7 + diameterScale + massScale, 7, 34) * style.radiusFactor

    }, [params.objectType, params.mass, params.diameter])



    const drawWind = useCallback(

      (ctx) => {

        if (!params.airResistance) return



        const windShift = (progressRef.current * 240) % 160



        ctx.save()

        ctx.strokeStyle = 'rgba(37, 99, 235, 0.35)'

        ctx.lineWidth = 3

        ctx.lineCap = 'round'

        ctx.fillStyle = 'rgba(37, 99, 235, 0.75)'

        ctx.font = 'bold 12px Arial'



        for (let i = 0; i < 8; i++) {

          const x = width - ((i * 145 + windShift) % (width + 160))

          const y = 95 + (i % 5) * 62



          ctx.beginPath()

          ctx.moveTo(x, y)

          ctx.bezierCurveTo(x - 32, y - 12, x - 68, y + 14, x - 110, y)

          ctx.stroke()

        }



        ctx.fillText('Air resistance / wind drag active', width - 280, 140)

        ctx.restore()

      },

      [params.airResistance, width]

    )



    const drawLaunchScene = useCallback(

      (ctx) => {

        const { launcherY, barrelBaseY } = getLauncherGeometry()

        const sceneY = launcherY



        if (params.objectType === 'cannonball') return



        drawRaisedPlatform(ctx, launcherY, 'Launch height')



        if (params.objectType === 'golfBall') {

          drawPerson(ctx, paddingLeft - 22, sceneY - 4, '#2563eb', 'golf')



          ctx.fillStyle = '#ffffff'

          ctx.beginPath()

          ctx.arc(paddingLeft + 20, sceneY - 8, 5, 0, 2 * Math.PI)

          ctx.fill()



          ctx.strokeStyle = '#374151'

          ctx.lineWidth = 3

          ctx.beginPath()

          ctx.moveTo(paddingLeft + 2, sceneY - 22)

          ctx.lineTo(paddingLeft + 38, sceneY - 46)

          ctx.stroke()



          ctx.fillStyle = '#0f172a'

          ctx.font = 'bold 11px Arial'

          ctx.fillText('Golf tee launch', paddingLeft + 42, sceneY - 10)

        } else if (params.objectType === 'tennisBall') {

          drawPerson(ctx, paddingLeft - 18, sceneY - 4, '#16a34a', 'tennis')



          ctx.strokeStyle = '#111827'

          ctx.lineWidth = 3

          ctx.beginPath()

          ctx.arc(paddingLeft + 18, sceneY - 28, 14, 0, 2 * Math.PI)

          ctx.stroke()



          ctx.fillStyle = '#d9f99d'

          ctx.beginPath()

          ctx.arc(paddingLeft + 38, sceneY - 58, 6, 0, 2 * Math.PI)

          ctx.fill()



          ctx.fillStyle = '#0f172a'

          ctx.font = 'bold 11px Arial'

          ctx.fillText('Tennis serve', paddingLeft + 46, sceneY - 28)

        } else if (params.objectType === 'bowlingBall') {

          drawPerson(ctx, paddingLeft - 24, sceneY - 4, '#7c3aed', 'bowl')



          ctx.fillStyle = '#1e293b'

          ctx.beginPath()

          ctx.arc(paddingLeft + 24, sceneY - 8, Math.min(getMassRadius(), 18), 0, 2 * Math.PI)

          ctx.fill()



          ctx.fillStyle = '#0f172a'

          ctx.font = 'bold 11px Arial'

          ctx.fillText('Bowling throw', paddingLeft + 50, sceneY - 12)

        } else if (params.objectType === 'pumpkin') {

          drawPerson(ctx, paddingLeft - 20, sceneY - 4, '#f97316', 'throw')



          ctx.fillStyle = '#f97316'

          ctx.beginPath()

          ctx.arc(paddingLeft + 28, sceneY - 14, Math.min(getMassRadius(), 18), 0, 2 * Math.PI)

          ctx.fill()



          ctx.fillStyle = '#0f172a'

          ctx.font = 'bold 11px Arial'

          ctx.fillText('Pumpkin throw', paddingLeft + 54, sceneY - 16)

        }



        ctx.strokeStyle = 'rgba(37, 99, 235, 0.42)'

        ctx.lineWidth = 2

        ctx.setLineDash([6, 4])

        ctx.beginPath()

        ctx.moveTo(paddingLeft, barrelBaseY)

        ctx.lineTo(

          paddingLeft + Math.cos((params.angle * Math.PI) / 180) * 90,

          barrelBaseY - Math.sin((params.angle * Math.PI) / 180) * 90

        )

        ctx.stroke()

        ctx.setLineDash([])



        ctx.fillStyle = '#0f172a'

        ctx.font = 'bold 12px Arial'

        ctx.fillText(`${params.angle}°`, paddingLeft + 54, barrelBaseY - 20)

      },

      [

        getLauncherGeometry,

        params.objectType,

        params.angle,

        paddingLeft,

        drawPerson,

        drawRaisedPlatform,

        getMassRadius

      ]

    )



    const drawBackground = useCallback(

      (ctx) => {

        ctx.save()



        const skyGradient = ctx.createLinearGradient(0, 0, 0, groundY)

        skyGradient.addColorStop(0, '#dff4ff')

        skyGradient.addColorStop(1, '#b6e3ff')

        ctx.fillStyle = skyGradient

        ctx.fillRect(0, 0, width, groundY)



        ctx.fillStyle = 'rgba(255, 216, 77, 0.95)'

        ctx.beginPath()

        ctx.arc(width - 130, 90, 34, 0, 2 * Math.PI)

        ctx.fill()



        ctx.fillStyle = 'rgba(255,255,255,0.92)'

        drawCloud(ctx, 90, 82, 1.1)

        drawCloud(ctx, 260, 128, 0.9)

        drawCloud(ctx, 470, 78, 1.15)

        drawCloud(ctx, 760, 112, 1)



        if (params.objectType === 'golfBall') {

          ctx.fillStyle = '#68b34d'

          ctx.fillRect(0, groundY, width, height - groundY)

          ctx.fillStyle = '#2e7d32'

          ctx.fillRect(0, groundY + 26, width, 8)

        } else if (params.objectType === 'tennisBall') {

          ctx.fillStyle = '#70b85a'

          ctx.fillRect(0, groundY, width, height - groundY)

          ctx.fillStyle = '#1e3a8a'

          ctx.fillRect(0, groundY + 30, width, 4)

          ctx.fillStyle = '#e5e7eb'

          ctx.fillRect(width / 2 - 8, groundY - 42, 16, 72)

        } else if (params.objectType === 'bowlingBall') {

          ctx.fillStyle = '#d6c29a'

          ctx.fillRect(0, groundY, width, height - groundY)

          ctx.fillStyle = 'rgba(15,23,42,0.12)'

          for (let x = 0; x < width; x += 90) {

            ctx.fillRect(x, groundY + 16, 52, 5)

          }

        } else {

          ctx.fillStyle = '#74b65b'

          ctx.fillRect(0, groundY, width, height - groundY)

        }



        ctx.restore()

      },

      [width, height, groundY, params.objectType, drawCloud]

    )



    const drawGrid = useCallback(

      (ctx) => {

        const { scaleX, scaleY } = getScale()



        ctx.save()

        ctx.strokeStyle = 'rgba(15, 23, 42, 0.08)'

        ctx.lineWidth = 1



        for (let x = paddingLeft; x < width - paddingRight; x += 60) {

          ctx.beginPath()

          ctx.moveTo(x, paddingTop)

          ctx.lineTo(x, groundY)

          ctx.stroke()

        }



        for (let y = groundY; y > paddingTop; y -= 60) {

          ctx.beginPath()

          ctx.moveTo(paddingLeft, y)

          ctx.lineTo(width - paddingRight, y)

          ctx.stroke()

        }



        ctx.fillStyle = 'rgba(15, 23, 42, 0.62)'

        ctx.font = '11px Arial'



        for (let i = 0; i <= 5; i++) {

          const valueX =

            Math.round((((width - paddingLeft - paddingRight) / 5 / scaleX) * i) * 10) / 10

          const x = paddingLeft + ((width - paddingLeft - paddingRight) / 5) * i

          ctx.fillText(`${valueX}`, x - 8, groundY + 22)

        }



        for (let i = 0; i <= 4; i++) {

          const y = groundY - ((groundY - paddingTop) / 4) * i

          const valueY =

            Math.round(((((groundY - paddingTop) / 4) / scaleY) * i) * 10) / 10

          ctx.fillText(`${valueY}`, 28, y + 4)

        }



        ctx.restore()

      },

      [getScale, width, groundY]

    )



    const drawAxes = useCallback(

      (ctx) => {

        ctx.save()

        ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)'

        ctx.lineWidth = 2



        ctx.beginPath()

        ctx.moveTo(paddingLeft, paddingTop)

        ctx.lineTo(paddingLeft, groundY)

        ctx.lineTo(width - paddingRight, groundY)

        ctx.stroke()



        ctx.fillStyle = '#0f172a'

        ctx.font = 'bold 12px Arial'

        ctx.fillText('Y (m)', 18, 22)

        ctx.fillText('X (m)', width - 54, groundY + 34)



        ctx.restore()

      },

      [width, groundY]

    )



    const drawLauncher = useCallback(

      (ctx) => {

        const { angle, barrelLength, launcherX, launcherY, barrelBaseY } = getLauncherGeometry()



        if (params.objectType !== 'cannonball') {

          drawLaunchScene(ctx)

          return

        }



        drawRaisedPlatform(ctx, launcherY, 'Cannon height')



        ctx.save()



        ctx.fillStyle = '#1f2937'

        ctx.beginPath()

        ctx.roundRect(launcherX - 38, launcherY - 2, 90, 26, 8)

        ctx.fill()



        ctx.fillStyle = '#111827'

        ctx.beginPath()

        ctx.arc(launcherX - 16, launcherY + 27, 14, 0, 2 * Math.PI)

        ctx.arc(launcherX + 36, launcherY + 27, 14, 0, 2 * Math.PI)

        ctx.fill()



        ctx.save()

        ctx.translate(launcherX, barrelBaseY)

        ctx.rotate(-angle)



        const barrelGradient = ctx.createLinearGradient(0, -13, barrelLength, 13)

        barrelGradient.addColorStop(0, '#334155')

        barrelGradient.addColorStop(0.5, '#94a3b8')

        barrelGradient.addColorStop(1, '#475569')



        ctx.fillStyle = barrelGradient

        ctx.beginPath()

        ctx.roundRect(0, -13, barrelLength, 26, 8)

        ctx.fill()



        ctx.fillStyle = '#020617'

        ctx.beginPath()

        ctx.arc(barrelLength - 4, 0, 10, 0, 2 * Math.PI)

        ctx.fill()



        if (!trajectoryPoints.length) {

          ctx.fillStyle = '#111827'

          ctx.beginPath()

          ctx.arc(barrelLength - 18, 0, Math.min(getMassRadius(), 13), 0, 2 * Math.PI)

          ctx.fill()



          ctx.strokeStyle = '#f59e0b'

          ctx.lineWidth = 2

          ctx.beginPath()

          ctx.arc(barrelLength - 18, 0, Math.min(getMassRadius(), 13) + 4, 0, 2 * Math.PI)

          ctx.stroke()

        }



        ctx.restore()



        ctx.strokeStyle = 'rgba(37, 99, 235, 0.42)'

        ctx.lineWidth = 2

        ctx.setLineDash([6, 4])

        ctx.beginPath()

        ctx.moveTo(launcherX, barrelBaseY)

        ctx.lineTo(launcherX + Math.cos(angle) * 105, barrelBaseY - Math.sin(angle) * 105)

        ctx.stroke()

        ctx.setLineDash([])



        ctx.fillStyle = '#0f172a'

        ctx.font = 'bold 12px Arial'

        ctx.fillText('0 m launch edge', launcherX - 10, groundY + 42)

        ctx.fillText(`${params.angle}°`, launcherX + 58, barrelBaseY - 22)



        ctx.restore()

      },

      [

        getLauncherGeometry,

        groundY,

        params.objectType,

        params.angle,

        trajectoryPoints.length,

        getMassRadius,

        drawRaisedPlatform,

        drawLaunchScene

      ]

    )



    const drawInfo = useCallback(

      (ctx) => {

        ctx.save()



        const modeText = params.airResistance ? 'Air Resistance: On' : 'Air Resistance: Off'

        const tabText = activeTab.charAt(0).toUpperCase() + activeTab.slice(1)

        const objectText = selectedObject?.label || OBJECT_STYLES[params.objectType]?.label || 'Object'



        ctx.fillStyle = 'rgba(255, 255, 255, 0.84)'

        ctx.beginPath()

        ctx.roundRect(width - 260, 18, 230, 104, 12)

        ctx.fill()

        ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)'

        ctx.stroke()



        ctx.fillStyle = '#0f172a'

        ctx.font = 'bold 12px Arial'

        ctx.fillText(`Mode: ${tabText}`, width - 234, 40)

        ctx.fillText(`Object: ${objectText}`, width - 234, 59)

        ctx.fillText(`Mass: ${params.mass} kg`, width - 234, 78)



        ctx.fillStyle = params.airResistance ? '#dc2626' : '#2563eb'

        ctx.fillText(modeText, width - 234, 98)



        ctx.restore()

      },

      [params, activeTab, selectedObject, width]

    )



    const drawTrajectory = useCallback(

      (ctx, points, visibleCount, color = '#2563eb', dashed = false) => {

        if (points.length < 2 || visibleCount < 1) return



        ctx.save()

        ctx.lineWidth = 3

        ctx.strokeStyle = color

        ctx.shadowBlur = 16

        ctx.shadowColor = color



        if (dashed) {

          ctx.setLineDash([8, 6])

          ctx.lineWidth = 2

        }



        ctx.beginPath()

        const startPoint = mapPointToCanvas(points[0])

        ctx.moveTo(startPoint.x, startPoint.y)



        for (let i = 1; i <= visibleCount; i++) {

          const canvasPoint = mapPointToCanvas(points[i])

          ctx.lineTo(canvasPoint.x, canvasPoint.y)

        }



        ctx.stroke()

        ctx.setLineDash([])

        ctx.restore()

      },

      [mapPointToCanvas]

    )



    const drawTrail = useCallback(

      (ctx, points, index) => {

        if (points.length === 0) return



        ctx.save()

        const trailStart = Math.max(0, index - 14)



        for (let i = trailStart; i <= index; i++) {

          const canvasPoint = mapPointToCanvas(points[i])

          const alpha = (i - trailStart + 1) / (index - trailStart + 2)

          const radius = 2 + alpha * 4



          ctx.beginPath()

          ctx.arc(canvasPoint.x, canvasPoint.y, radius, 0, 2 * Math.PI)

          ctx.fillStyle = `rgba(37, 99, 235, ${alpha * 0.34})`

          ctx.fill()

        }



        ctx.restore()

      },

      [mapPointToCanvas]

    )



    const drawVectors = useCallback(

      (ctx, points, index) => {

        if (points.length < 2 || index >= points.length) return

        if (!params.showVelocityVector && !params.showAccelerationVector && !params.showComponentVectors) return



        const current = points[index]

        const currentCanvas = mapPointToCanvas(current)



        const nextIndex = Math.min(index + 1, points.length - 1)

        const prevIndex = Math.max(index - 1, 0)

        const next = points[nextIndex]

        const prev = points[prevIndex]



        const dx = next.x - prev.x

        const dy = next.y - prev.y



        const velocityScale = 18

        const vx = dx * velocityScale

        const vy = -dy * velocityScale



        ctx.save()

        ctx.lineWidth = 3



        if (params.showVelocityVector) {

          ctx.strokeStyle = '#16a34a'

          ctx.fillStyle = '#16a34a'

          drawArrow(ctx, currentCanvas.x, currentCanvas.y, currentCanvas.x + vx, currentCanvas.y + vy)

        }



        if (params.showComponentVectors) {

          ctx.strokeStyle = '#f59e0b'

          ctx.fillStyle = '#f59e0b'

          drawArrow(ctx, currentCanvas.x, currentCanvas.y, currentCanvas.x + vx, currentCanvas.y)



          ctx.strokeStyle = '#9333ea'

          ctx.fillStyle = '#9333ea'

          drawArrow(ctx, currentCanvas.x + vx, currentCanvas.y, currentCanvas.x + vx, currentCanvas.y + vy)

        }



        if (params.showAccelerationVector) {

          ctx.strokeStyle = '#ef4444'

          ctx.fillStyle = '#ef4444'

          drawArrow(ctx, currentCanvas.x, currentCanvas.y, currentCanvas.x, currentCanvas.y + 65)

        }



        ctx.restore()

      },

      [mapPointToCanvas, params, drawArrow]

    )



    const drawProjectile = useCallback(

      (ctx, points, index) => {

        if (points.length === 0 || index >= points.length) return



        const canvasPoint = mapPointToCanvas(points[index])

        const style = OBJECT_STYLES[params.objectType] || OBJECT_STYLES.cannonball

        const radius = getMassRadius()



        ctx.save()



        if (index > 0) {

          const prevPoint = mapPointToCanvas(points[Math.max(0, index - 1)])

          const gradient = ctx.createLinearGradient(prevPoint.x, prevPoint.y, canvasPoint.x, canvasPoint.y)

          gradient.addColorStop(0, 'rgba(37, 99, 235, 0)')

          gradient.addColorStop(1, 'rgba(37, 99, 235, 0.75)')



          ctx.beginPath()

          ctx.moveTo(prevPoint.x, prevPoint.y)

          ctx.lineTo(canvasPoint.x, canvasPoint.y)

          ctx.strokeStyle = gradient

          ctx.lineWidth = 6

          ctx.stroke()

        }



        ctx.beginPath()

        ctx.ellipse(canvasPoint.x, groundY + 12, radius + 2, Math.max(4, radius * 0.35), 0, 0, 2 * Math.PI)

        ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'

        ctx.fill()



        ctx.shadowBlur = 22

        ctx.shadowColor = 'rgba(37, 99, 235, 0.50)'



        ctx.beginPath()

        ctx.arc(canvasPoint.x, canvasPoint.y, radius, 0, 2 * Math.PI)

        ctx.fillStyle = style.fill

        ctx.fill()

        ctx.lineWidth = 2

        ctx.strokeStyle = style.stroke

        ctx.stroke()



        if (params.objectType === 'golfBall') {

          ctx.fillStyle = 'rgba(148, 163, 184, 0.35)'

          for (let i = 0; i < 6; i++) {

            ctx.beginPath()

            ctx.arc(canvasPoint.x - 4 + (i % 3) * 4, canvasPoint.y - 4 + Math.floor(i / 3) * 4, 0.8, 0, 2 * Math.PI)

            ctx.fill()

          }

        }



        if (params.objectType === 'bowlingBall') {

          ctx.fillStyle = '#020617'

          ;[

            { x: -3, y: -4 },

            { x: 3, y: -1 },

            { x: 0, y: 4 }

          ].forEach((p) => {

            ctx.beginPath()

            ctx.arc(canvasPoint.x + p.x, canvasPoint.y + p.y, 1.5, 0, 2 * Math.PI)

            ctx.fill()

          })

        }



        if (params.objectType === 'pumpkin') {

          ctx.strokeStyle = '#7c2d12'

          ctx.lineWidth = 1



          ctx.beginPath()

          ctx.moveTo(canvasPoint.x, canvasPoint.y - radius)

          ctx.lineTo(canvasPoint.x, canvasPoint.y + radius)

          ctx.stroke()



          ctx.beginPath()

          ctx.moveTo(canvasPoint.x - radius * 0.45, canvasPoint.y - radius * 0.9)

          ctx.lineTo(canvasPoint.x - radius * 0.45, canvasPoint.y + radius * 0.9)

          ctx.stroke()



          ctx.beginPath()

          ctx.moveTo(canvasPoint.x + radius * 0.45, canvasPoint.y - radius * 0.9)

          ctx.lineTo(canvasPoint.x + radius * 0.45, canvasPoint.y + radius * 0.9)

          ctx.stroke()

        }



        ctx.shadowBlur = 0

        ctx.restore()

      },

      [mapPointToCanvas, groundY, params.objectType, getMassRadius]

    )



    const drawTarget = useCallback(

      (ctx) => {

        if (!trajectoryPoints?.length) return



        const last = trajectoryPoints[trajectoryPoints.length - 1]

        const targetPoint = mapPointToCanvas({ x: last.x, y: 0 })



        ctx.save()

        ctx.beginPath()

        ctx.arc(targetPoint.x, groundY, 24, 0, 2 * Math.PI)

        ctx.fillStyle = '#ef4444'

        ctx.fill()



        ctx.beginPath()

        ctx.arc(targetPoint.x, groundY, 16, 0, 2 * Math.PI)

        ctx.fillStyle = '#f8fafc'

        ctx.fill()



        ctx.beginPath()

        ctx.arc(targetPoint.x, groundY, 8, 0, 2 * Math.PI)

        ctx.fillStyle = '#ef4444'

        ctx.fill()



        ctx.fillStyle = 'rgba(255,255,255,0.95)'

        ctx.beginPath()

        ctx.roundRect(targetPoint.x - 44, groundY + 14, 88, 28, 8)

        ctx.fill()

        ctx.strokeStyle = 'rgba(15, 23, 42, 0.16)'

        ctx.stroke()



        ctx.fillStyle = '#0f172a'

        ctx.font = 'bold 12px Arial'

        ctx.fillText(`${last.x.toFixed(1)} m`, targetPoint.x - 22, groundY + 32)

        ctx.restore()

      },

      [trajectoryPoints, mapPointToCanvas, groundY]

    )



    const drawLabReadout = useCallback(

      (ctx, points, index) => {

        if (activeTab !== 'lab' || points.length === 0 || index >= points.length) return



        const point = points[index]

        const canvasPoint = mapPointToCanvas(point)



        ctx.save()

        ctx.fillStyle = 'rgba(255, 255, 255, 0.86)'

        ctx.beginPath()

        ctx.roundRect(canvasPoint.x + 18, canvasPoint.y - 42, 118, 52, 10)

        ctx.fill()



        ctx.strokeStyle = 'rgba(15, 23, 42, 0.14)'

        ctx.stroke()



        ctx.fillStyle = '#0f172a'

        ctx.font = 'bold 11px Arial'

        ctx.fillText(`x: ${point.x.toFixed(2)} m`, canvasPoint.x + 30, canvasPoint.y - 20)

        ctx.fillText(`y: ${point.y.toFixed(2)} m`, canvasPoint.x + 30, canvasPoint.y - 4)

        ctx.restore()

      },

      [activeTab, mapPointToCanvas]

    )



    const drawInteractionHint = useCallback(

      (ctx) => {

        if (trajectoryPoints.length > 0) return



        ctx.save()

        ctx.fillStyle = 'rgba(255,255,255,0.84)'

        ctx.beginPath()

        ctx.roundRect(24, 24, 330, 82, 12)

        ctx.fill()

        ctx.strokeStyle = 'rgba(15,23,42,0.12)'

        ctx.stroke()



        ctx.fillStyle = '#0f172a'

        ctx.font = 'bold 14px Arial'

        ctx.fillText('Interactive launcher', 42, 48)

        ctx.font = '13px Arial'

        ctx.fillText('Click in the sky to set launch angle and height.', 42, 72)

        ctx.restore()

      },

      [trajectoryPoints]

    )



    const drawCanvas = useCallback(() => {

      const canvas = canvasRef.current

      if (!canvas) return



      const ctx = canvas.getContext('2d')

      if (!ctx) return



      ctx.clearRect(0, 0, width, height)



      drawBackground(ctx)

      drawWind(ctx)

      drawGrid(ctx)

      drawAxes(ctx)

      drawLauncher(ctx)

      drawInfo(ctx)

      drawInteractionHint(ctx)



      if (idealTrajectoryPoints.length > 0) {

        const idealVisibleCount = Math.min(

          Math.floor(progressRef.current * (idealTrajectoryPoints.length - 1)),

          idealTrajectoryPoints.length - 1

        )

        drawTrajectory(ctx, idealTrajectoryPoints, idealVisibleCount, '#ec4899', true)

      }



      if (trajectoryPoints.length > 0) {

        const visibleCount = getVisibleIndex()

        drawTrajectory(ctx, trajectoryPoints, visibleCount, '#2563eb', false)

        drawTrail(ctx, trajectoryPoints, visibleCount)

        drawProjectile(ctx, trajectoryPoints, visibleCount)

        drawVectors(ctx, trajectoryPoints, visibleCount)

        drawLabReadout(ctx, trajectoryPoints, visibleCount)

        drawTarget(ctx)

      }

    }, [

      width,

      height,

      trajectoryPoints,

      idealTrajectoryPoints,

      drawBackground,

      drawWind,

      drawGrid,

      drawAxes,

      drawLauncher,

      drawInfo,

      drawInteractionHint,

      drawTrajectory,

      drawTrail,

      drawProjectile,

      drawVectors,

      drawLabReadout,

      drawTarget,

      getVisibleIndex

    ])



    const animate = useCallback(

      (timestamp) => {

        if (pausedRef.current) return



        if (animationStartTimeRef.current === null) {

          animationStartTimeRef.current = timestamp - progressRef.current * PLAYBACK_DURATION_MS

        }



        const elapsed = timestamp - animationStartTimeRef.current

        const progress = Math.min(elapsed / PLAYBACK_DURATION_MS, 1)

        progressRef.current = progress



        drawCanvas()



        if (progress < 1) {

          animationId.current = requestAnimationFrame((nextTimestamp) => {

            if (animateRef.current) animateRef.current(nextTimestamp)

          })

        } else {

          animationId.current = null

          if (!completedRef.current) {

            completedRef.current = true

            onAnimationComplete?.()

          }

        }

      },

      [drawCanvas, onAnimationComplete]

    )



    useEffect(() => {

      animateRef.current = animate

    }, [animate])



    const resetAnimation = useCallback(() => {

      if (animationId.current) {

        cancelAnimationFrame(animationId.current)

        animationId.current = null

      }



      animationStartTimeRef.current = null

      progressRef.current = 0

      completedRef.current = false

      pausedRef.current = false

      drawCanvas()

    }, [drawCanvas])



    useImperativeHandle(

      ref,

      () => ({

        resetAnimation,

        pauseAnimation: () => {

          pausedRef.current = true

          if (animationId.current) {

            cancelAnimationFrame(animationId.current)

            animationId.current = null

          }

        },

        resumeAnimation: () => {

          if (!trajectoryPoints.length) return

          pausedRef.current = false

          animationStartTimeRef.current = performance.now() - progressRef.current * PLAYBACK_DURATION_MS

          if (animationId.current) cancelAnimationFrame(animationId.current)

          animationId.current = requestAnimationFrame((timestamp) => {

            if (animateRef.current) animateRef.current(timestamp)

          })

        },

        restartAnimation: () => {

          if (!trajectoryPoints.length) return

          if (animationId.current) cancelAnimationFrame(animationId.current)

          animationStartTimeRef.current = null

          progressRef.current = 0

          completedRef.current = false

          pausedRef.current = false

          animationId.current = requestAnimationFrame((timestamp) => {

            if (animateRef.current) animateRef.current(timestamp)

          })

        }

      }),

      [resetAnimation, trajectoryPoints.length]

    )



    useEffect(() => {

      resetAnimation()



      if (trajectoryPoints.length > 0) {

        animationId.current = requestAnimationFrame((timestamp) => {

          if (animateRef.current) animateRef.current(timestamp)

        })

      }



      return () => {

        if (animationId.current) {

          cancelAnimationFrame(animationId.current)

          animationId.current = null

        }

      }

    }, [trajectoryPoints, idealTrajectoryPoints, resetAnimation])



    useEffect(() => {

      drawCanvas()

    }, [drawCanvas])



    const handleCanvasClick = useCallback(

      (event) => {

        if (!onParamChange || trajectoryPoints.length > 0) return



        const canvas = canvasRef.current

        if (!canvas) return



        const rect = canvas.getBoundingClientRect()

        const clickX = event.clientX - rect.left

        const clickY = event.clientY - rect.top



        const { launcherX, barrelBaseY } = getLauncherGeometry()

        const dx = clickX - launcherX

        const dy = barrelBaseY - clickY



        if (dx <= 0) return



        const angle = clamp((Math.atan2(dy, dx) * 180) / Math.PI, 0, 90)

        const { scaleY } = getScale()

        const newHeight = clamp((groundY - clickY) / scaleY, 0, 100)



        onParamChange({

          angle: parseFloat(angle.toFixed(1)),

          initialHeight: parseFloat(newHeight.toFixed(1))

        })

      },

      [onParamChange, trajectoryPoints.length, getLauncherGeometry, getScale, groundY]

    )



    return (

      <div className="canvas-container">

        <canvas

          ref={canvasRef}

          width={width}

          height={height}

          className="simulation-canvas"

          onClick={handleCanvasClick}

        />

        {trajectoryPoints.length === 0 && (

          <div className="canvas-placeholder">

            <p>Set your values and click “Calculate”</p>

          </div>

        )}

      </div>

    )

  }

)



CanvasArea.displayName = 'CanvasArea'



export default CanvasArea

