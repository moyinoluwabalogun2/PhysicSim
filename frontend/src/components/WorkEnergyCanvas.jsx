import React, {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle
} from 'react'
import '../styles/canvas.css'

const PLAYBACK_DURATION_MS = 7000
const SPRING_PRELOAD_RATIO = 0.28

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

const getMassScale = (mass = 5, min = 0.8, max = 1.75) => {
  const scale = 0.82 + Math.sqrt(Math.max(mass, 1)) / 18
  return clamp(scale, min, max)
}

const drawCloud = (ctx, x, y, scale = 1) => {
  ctx.beginPath()
  ctx.arc(x, y, 18 * scale, 0, 2 * Math.PI)
  ctx.arc(x + 20 * scale, y - 8 * scale, 24 * scale, 0, 2 * Math.PI)
  ctx.arc(x + 48 * scale, y, 18 * scale, 0, 2 * Math.PI)
  ctx.fill()
}

const drawLabel = (ctx, x, y, text, width = 220) => {
  ctx.save()
  ctx.fillStyle = 'rgba(255,255,255,0.88)'
  ctx.beginPath()
  ctx.roundRect(x, y, width, 40, 12)
  ctx.fill()
  ctx.strokeStyle = 'rgba(15,23,42,0.12)'
  ctx.stroke()
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 12px Arial'
  ctx.fillText(text, x + 12, y + 24)
  ctx.restore()
}

const drawPerson = (ctx, x, y, color = '#2563eb', pose = 'push') => {
  ctx.save()
  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineWidth = 5
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.arc(x, y - 44, 12, 0, 2 * Math.PI)
  ctx.fill()

  ctx.fillRect(x - 8, y - 30, 16, 36)

  ctx.beginPath()

  if (pose === 'push') {
    ctx.moveTo(x + 6, y - 18)
    ctx.lineTo(x + 34, y - 10)
    ctx.moveTo(x - 6, y - 18)
    ctx.lineTo(x + 14, y - 6)
  } else if (pose === 'pull') {
    ctx.moveTo(x + 6, y - 18)
    ctx.lineTo(x + 30, y - 28)
    ctx.moveTo(x - 6, y - 18)
    ctx.lineTo(x + 8, y - 10)
  } else if (pose === 'drag') {
    ctx.moveTo(x + 6, y - 18)
    ctx.lineTo(x + 24, y - 34)
    ctx.moveTo(x - 6, y - 18)
    ctx.lineTo(x + 2, y - 8)
  } else if (pose === 'lift') {
    ctx.moveTo(x - 6, y - 18)
    ctx.lineTo(x - 24, y - 42)
    ctx.moveTo(x + 6, y - 18)
    ctx.lineTo(x + 24, y - 42)
  } else {
    ctx.moveTo(x - 6, y - 18)
    ctx.lineTo(x - 20, y - 8)
    ctx.moveTo(x + 6, y - 18)
    ctx.lineTo(x + 18, y - 8)
  }

  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x - 4, y + 6)
  ctx.lineTo(x - 16, y + 34)
  ctx.moveTo(x + 4, y + 6)
  ctx.lineTo(x + 16, y + 34)
  ctx.stroke()

  ctx.restore()
}

const drawCrate = (ctx, x, y, mass = 5) => {
  const scale = getMassScale(mass, 0.85, 1.7)
  const w = 86 * scale
  const h = 58 * scale

  ctx.save()
  ctx.fillStyle = '#8b5cf6'
  ctx.strokeStyle = '#6d28d9'
  ctx.lineWidth = 2
  ctx.fillRect(x, y - (h - 58), w, h)
  ctx.strokeRect(x, y - (h - 58), w, h)

  ctx.beginPath()
  ctx.moveTo(x + 8 * scale, y - (h - 58) + 10 * scale)
  ctx.lineTo(x + 78 * scale, y - (h - 58) + 48 * scale)
  ctx.moveTo(x + 78 * scale, y - (h - 58) + 10 * scale)
  ctx.lineTo(x + 8 * scale, y - (h - 58) + 48 * scale)
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 13px Arial'
  ctx.fillText(`${mass}kg`, x + 18 * scale, y - (h - 58) + 34 * scale)
  ctx.restore()
}

const drawSled = (ctx, x, y, mass = 5) => {
  const scale = getMassScale(mass, 0.8, 1.6)

  ctx.save()
  ctx.scale(scale, scale)

  const sx = x / scale
  const sy = y / scale

  ctx.fillStyle = '#06b6d4'
  ctx.beginPath()
  ctx.ellipse(sx + 42, sy + 22, 44, 18, 0, 0, 2 * Math.PI)
  ctx.fill()

  ctx.strokeStyle = '#0f766e'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(sx + 4, sy + 42)
  ctx.lineTo(sx + 80, sy + 42)
  ctx.moveTo(sx + 8, sy + 42)
  ctx.lineTo(sx - 2, sy + 49)
  ctx.moveTo(sx + 76, sy + 42)
  ctx.lineTo(sx + 86, sy + 49)
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 12px Arial'
  ctx.fillText(`${mass}kg`, sx + 24, sy + 26)

  ctx.restore()
}

const drawTrolley = (ctx, x, y, mass = 5) => {
  const scale = getMassScale(mass, 0.8, 1.65)

  ctx.save()
  ctx.scale(scale, scale)

  const sx = x / scale
  const sy = y / scale

  ctx.fillStyle = '#2563eb'
  ctx.fillRect(sx, sy, 82, 36)

  ctx.strokeStyle = '#1e40af'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(sx + 72, sy + 4)
  ctx.lineTo(sx + 96, sy - 18)
  ctx.stroke()

  ctx.fillStyle = '#111827'
  ctx.beginPath()
  ctx.arc(sx + 18, sy + 40, 8, 0, 2 * Math.PI)
  ctx.arc(sx + 64, sy + 40, 8, 0, 2 * Math.PI)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 12px Arial'
  ctx.fillText(`${mass}kg`, sx + 22, sy + 23)

  ctx.restore()
}

const drawSuitcase = (ctx, x, y, mass = 5) => {
  const scale = getMassScale(mass, 0.8, 1.45)

  ctx.save()
  ctx.scale(scale, scale)

  const sx = x / scale
  const sy = y / scale

  ctx.fillStyle = '#f59e0b'
  ctx.fillRect(sx, sy, 56, 44)
  ctx.strokeStyle = '#92400e'
  ctx.lineWidth = 3
  ctx.strokeRect(sx, sy, 56, 44)

  ctx.beginPath()
  ctx.moveTo(sx + 18, sy)
  ctx.lineTo(sx + 18, sy - 16)
  ctx.lineTo(sx + 38, sy - 16)
  ctx.lineTo(sx + 38, sy)
  ctx.stroke()

  ctx.fillStyle = '#111827'
  ctx.beginPath()
  ctx.arc(sx + 14, sy + 48, 4, 0, 2 * Math.PI)
  ctx.arc(sx + 42, sy + 48, 4, 0, 2 * Math.PI)
  ctx.fill()

  ctx.restore()
}

const drawForceArrow = (ctx, x1, y1, x2, y2, color = '#ef4444', label = 'F') => {
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 4
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()

  const angle = Math.atan2(y2 - y1, x2 - x1)
  const head = 10

  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6))
  ctx.closePath()
  ctx.fill()

  ctx.font = 'bold 12px Arial'
  ctx.fillText(label, (x1 + x2) / 2 + 6, (y1 + y2) / 2 - 8)

  ctx.restore()
}

const drawAngleGuide = (ctx, originX, originY, angleDeg) => {
  const angleRad = (angleDeg * Math.PI) / 180

  ctx.save()
  ctx.strokeStyle = '#f59e0b'
  ctx.fillStyle = '#92400e'
  ctx.lineWidth = 2

  ctx.setLineDash([5, 4])
  ctx.beginPath()
  ctx.moveTo(originX, originY)
  ctx.lineTo(originX + 70, originY)
  ctx.stroke()

  ctx.setLineDash([])
  ctx.beginPath()
  ctx.arc(originX, originY, 30, -angleRad, 0)
  ctx.stroke()

  ctx.font = 'bold 12px Arial'
  ctx.fillText(`${angleDeg}°`, originX + 40, originY - 14)

  ctx.restore()
}

const drawVelocityArrow = (ctx, x, y, speedFactor) => {
  const length = 22 + speedFactor * 88
  drawForceArrow(ctx, x, y, x + length, y, '#2563eb', 'velocity')
}

const drawHeightIndicatorToObject = (ctx, objectX, objectY, groundY, label = 'Height') => {
  ctx.save()
  ctx.strokeStyle = '#16a34a'
  ctx.lineWidth = 2
  ctx.setLineDash([5, 4])

  ctx.beginPath()
  ctx.moveTo(objectX, objectY)
  ctx.lineTo(objectX, groundY)
  ctx.stroke()

  ctx.setLineDash([])
  ctx.fillStyle = '#16a34a'
  ctx.beginPath()
  ctx.arc(objectX, objectY, 4, 0, 2 * Math.PI)
  ctx.arc(objectX, groundY, 4, 0, 2 * Math.PI)
  ctx.fill()

  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 12px Arial'
  ctx.fillText(label, objectX + 12, objectY + (groundY - objectY) / 2)

  ctx.restore()
}

const WorkEnergyCanvas = forwardRef(
  ({ mode, params, results, width = 1200, height = 700, onAnimationComplete }, ref) => {
    const canvasRef = useRef(null)
    const animationId = useRef(null)
    const progressRef = useRef(0)
    const animationStartTimeRef = useRef(null)
    const animateRef = useRef(null)
    const completedRef = useRef(false)
    const pausedRef = useRef(false)

    const groundY = height - 110

    const drawBackground = useCallback((ctx) => {
      const skyGradient = ctx.createLinearGradient(0, 0, 0, groundY)
      skyGradient.addColorStop(0, '#dff4ff')
      skyGradient.addColorStop(1, '#b6e3ff')
      ctx.fillStyle = skyGradient
      ctx.fillRect(0, 0, width, groundY)

      ctx.fillStyle = 'rgba(255, 216, 77, 0.95)'
      ctx.beginPath()
      ctx.arc(width - 120, 90, 34, 0, 2 * Math.PI)
      ctx.fill()

      ctx.fillStyle = 'rgba(255,255,255,0.92)'
      drawCloud(ctx, 90, 82, 1.1)
      drawCloud(ctx, 260, 128, 0.9)
      drawCloud(ctx, 470, 78, 1.15)
      drawCloud(ctx, 760, 112, 1)

      const groundGradient = ctx.createLinearGradient(0, groundY, 0, height)
      groundGradient.addColorStop(0, '#6bb957')
      groundGradient.addColorStop(1, '#458937')
      ctx.fillStyle = groundGradient
      ctx.fillRect(0, groundY, width, height - groundY)
    }, [width, groundY, height])

    const drawInfoPanel = useCallback((ctx) => {
      ctx.save()
      ctx.fillStyle = 'rgba(255,255,255,0.84)'
      ctx.beginPath()
      ctx.roundRect(width - 285, 18, 245, 104, 14)
      ctx.fill()
      ctx.strokeStyle = 'rgba(15,23,42,0.12)'
      ctx.stroke()

      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 14px Arial'
      ctx.fillText(`Mode: ${mode.toUpperCase()}`, width - 260, 42)
      ctx.font = '12px Arial'
      ctx.fillText(`Scenario: ${params.scenario}`, width - 260, 66)

      if (mode === 'work') ctx.fillText('Work = force × distance × cos(angle)', width - 260, 90)
      if (mode === 'energy') ctx.fillText('Energy changes form, total stays same', width - 260, 90)
      if (mode === 'power') ctx.fillText('Power = work done ÷ time', width - 260, 90)

      ctx.restore()
    }, [mode, params.scenario, width])

    const drawMovingFloor = useCallback((ctx, progress, distancePx, type = 'road') => {
      const offset = -(progress * distancePx * 0.9) % 80

      if (type === 'snow') {
        ctx.strokeStyle = 'rgba(37,99,235,0.20)'
        ctx.lineWidth = 2
        for (let x = offset - 200; x < width + 200; x += 70) {
          ctx.beginPath()
          ctx.moveTo(x, groundY + 18)
          ctx.lineTo(x + 34, groundY + 28)
          ctx.stroke()
        }
        return
      }

      if (type === 'tiles') {
        ctx.strokeStyle = 'rgba(15,23,42,0.14)'
        ctx.lineWidth = 1.2
        for (let x = offset - 200; x < width + 200; x += 80) {
          ctx.beginPath()
          ctx.moveTo(x, groundY + 6)
          ctx.lineTo(x, height)
          ctx.stroke()
        }
        return
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.55)'
      ctx.lineWidth = 3
      for (let x = offset - 200; x < width + 200; x += 90) {
        ctx.beginPath()
        ctx.moveTo(x, groundY + 22)
        ctx.lineTo(x + 42, groundY + 22)
        ctx.stroke()
      }
    }, [width, groundY, height])

    const drawMetalMeterRule = useCallback((ctx, distanceValue, startX = 180) => {
      const maxDisplayDistance = Math.max(distanceValue, 20)
      const availableRight = width - 95
      const rulerWidth = availableRight - startX
      const rulerY = groundY + 38
      const rulerH = 18
      const markerCount = 10

      const gradient = ctx.createLinearGradient(startX, rulerY, startX, rulerY + rulerH)
      gradient.addColorStop(0, '#f8fafc')
      gradient.addColorStop(0.5, '#cbd5e1')
      gradient.addColorStop(1, '#94a3b8')

      ctx.save()
      ctx.fillStyle = gradient
      ctx.fillRect(startX, rulerY, rulerWidth, rulerH)
      ctx.strokeStyle = 'rgba(15,23,42,0.38)'
      ctx.lineWidth = 1.5
      ctx.strokeRect(startX, rulerY, rulerWidth, rulerH)

      for (let i = 0; i <= markerCount; i++) {
        const x = startX + (rulerWidth / markerCount) * i
        const value = ((maxDisplayDistance / markerCount) * i).toFixed(0)
        const tickH = i % 2 === 0 ? 18 : 11

        ctx.beginPath()
        ctx.moveTo(x, rulerY)
        ctx.lineTo(x, rulerY - tickH)
        ctx.stroke()

        ctx.fillStyle = 'rgba(15,23,42,0.75)'
        ctx.font = '10px Arial'
        ctx.fillText(`${value}m`, x - 11, rulerY - 22)
      }

      ctx.restore()
      return rulerWidth / maxDisplayDistance
    }, [width, groundY])

    const drawWorkScene = useCallback((ctx) => {
      const rawProgress = results ? progressRef.current : 0
      const progress = easeInOutCubic(rawProgress)
      const distanceValue = results?.distance || params.distance || 10
      const scale = drawMetalMeterRule(ctx, distanceValue, 180)

      const startX = 220
      const travel = distanceValue * scale
      const objectX = startX + travel * progress
      const objectY = groundY - 58
      const angleDeg = params.angle || 0
      const angleRad = (angleDeg * Math.PI) / 180

      ctx.save()
      ctx.fillStyle = 'rgba(220,38,38,0.14)'
      ctx.fillRect(startX + travel - 3, groundY - 88, 6, 96)
      ctx.fillStyle = '#991b1b'
      ctx.font = 'bold 12px Arial'
      ctx.fillText(`${distanceValue}m stop`, startX + travel - 34, groundY - 96)
      ctx.restore()

      if (params.scenario === 'push-crate') {
        ctx.fillStyle = '#d1d5db'
        ctx.fillRect(0, groundY + 6, width, height - groundY - 6)
        drawMovingFloor(ctx, progress, travel, 'tiles')

        drawPerson(ctx, objectX - 44, objectY + 20, '#2563eb', 'push')
        drawCrate(ctx, objectX, objectY, params.mass)

        drawForceArrow(ctx, objectX - 8, objectY - 22, objectX + 92, objectY - 22, '#ef4444', 'applied force')
        drawAngleGuide(ctx, objectX - 8, objectY - 22, angleDeg)
        drawLabel(ctx, objectX - 34, objectY - 116, 'Work happens because force moves the crate.', 285)
      } else if (params.scenario === 'pull-sled') {
        ctx.fillStyle = '#e0f2fe'
        ctx.fillRect(0, groundY + 6, width, height - groundY - 6)
        drawMovingFloor(ctx, progress, travel, 'snow')

        const sledX = objectX
        const sledY = objectY + 8
        const personX = sledX - 120
        const personY = objectY + 18

        drawPerson(ctx, personX, personY, '#16a34a', 'pull')
        drawSled(ctx, sledX, sledY, params.mass)

        const ropeStartX = sledX + 8
        const ropeStartY = sledY + 12
        const ropeEndX = personX + 22
        const ropeEndY = personY - 12

        ctx.strokeStyle = '#8b5cf6'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(ropeStartX, ropeStartY)
        ctx.lineTo(ropeEndX, ropeEndY)
        ctx.stroke()

        drawForceArrow(
          ctx,
          ropeStartX,
          ropeStartY,
          ropeStartX + Math.cos(angleRad) * 86,
          ropeStartY - Math.sin(angleRad) * 58,
          '#ef4444',
          'pull force'
        )
        drawAngleGuide(ctx, ropeStartX, ropeStartY, angleDeg)
        drawLabel(ctx, personX - 10, objectY - 116, 'Pulling uses an angled force through the rope.', 300)
      } else if (params.scenario === 'drag-suitcase') {
        ctx.fillStyle = '#f3f4f6'
        ctx.fillRect(0, groundY + 6, width, height - groundY - 6)
        drawMovingFloor(ctx, progress, travel, 'tiles')

        const personX = objectX - 18
        const personY = objectY + 16
        const suitcaseX = personX + 54
        const suitcaseY = objectY + 12
        const handleTopX = suitcaseX + 28
        const handleTopY = suitcaseY - 24

        drawPerson(ctx, personX, personY, '#2563eb', 'drag')
        drawSuitcase(ctx, suitcaseX, suitcaseY, params.mass)

        ctx.strokeStyle = '#92400e'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(suitcaseX + 18, suitcaseY)
        ctx.lineTo(handleTopX, handleTopY)
        ctx.lineTo(suitcaseX + 42, suitcaseY)
        ctx.stroke()

        ctx.strokeStyle = '#2563eb'
        ctx.lineWidth = 5
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(personX + 8, personY - 18)
        ctx.lineTo(handleTopX, handleTopY)
        ctx.stroke()

        drawForceArrow(
          ctx,
          suitcaseX + 20,
          suitcaseY - 34,
          suitcaseX + 105,
          suitcaseY - 34,
          '#22c55e',
          'motion direction'
        )

        drawForceArrow(
          ctx,
          suitcaseX + 24,
          suitcaseY - 6,
          suitcaseX + 24 + Math.cos(angleRad) * 86,
          suitcaseY - 6 - Math.sin(angleRad) * 60,
          '#ef4444',
          'pulling force'
        )

        ctx.save()
        ctx.strokeStyle = '#f59e0b'
        ctx.fillStyle = '#92400e'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 4])

        ctx.beginPath()
        ctx.moveTo(suitcaseX + 24, suitcaseY - 6)
        ctx.lineTo(suitcaseX + 105, suitcaseY - 6)
        ctx.stroke()

        ctx.setLineDash([])
        ctx.beginPath()
        ctx.arc(suitcaseX + 24, suitcaseY - 6, 34, -angleRad, 0)
        ctx.stroke()

        ctx.font = 'bold 12px Arial'
        ctx.fillText(`${angleDeg}°`, suitcaseX + 62, suitcaseY - 14)
        ctx.fillText('only the forward part does work', suitcaseX + 42, suitcaseY - 56)
        ctx.restore()

        drawLabel(
          ctx,
          personX - 50,
          objectY - 122,
          'The person drags the travel bag beside them. The force is angled.',
          355
        )
      } else {
        ctx.fillStyle = '#4b5563'
        ctx.fillRect(0, groundY + 6, width, height - groundY - 6)
        drawMovingFloor(ctx, progress, travel, 'road')

        ctx.strokeStyle = '#f8fafc'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(0, groundY + 12)
        ctx.lineTo(width, groundY + 12)
        ctx.stroke()

        drawPerson(ctx, objectX - 58, objectY + 18, '#2563eb', 'push')
        drawTrolley(ctx, objectX, objectY + 14, params.mass)
        drawForceArrow(ctx, objectX - 8, objectY - 16, objectX + 98, objectY - 16, '#ef4444', 'push force')
        drawAngleGuide(ctx, objectX - 8, objectY - 16, angleDeg)
        drawLabel(ctx, objectX - 48, objectY - 116, 'More force over distance means more work.', 275)
      }
    }, [results, params, groundY, width, height, drawMetalMeterRule, drawMovingFloor])

    const drawEnergyBars = useCallback((ctx) => {
      if (mode !== 'energy') return

      const panelX = 32
      const panelY = 30
      const barHeight = 160
      const barWidth = 30

      ctx.save()
      ctx.fillStyle = 'rgba(255,255,255,0.84)'
      ctx.beginPath()
      ctx.roundRect(panelX - 14, panelY - 10, 225, 220, 14)
      ctx.fill()
      ctx.strokeStyle = 'rgba(15,23,42,0.12)'
      ctx.stroke()

      let pe = 0
      let ke = 0
      let total = results?.total_energy || params.mass * params.gravity * params.height || 1

      if (params.scenario === 'spring-launch') {
        total = results?.total_energy || 0.5 * params.springConstant * params.compression ** 2
        const launchPhase =
          progressRef.current < SPRING_PRELOAD_RATIO
            ? 0
            : (progressRef.current - SPRING_PRELOAD_RATIO) / (1 - SPRING_PRELOAD_RATIO)

        pe = total * (1 - launchPhase)
        ke = total - pe
      } else {
        const currentHeight = (params.height || 0) * (1 - progressRef.current)
        pe = (params.mass || 1) * (params.gravity || 9.81) * currentHeight
        ke = total - pe
      }

      pe = Math.max(0, pe)
      ke = Math.max(0, ke)
      total = Math.max(0, total)

      const maxValue = Math.max(total, 1)

      const drawBar = (x, value, color, label) => {
        const filled = (value / maxValue) * barHeight

        ctx.fillStyle = 'rgba(15,23,42,0.08)'
        ctx.fillRect(x, panelY + 20, barWidth, barHeight)

        ctx.fillStyle = color
        ctx.fillRect(x, panelY + 20 + (barHeight - filled), barWidth, filled)

        ctx.fillStyle = '#0f172a'
        ctx.font = 'bold 12px Arial'
        ctx.fillText(label, x - 4, panelY + 198)
      }

      drawBar(panelX, pe, '#16a34a', params.scenario === 'spring-launch' ? 'SE' : 'PE')
      drawBar(panelX + 68, ke, '#2563eb', 'KE')
      drawBar(panelX + 136, total, '#f59e0b', 'Total')

      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 12px Arial'
      ctx.fillText('Energy transfer', panelX, panelY + 4)

      ctx.restore()
    }, [mode, results, params])

    const drawEnergyScene = useCallback((ctx) => {
      const progress = results ? progressRef.current : 0

      if (params.scenario === 'spring-launch') {
        const launchProgress =
          progress < SPRING_PRELOAD_RATIO
            ? 0
            : (progress - SPRING_PRELOAD_RATIO) / (1 - SPRING_PRELOAD_RATIO)

        const trackY = groundY - 26
        const wallX = 110
        const ballRadius = clamp(12 + Math.sqrt(params.mass) * 2, 14, 32)
        const compressionPx = clamp((params.compression || 1) * 34, 22, 150)
        const springStart = wallX + 18
        const uncompressedEnd = 270
        const compressedEnd = uncompressedEnd - compressionPx
        const springEnd = progress < SPRING_PRELOAD_RATIO ? compressedEnd : uncompressedEnd
        const ballRestX = springEnd + ballRadius + 2
        const ballX = ballRestX + easeInOutCubic(launchProgress) * 400

        ctx.strokeStyle = '#64748b'
        ctx.lineWidth = 6
        ctx.beginPath()
        ctx.moveTo(100, trackY + 18)
        ctx.lineTo(width - 100, trackY + 18)
        ctx.stroke()

        ctx.fillStyle = '#6b7280'
        ctx.fillRect(wallX, trackY - 8, 18, 54)

        ctx.strokeStyle = '#dc2626'
        ctx.lineWidth = 4
        ctx.beginPath()
        const segments = 12
        for (let i = 0; i <= segments; i++) {
          const x = springStart + ((springEnd - springStart) / segments) * i
          const yy =
            i === 0 || i === segments
              ? trackY + 18
              : i % 2 === 0
                ? trackY + 4
                : trackY + 32

          if (i === 0) ctx.moveTo(x, yy)
          else ctx.lineTo(x, yy)
        }
        ctx.stroke()

        ctx.fillStyle = '#f59e0b'
        ctx.beginPath()
        ctx.arc(ballX, trackY + 6, ballRadius, 0, 2 * Math.PI)
        ctx.fill()

        drawLabel(
          ctx,
          310,
          trackY - 96,
          progress < SPRING_PRELOAD_RATIO
            ? 'Spring is compressed. Energy is stored.'
            : 'Spring energy changes into kinetic energy.',
          330
        )

        if (launchProgress > 0) drawVelocityArrow(ctx, ballX - 12, trackY - 38, launchProgress)
        return
      }

      if (params.scenario === 'ball-ramp') {
        const rampStartX = 210
        const rampBottomX = width - 260
        const initialHeight = params.height || 0
        const rampHeightPx = clamp(initialHeight * 7, 80, groundY - 160)
        const rampTopY = groundY - rampHeightPx
        const rampBottomY = groundY
        const smooth = easeInOutCubic(progress)
        const ballRadius = clamp(12 + Math.sqrt(params.mass) * 1.8, 14, 30)

        ctx.fillStyle = '#c08457'
        ctx.beginPath()
        ctx.moveTo(rampStartX - 30, rampTopY + 18)
        ctx.lineTo(rampBottomX, rampBottomY + 10)
        ctx.lineTo(rampBottomX + 30, rampBottomY + 44)
        ctx.lineTo(rampStartX - 42, rampTopY + 48)
        ctx.closePath()
        ctx.fill()

        ctx.strokeStyle = '#8b5e3c'
        ctx.lineWidth = 7
        ctx.beginPath()
        ctx.moveTo(rampStartX, rampTopY)
        ctx.lineTo(rampBottomX, rampBottomY)
        ctx.stroke()

        const objectX = rampStartX + (rampBottomX - rampStartX) * smooth
        const objectY = rampTopY + (rampBottomY - rampTopY) * smooth - ballRadius

        ctx.fillStyle = '#2563eb'
        ctx.beginPath()
        ctx.arc(objectX, objectY, ballRadius, 0, 2 * Math.PI)
        ctx.fill()

        drawHeightIndicatorToObject(ctx, objectX, objectY, rampBottomY, 'height')
        drawVelocityArrow(ctx, objectX - 8, objectY - 38, smooth)
        drawLabel(ctx, objectX - 80, objectY - 92, smooth < 0.5 ? 'Top: PE high, KE low.' : 'Bottom: KE high, PE low.', 230)
        return
      }

      const hillStartX = 140
      const hillPeakX = width * 0.42
      const hillEndX = width - 250
      const hillHeightPx = clamp((params.height || 0) * 7, 90, groundY - 160)
      const hillPeakY = groundY - hillHeightPx

      ctx.fillStyle = '#7c5a3a'
      ctx.beginPath()
      ctx.moveTo(90, groundY)
      ctx.quadraticCurveTo(220, groundY - 12, hillPeakX, hillPeakY)
      ctx.quadraticCurveTo(width * 0.62, hillPeakY + 80, hillEndX, groundY)
      ctx.lineTo(90, groundY)
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = '#5b4630'
      ctx.lineWidth = 7
      ctx.beginPath()
      ctx.moveTo(hillStartX, groundY - 8)
      ctx.quadraticCurveTo(220, groundY - 20, hillPeakX, hillPeakY - 8)
      ctx.quadraticCurveTo(width * 0.62, hillPeakY + 72, hillEndX, groundY - 8)
      ctx.stroke()

      let cartX
      let cartY

      if (progress <= 0.5) {
        const localT = easeInOutCubic(progress / 0.5)
        cartX = hillStartX + (hillPeakX - hillStartX) * localT
        cartY = groundY - 44 - (groundY - hillPeakY) * localT
      } else {
        const localT = easeInOutCubic((progress - 0.5) / 0.5)
        cartX = hillPeakX + (hillEndX - hillPeakX) * localT
        cartY = hillPeakY - 44 + (groundY - hillPeakY) * localT
      }

      drawTrolley(ctx, cartX - 40, cartY, params.mass)
      drawHeightIndicatorToObject(ctx, cartX, cartY + 18, groundY, 'height')
      drawVelocityArrow(ctx, cartX - 8, cartY - 34, progress)
      drawLabel(ctx, cartX - 80, cartY - 100, progress < 0.5 ? 'Going up: PE increases.' : 'Coming down: KE increases.', 240)
    }, [results, params, groundY, width])

    const drawPowerScene = useCallback((ctx) => {
      const progress = results ? progressRef.current : 0
      const smooth = easeInOutCubic(progress)

      if (params.scenario === 'small-car' || params.scenario === 'sports-car') {
        const distanceFactor = params.scenario === 'sports-car' ? 1.25 : 0.62
        const roadTravel = 520 * distanceFactor
        const carX = 140 + smooth * roadTravel
        const carColor = params.scenario === 'sports-car' ? '#ef4444' : '#2563eb'

        ctx.fillStyle = '#4b5563'
        ctx.fillRect(0, groundY + 6, width, height - groundY - 6)
        drawMovingFloor(ctx, smooth, roadTravel, 'road')

        ctx.strokeStyle = '#f8fafc'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(0, groundY + 14)
        ctx.lineTo(width, groundY + 14)
        ctx.stroke()

        ctx.fillStyle = carColor
        ctx.beginPath()

        if (params.scenario === 'sports-car') {
          ctx.roundRect(carX, groundY - 38, 130, 34, 14)
          ctx.fill()
          ctx.fillRect(carX + 36, groundY - 62, 46, 20)
          ctx.fillStyle = '#fecaca'
          ctx.fillRect(carX + 44, groundY - 57, 24, 11)

          ctx.fillStyle = '#f97316'
          ctx.beginPath()
          ctx.moveTo(carX - 18, groundY - 20)
          ctx.lineTo(carX - 42, groundY - 30)
          ctx.lineTo(carX - 18, groundY - 10)
          ctx.closePath()
          ctx.fill()
        } else {
          ctx.roundRect(carX, groundY - 34, 108, 32, 12)
          ctx.fill()
          ctx.fillRect(carX + 18, groundY - 54, 52, 20)
          ctx.fillStyle = '#bfdbfe'
          ctx.fillRect(carX + 26, groundY - 49, 24, 10)
        }

        ctx.fillStyle = '#111827'
        ctx.beginPath()
        ctx.arc(carX + 24, groundY + 2, 10, 0, 2 * Math.PI)
        ctx.arc(carX + 88, groundY + 2, 10, 0, 2 * Math.PI)
        ctx.fill()

        drawLabel(
          ctx,
          width - 330,
          height - 154,
          params.scenario === 'sports-car'
            ? 'Sports car: same kind of work, shorter time, higher power.'
            : 'Small car: longer time, lower power.',
          280
        )
        return
      }

      const liftX = 250
      const liftBaseY = groundY - 4
      const liftHeightPx = clamp((params.height || 3) * 7, 55, 280)
      const smoothLift = smooth
      const boxScale = getMassScale(params.mass, 0.85, 1.8)
      const boxW = 58 * boxScale
      const boxH = 40 * boxScale

      const platformW = boxW + 44
      const platformH = 14
      const railTopY = liftBaseY - liftHeightPx - 70
      const platformStartY = liftBaseY - platformH
      const platformY = platformStartY - liftHeightPx * smoothLift

      ctx.fillStyle = '#d1d5db'
      ctx.fillRect(0, groundY + 6, width, height - groundY - 6)

      ctx.strokeStyle = '#334155'
      ctx.lineWidth = 8
      ctx.lineCap = 'round'

      ctx.beginPath()
      ctx.moveTo(liftX, liftBaseY)
      ctx.lineTo(liftX, railTopY)
      ctx.moveTo(liftX + 190, liftBaseY)
      ctx.lineTo(liftX + 190, railTopY)
      ctx.stroke()

      ctx.strokeStyle = '#475569'
      ctx.lineWidth = 10
      ctx.beginPath()
      ctx.moveTo(liftX - 20, railTopY)
      ctx.lineTo(liftX + 210, railTopY)
      ctx.stroke()

      ctx.fillStyle = '#0f172a'
      ctx.beginPath()
      ctx.arc(liftX + 95, railTopY + 10, 18, 0, 2 * Math.PI)
      ctx.fill()
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 4
      ctx.stroke()

      ctx.strokeStyle = '#111827'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(liftX + 95, railTopY + 28)
      ctx.lineTo(liftX + 95, platformY)
      ctx.stroke()

      ctx.fillStyle = '#64748b'
      ctx.beginPath()
      ctx.roundRect(liftX + 95 - platformW / 2, platformY, platformW, platformH, 6)
      ctx.fill()

      ctx.fillStyle = params.scenario === 'lift-fast' ? '#16a34a' : '#f59e0b'
      ctx.fillRect(liftX + 95 - boxW / 2, platformY - boxH, boxW, boxH)
      ctx.strokeStyle = 'rgba(15,23,42,0.25)'
      ctx.strokeRect(liftX + 95 - boxW / 2, platformY - boxH, boxW, boxH)

      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 12px Arial'
      ctx.fillText(`${params.mass}kg`, liftX + 82, platformY - boxH / 2)

      ctx.fillStyle = '#1e293b'
      ctx.beginPath()
      ctx.roundRect(liftX + 230, railTopY - 10, 90, 56, 10)
      ctx.fill()

      ctx.fillStyle = '#e2e8f0'
      ctx.font = 'bold 13px Arial'
      ctx.fillText('Motor', liftX + 254, railTopY + 22)

      ctx.strokeStyle = params.scenario === 'lift-fast' ? '#22c55e' : '#f59e0b'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(liftX + 230, railTopY + 18)
      ctx.lineTo(liftX + 115, railTopY + 18)
      ctx.stroke()

      drawHeightIndicatorToObject(
        ctx,
        liftX + 180,
        platformY - boxH / 2,
        liftBaseY,
        `${params.height}m`
      )

      drawForceArrow(
        ctx,
        liftX + 95,
        platformY + 22,
        liftX + 95,
        platformY - 62,
        params.scenario === 'lift-fast' ? '#22c55e' : '#f59e0b',
        'lift force'
      )

      drawLabel(
        ctx,
        liftX + 250,
        railTopY + 70,
        params.scenario === 'lift-fast'
          ? 'Fast lift: same load raised in less time, so power is higher.'
          : 'The motor lift raises the load from the ground to a height.',
        360
      )
    }, [results, params, groundY, width, height, drawMovingFloor])

    const drawCanvas = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, width, height)
      drawBackground(ctx)
      drawInfoPanel(ctx)

      if (mode === 'work') drawWorkScene(ctx)
      if (mode === 'energy') {
        drawEnergyScene(ctx)
        drawEnergyBars(ctx)
      }
      if (mode === 'power') drawPowerScene(ctx)
    }, [
      width,
      height,
      mode,
      drawBackground,
      drawInfoPanel,
      drawWorkScene,
      drawEnergyScene,
      drawEnergyBars,
      drawPowerScene
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
          if (!results) return
          pausedRef.current = false
          animationStartTimeRef.current =
            performance.now() - progressRef.current * PLAYBACK_DURATION_MS

          if (animationId.current) cancelAnimationFrame(animationId.current)

          animationId.current = requestAnimationFrame((timestamp) => {
            if (animateRef.current) animateRef.current(timestamp)
          })
        },
        restartAnimation: () => {
          if (!results) return
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
      [resetAnimation, results]
    )

    useEffect(() => {
      resetAnimation()

      if (results) {
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
    }, [results, mode, params, resetAnimation])

    return (
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="simulation-canvas"
        />

        {!results && (
          <div className="canvas-placeholder">
            <p>Choose a mode, set the values, and click “Calculate”</p>
          </div>
        )}
      </div>
    )
  }
)

WorkEnergyCanvas.displayName = 'WorkEnergyCanvas'

export default WorkEnergyCanvas