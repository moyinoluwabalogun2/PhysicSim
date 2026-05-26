import React, {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle
} from 'react'
import '../styles/canvas.css'

const PLAYBACK_DURATION_MS = 7000

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

const massScale = (mass = 5, min = 0.75, max = 1.65) =>
  clamp(0.75 + Math.sqrt(Math.max(mass, 0.1)) / 16, min, max)

const drawCloud = (ctx, x, y, scale = 1) => {
  ctx.beginPath()
  ctx.arc(x, y, 18 * scale, 0, 2 * Math.PI)
  ctx.arc(x + 20 * scale, y - 8 * scale, 24 * scale, 0, 2 * Math.PI)
  ctx.arc(x + 48 * scale, y, 18 * scale, 0, 2 * Math.PI)
  ctx.fill()
}

const drawLabel = (ctx, x, y, text, width = 260) => {
  const words = text.split(' ')
  const lines = []
  let line = ''

  ctx.save()
  ctx.font = 'bold 12px Arial'

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word

    if (ctx.measureText(testLine).width > width - 24) {
      if (line) lines.push(line)
      line = word
    } else {
      line = testLine
    }
  })

  if (line) lines.push(line)

  const height = 22 + lines.length * 16

  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, 12)
  ctx.fill()
  ctx.strokeStyle = 'rgba(15,23,42,0.12)'
  ctx.stroke()

  ctx.fillStyle = '#0f172a'
  lines.forEach((item, index) => {
    ctx.fillText(item, x + 12, y + 22 + index * 16)
  })

  ctx.restore()
}

const drawObjectLabel = (ctx, x, y, lines = []) => {
  const width = 120
  const height = 18 + lines.length * 15

  ctx.save()
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.beginPath()
  ctx.roundRect(x - width / 2, y - height / 2, width, height, 10)
  ctx.fill()
  ctx.strokeStyle = 'rgba(15,23,42,0.12)'
  ctx.stroke()
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 11px Arial'

  lines.forEach((line, index) => {
    ctx.fillText(line, x - width / 2 + 10, y - height / 2 + 16 + index * 15)
  })

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
  } else if (pose === 'throw') {
    ctx.moveTo(x + 6, y - 18)
    ctx.lineTo(x + 34, y - 44)
    ctx.moveTo(x - 6, y - 18)
    ctx.lineTo(x - 20, y - 8)
  } else if (pose === 'recoil') {
    ctx.moveTo(x + 6, y - 18)
    ctx.lineTo(x + 34, y - 22)
    ctx.moveTo(x - 6, y - 18)
    ctx.lineTo(x - 24, y - 24)
  } else {
    ctx.moveTo(x - 6, y - 18)
    ctx.lineTo(x - 18, y - 6)
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

const drawArrow = (ctx, x1, y1, x2, y2, color, label) => {
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
  ctx.lineTo(
    x2 - head * Math.cos(angle - Math.PI / 6),
    y2 - head * Math.sin(angle - Math.PI / 6)
  )
  ctx.lineTo(
    x2 - head * Math.cos(angle + Math.PI / 6),
    y2 - head * Math.sin(angle + Math.PI / 6)
  )
  ctx.closePath()
  ctx.fill()

  if (label) {
    ctx.font = 'bold 12px Arial'
    ctx.fillText(label, (x1 + x2) / 2 + 4, (y1 + y2) / 2 - 10)
  }

  ctx.restore()
}

const drawWheel = (ctx, x, y, r = 8) => {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, 2 * Math.PI)
  ctx.fill()
}

const drawShoppingCart = (ctx, x, y, mass = 10) => {
  const s = massScale(mass, 0.78, 1.45)

  ctx.save()
  ctx.scale(s, s)

  const sx = x / s
  const sy = y / s

  ctx.strokeStyle = '#0f766e'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(sx, sy)
  ctx.lineTo(sx + 22, sy + 42)
  ctx.lineTo(sx + 94, sy + 42)
  ctx.lineTo(sx + 110, sy + 6)
  ctx.lineTo(sx + 18, sy + 6)
  ctx.stroke()

  ctx.strokeStyle = '#14b8a6'
  ctx.lineWidth = 2
  for (let i = 0; i < 5; i++) {
    ctx.beginPath()
    ctx.moveTo(sx + 24 + i * 14, sy + 9)
    ctx.lineTo(sx + 30 + i * 12, sy + 40)
    ctx.stroke()
  }

  ctx.fillStyle = '#111827'
  drawWheel(ctx, sx + 30, sy + 52, 8)
  drawWheel(ctx, sx + 88, sy + 52, 8)

  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 12px Arial'
  ctx.fillText(`${mass}kg`, sx + 38, sy + 31)

  ctx.restore()
}

const drawTrolley = (ctx, x, y, mass = 10, color = '#7c3aed') => {
  const s = massScale(mass, 0.78, 1.55)

  ctx.save()
  ctx.scale(s, s)

  const sx = x / s
  const sy = y / s

  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(sx, sy, 92, 42, 8)
  ctx.fill()

  ctx.fillStyle = '#111827'
  drawWheel(ctx, sx + 20, sy + 50, 8)
  drawWheel(ctx, sx + 72, sy + 50, 8)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 12px Arial'
  ctx.fillText(`${mass}kg`, sx + 28, sy + 26)

  ctx.restore()
}

const drawBumperCar = (ctx, x, y, mass = 10, color = '#ef4444', facing = 'right') => {
  const s = massScale(mass, 0.78, 1.55)

  ctx.save()
  ctx.translate(x, y)
  ctx.scale(facing === 'left' ? -s : s, s)

  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(0, 0, 100, 42, 14)
  ctx.fill()

  ctx.fillStyle = '#111827'
  ctx.beginPath()
  ctx.roundRect(72, 8, 20, 18, 6)
  ctx.fill()

  ctx.strokeStyle = '#111827'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(50, -10, 10, 0, 2 * Math.PI)
  ctx.stroke()

  ctx.fillStyle = '#111827'
  drawWheel(ctx, 18, 47, 7)
  drawWheel(ctx, 82, 47, 7)

  ctx.restore()
}

const drawBowlingBall = (ctx, x, y, radius = 18) => {
  ctx.save()
  ctx.fillStyle = '#1f2937'
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI)
  ctx.fill()

  ctx.fillStyle = '#020617'
  ;[
    { x: -4, y: -4 },
    { x: 4, y: -1 },
    { x: 0, y: 5 }
  ].forEach((p) => {
    ctx.beginPath()
    ctx.arc(x + p.x, y + p.y, Math.max(2, radius * 0.12), 0, 2 * Math.PI)
    ctx.fill()
  })

  ctx.restore()
}

const drawGun = (ctx, x, y) => {
  ctx.save()
  ctx.fillStyle = '#374151'
  ctx.beginPath()
  ctx.roundRect(x, y, 58, 12, 3)
  ctx.fill()
  ctx.fillRect(x + 8, y + 10, 14, 25)
  ctx.fillStyle = '#111827'
  ctx.fillRect(x + 48, y + 3, 26, 6)
  ctx.restore()
}

const drawCannon = (ctx, x, y) => {
  ctx.save()

  ctx.fillStyle = '#334155'
  ctx.beginPath()
  ctx.roundRect(x, y, 88, 24, 10)
  ctx.fill()

  ctx.fillStyle = '#111827'
  ctx.fillRect(x + 74, y + 6, 28, 12)

  ctx.fillStyle = '#1f2937'
  drawWheel(ctx, x + 18, y + 32, 13)
  drawWheel(ctx, x + 68, y + 32, 13)

  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(x + 18, y + 24)
  ctx.lineTo(x + 68, y + 24)
  ctx.stroke()

  ctx.restore()
}

const MomentumCanvas = forwardRef(
  (
    {
      mode,
      params,
      results,
      width = 1200,
      height = 700,
      onAnimationComplete,
      onParamChange
    },
    ref
  ) => {
    const canvasRef = useRef(null)
    const animationId = useRef(null)
    const animationStartTimeRef = useRef(null)
    const progressRef = useRef(0)
    const pausedRef = useRef(false)
    const completedRef = useRef(false)
    const animateRef = useRef(null)

    const dragRef = useRef({ active: false, target: null })

    const groundY = height - 110

    const getCanvasPoint = useCallback((event) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }

      const rect = canvas.getBoundingClientRect()

      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }
    }, [])

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

      ctx.fillStyle = '#74b65b'
      ctx.fillRect(0, groundY, width, height - groundY)
    }, [width, groundY, height])

    const drawInfoPanel = useCallback((ctx) => {
      ctx.save()
      ctx.fillStyle = 'rgba(255,255,255,0.84)'
      ctx.beginPath()
      ctx.roundRect(width - 292, 18, 252, 128, 14)
      ctx.fill()
      ctx.strokeStyle = 'rgba(15,23,42,0.12)'
      ctx.stroke()

      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 14px Arial'
      ctx.fillText(`Mode: ${mode.toUpperCase()}`, width - 266, 42)
      ctx.font = '12px Arial'
      ctx.fillText(`Scenario: ${params.scenario}`, width - 266, 66)

      if (mode === 'momentum') {
        ctx.fillText('Momentum = mass × velocity', width - 266, 90)
      } else if (mode === 'collision') {
        ctx.fillText(`${params.collisionType}: compare before & after`, width - 266, 90)
      } else {
        ctx.fillText('Recoil: opposite momentum reaction', width - 266, 90)
      }

      if (results && mode === 'momentum') {
        ctx.fillText(`p = ${results.momentum1} kg·m/s`, width - 266, 116)
      }

      if (results && mode === 'collision') {
        ctx.fillText(`before = ${results.initial_momentum}`, width - 266, 116)
        ctx.fillText(`after = ${results.final_momentum}`, width - 266, 134)
      }

      if (results && mode === 'recoil') {
        ctx.fillText(`final p = ${results.final_momentum}`, width - 266, 116)
      }

      ctx.restore()
    }, [mode, params.scenario, params.collisionType, results, width])

    const drawMovingFloor = useCallback((ctx, progress, distancePx, style = 'road') => {
      const offset = -(progress * distancePx * 0.9) % 80

      if (style === 'road') {
        ctx.fillStyle = '#4b5563'
        ctx.fillRect(0, groundY + 6, width, height - groundY - 6)

        ctx.strokeStyle = 'rgba(255,255,255,0.55)'
        ctx.lineWidth = 3

        for (let x = offset - 160; x < width + 160; x += 90) {
          ctx.beginPath()
          ctx.moveTo(x, groundY + 24)
          ctx.lineTo(x + 42, groundY + 24)
          ctx.stroke()
        }
      } else if (style === 'lane') {
        ctx.fillStyle = '#d6c29a'
        ctx.fillRect(0, groundY + 6, width, height - groundY - 6)

        ctx.strokeStyle = 'rgba(90,60,20,0.28)'
        ctx.lineWidth = 2

        for (let x = offset - 160; x < width + 160; x += 70) {
          ctx.beginPath()
          ctx.moveTo(x, groundY + 16)
          ctx.lineTo(x + 38, groundY + 16)
          ctx.stroke()
        }
      } else {
        ctx.fillStyle = '#e0f2fe'
        ctx.fillRect(0, groundY + 6, width, height - groundY - 6)

        ctx.strokeStyle = 'rgba(37,99,235,0.18)'
        ctx.lineWidth = 2

        for (let x = offset - 160; x < width + 160; x += 62) {
          ctx.beginPath()
          ctx.moveTo(x, groundY + 18)
          ctx.lineTo(x + 28, groundY + 28)
          ctx.stroke()
        }
      }
    }, [width, height, groundY])

    const drawMeterRule = useCallback((ctx, maxMeters = 20) => {
      const startX = 120
      const meterWidth = width - 240
      const meterY = groundY + 42
      const ticks = 10

      const gradient = ctx.createLinearGradient(startX, meterY, startX, meterY + 18)
      gradient.addColorStop(0, '#f8fafc')
      gradient.addColorStop(0.5, '#cbd5e1')
      gradient.addColorStop(1, '#94a3b8')

      ctx.save()
      ctx.fillStyle = gradient
      ctx.fillRect(startX, meterY, meterWidth, 18)
      ctx.strokeStyle = 'rgba(15,23,42,0.35)'
      ctx.lineWidth = 1.5
      ctx.strokeRect(startX, meterY, meterWidth, 18)

      for (let i = 0; i <= ticks; i++) {
        const x = startX + (meterWidth / ticks) * i
        const value = Math.round((maxMeters / ticks) * i)
        const tickHeight = i % 2 === 0 ? 18 : 11

        ctx.beginPath()
        ctx.moveTo(x, meterY)
        ctx.lineTo(x, meterY - tickHeight)
        ctx.stroke()

        ctx.fillStyle = 'rgba(15,23,42,0.72)'
        ctx.font = '10px Arial'
        ctx.fillText(`${value}m`, x - 10, meterY - 22)
      }

      ctx.restore()

      return {
        startX,
        meterWidth,
        scale: meterWidth / maxMeters
      }
    }, [width, groundY])

    const drawMomentumScene = useCallback((ctx) => {
      const raw = results ? progressRef.current : 0
      const progress = easeInOutCubic(raw)
      const distanceMeters = clamp(Math.abs(params.velocity1) * 1.8, 6, 20)
      const { startX, scale } = drawMeterRule(ctx, 20)
      const travel = distanceMeters * scale
      const distance = results ? travel * progress : 0
      const floorProgress = results ? progress : 0

      if (params.scenario === 'bowling-ball') {
        drawMovingFloor(ctx, floorProgress, travel, 'lane')

        const throwerX = startX + 30
        const ballX = startX + 120 + distance
        const ballRadius = clamp(12 + Math.sqrt(params.mass1) * 2, 16, 32)

        drawPerson(ctx, throwerX, groundY - 18, '#2563eb', 'throw')
        drawLabel(ctx, 34, 150, 'Person rolls the bowling ball forward.', 300)

        drawBowlingBall(ctx, ballX, groundY - 2, ballRadius)

        drawArrow(
          ctx,
          ballX,
          groundY - 54,
          ballX + 78,
          groundY - 54,
          '#2563eb',
          'velocity'
        )

        drawObjectLabel(ctx, ballX, groundY - 98, [
          `mass=${params.mass1}kg`,
          `p=${((params.mass1 || 0) * (params.velocity1 || 0)).toFixed(1)}`
        ])

        return
      }

      if (params.scenario === 'moving-trolley') {
        drawMovingFloor(ctx, floorProgress, travel, 'road')

        const personX = startX + 44 + distance
        const trolleyX = personX + 44

        drawPerson(ctx, personX, groundY - 18, '#16a34a', 'push')
        drawTrolley(ctx, trolleyX, groundY - 48, params.mass1, '#7c3aed')

        drawArrow(
          ctx,
          trolleyX + 40,
          groundY - 76,
          trolleyX + 114,
          groundY - 76,
          '#2563eb',
          'v'
        )

        drawLabel(ctx, 34, 150, 'The trolley has momentum because it has mass and velocity.', 340)

        drawObjectLabel(ctx, trolleyX + 45, groundY - 104, [
          `mass=${params.mass1}kg`,
          `p=${((params.mass1 || 0) * (params.velocity1 || 0)).toFixed(1)}`
        ])

        return
      }

      drawMovingFloor(ctx, floorProgress, travel, 'road')

      const personX = startX + 42 + distance
      const cartX = personX + 45

      drawPerson(ctx, personX, groundY - 18, '#2563eb', 'push')
      drawShoppingCart(ctx, cartX, groundY - 56, params.mass1)

      drawArrow(
        ctx,
        cartX + 58,
        groundY - 82,
        cartX + 138,
        groundY - 82,
        '#ef4444',
        'velocity'
      )

      drawLabel(ctx, 34, 150, 'Shopping cart momentum increases when mass or velocity increases.', 340)

      drawObjectLabel(ctx, cartX + 54, groundY - 112, [
        `mass=${params.mass1}kg`,
        `p=${((params.mass1 || 0) * (params.velocity1 || 0)).toFixed(1)}`
      ])
    }, [results, params, groundY, drawMeterRule, drawMovingFloor])

    const drawCollisionScene = useCallback((ctx) => {
      const raw = results ? progressRef.current : 0
      const progress = easeInOutCubic(raw)

      drawMovingFloor(ctx, progress, 380, 'road')
      drawMeterRule(ctx, 20)

      const leftStartX = 185
      const rightStartX = width - 285
      const contactX = width / 2 - 58

      const approachEnd = 0.48
      const impactEnd = 0.58

      let x1 = leftStartX
      let x2 = rightStartX
      let phaseText = 'Before impact: objects move toward each other.'

      if (!results) {
        x1 = leftStartX
        x2 = rightStartX
      } else if (progress < approachEnd) {
        const p = progress / approachEnd
        x1 = leftStartX + (contactX - leftStartX) * p
        x2 = rightStartX - (rightStartX - (contactX + 100)) * p
      } else if (progress < impactEnd) {
        x1 = contactX
        x2 = contactX + 100
        phaseText = 'Impact: front sides touch.'
      } else {
        const p = (progress - impactEnd) / (1 - impactEnd)

        phaseText =
          params.collisionType === 'elastic'
            ? 'After elastic collision: they bounce apart.'
            : 'After inelastic collision: they stick or move together.'

     if (params.collisionType === 'inelastic') {
  const sharedVelocity = results?.final_velocity1 ?? 0
  const centerShift = sharedVelocity * 18 * p

  x1 = contactX + centerShift
  x2 = x1 + 100
} else {
  const v1 = results?.final_velocity1 ?? 0
  const v2 = results?.final_velocity2 ?? 0

  const centreVelocity =
    ((params.mass1 || 1) * v1 + (params.mass2 || 1) * v2) /
    ((params.mass1 || 1) + (params.mass2 || 1))

  const centreShift = centreVelocity * 14 * p
  const separation = 120 + Math.max(Math.abs(v2 - v1) * 26, 90) * p

  x1 = contactX + 50 + centreShift - separation / 2
  x2 = contactX + 50 + centreShift + separation / 2
}}
      if (params.scenario === 'bumper-cars') {
        drawBumperCar(ctx, x1, groundY - 44, params.mass1, '#ef4444', 'right')
        drawBumperCar(ctx, x2 + 100, groundY - 44, params.mass2, '#2563eb', 'left')
      } else {
        drawTrolley(ctx, x1, groundY - 50, params.mass1, '#7c3aed')
        drawTrolley(ctx, x2, groundY - 50, params.mass2, '#06b6d4')
      }

      drawLabel(ctx, width / 2 - 190, 92, phaseText, 380)

      if (!results || progress < approachEnd) {
        drawArrow(ctx, x1 + 50, groundY - 86, x1 + 124, groundY - 86, '#ef4444', 'u₁')
        drawArrow(ctx, x2 + 50, groundY - 86, x2 - 24, groundY - 86, '#2563eb', 'u₂')
      } else {
        const v1 = results?.final_velocity1 ?? 0
        const v2 = results?.final_velocity2 ?? 0

        drawArrow(
          ctx,
          x1 + 50,
          groundY - 86,
          x1 + 50 + (v1 >= 0 ? 1 : -1) * 74,
          groundY - 86,
          '#ef4444',
          'v₁'
        )

        drawArrow(
          ctx,
          x2 + 50,
          groundY - 86,
          x2 + 50 + (v2 >= 0 ? 1 : -1) * 74,
          groundY - 86,
          '#2563eb',
          'v₂'
        )
      }

      if (progress >= approachEnd && progress < impactEnd) {
        ctx.save()
        ctx.fillStyle = 'rgba(250,204,21,0.55)'
        ctx.beginPath()
        ctx.arc(contactX + 98, groundY - 22, 28, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = '#f59e0b'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(contactX + 72, groundY - 54)
        ctx.lineTo(contactX + 120, groundY - 2)
        ctx.moveTo(contactX + 120, groundY - 54)
        ctx.lineTo(contactX + 72, groundY - 2)
        ctx.stroke()
        ctx.restore()
      }

      drawObjectLabel(ctx, x1 + 50, groundY - 130, [
        `m₁=${params.mass1}kg`,
        `u₁=${params.velocity1}m/s`
      ])

      drawObjectLabel(ctx, x2 + 50, groundY - 130, [
        `m₂=${params.mass2}kg`,
        `u₂=${params.velocity2}m/s`
      ])
    }, [results, params, width, groundY, drawMovingFloor, drawMeterRule])

    const drawRecoilScene = useCallback((ctx) => {
      const raw = results ? progressRef.current : 0
      const progress = easeInOutCubic(raw)

      drawMovingFloor(ctx, progress, 260, params.scenario === 'skater-push' ? 'ice' : 'road')

      if (params.scenario === 'gun-recoil') {
        const shooterX = 300 - 110 * progress
        const bulletX = shooterX + 78 + 420 * progress

        drawPerson(ctx, shooterX, groundY - 14, '#2563eb', progress > 0.08 ? 'recoil' : 'push')
        drawGun(ctx, shooterX + 22, groundY - 44)

        if (progress < 0.16 && results) {
          ctx.fillStyle = '#f97316'
          ctx.beginPath()
          ctx.arc(shooterX + 94, groundY - 38, 16, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = 'rgba(249,115,22,0.35)'
          ctx.beginPath()
          ctx.arc(shooterX + 98, groundY - 38, 30, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.fillStyle = '#111827'
        ctx.beginPath()
        ctx.arc(bulletX, groundY - 38, 5, 0, Math.PI * 2)
        ctx.fill()

        if (results) {
          drawArrow(
            ctx,
            bulletX - 20,
            groundY - 70,
            bulletX + 70,
            groundY - 70,
            '#22c55e',
            'bullet momentum'
          )

          drawArrow(
            ctx,
            shooterX + 20,
            groundY - 92,
            shooterX - 75,
            groundY - 92,
            '#ef4444',
            'recoil'
          )
        }

        drawLabel(ctx, 34, 150, 'Bullet moves forward, gun or shooter recoils backward.', 360)
        return
      }

      if (params.scenario === 'skater-push') {
        const leftX = width / 2 - 50 - 180 * progress
        const rightX = width / 2 + 40 + 180 * progress

        drawPerson(ctx, leftX, groundY - 12, '#2563eb')
        drawPerson(ctx, rightX, groundY - 12, '#ef4444')

        ctx.strokeStyle = '#64748b'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(leftX - 24, groundY + 10)
        ctx.lineTo(leftX + 24, groundY + 10)
        ctx.moveTo(rightX - 24, groundY + 10)
        ctx.lineTo(rightX + 24, groundY + 10)
        ctx.stroke()

        if (results) {
          drawArrow(ctx, leftX, groundY - 74, leftX - 78, groundY - 74, '#2563eb', 'v₁')
          drawArrow(ctx, rightX, groundY - 74, rightX + 78, groundY - 74, '#ef4444', 'v₂')
        }

        drawLabel(ctx, 34, 150, 'They push each other and move in opposite directions.', 360)
        return
      }

      const cannonX = 260 - 145 * progress
      const ballX = cannonX + 106 + 380 * progress

      drawCannon(ctx, cannonX, groundY - 48)

      if (progress < 0.14 && results) {
        ctx.fillStyle = '#f97316'
        ctx.beginPath()
        ctx.arc(cannonX + 110, groundY - 34, 20, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = 'rgba(249,115,22,0.34)'
        ctx.beginPath()
        ctx.arc(cannonX + 116, groundY - 34, 36, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.fillStyle = '#111827'
      ctx.beginPath()
      ctx.arc(ballX, groundY - 34, 10, 0, Math.PI * 2)
      ctx.fill()

      if (results) {
        drawArrow(
          ctx,
          cannonX + 30,
          groundY - 92,
          cannonX - 78,
          groundY - 92,
          '#ef4444',
          'cannon recoil'
        )

        drawArrow(
          ctx,
          ballX - 18,
          groundY - 72,
          ballX + 82,
          groundY - 72,
          '#22c55e',
          'cannonball'
        )
      }

      drawLabel(ctx, 34, 150, 'Cannonball goes forward and cannon recoils backward.', 360)
    }, [results, params.scenario, width, groundY, drawMovingFloor])

    const drawCanvas = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, width, height)

      drawBackground(ctx)
      drawInfoPanel(ctx)

      if (mode === 'momentum') drawMomentumScene(ctx)
      if (mode === 'collision') drawCollisionScene(ctx)
      if (mode === 'recoil') drawRecoilScene(ctx)
    }, [
      width,
      height,
      mode,
      drawBackground,
      drawInfoPanel,
      drawMomentumScene,
      drawCollisionScene,
      drawRecoilScene
    ])

    const animate = useCallback(
      (timestamp) => {
        if (pausedRef.current) return

        if (animationStartTimeRef.current === null) {
          animationStartTimeRef.current =
            timestamp - progressRef.current * PLAYBACK_DURATION_MS
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
      pausedRef.current = false
      completedRef.current = false
      drawCanvas()
    }, [drawCanvas])

    const startAnimation = useCallback(() => {
      if (!results) return

      if (animationId.current) {
        cancelAnimationFrame(animationId.current)
        animationId.current = null
      }

      pausedRef.current = false
      completedRef.current = false

      animationId.current = requestAnimationFrame((timestamp) => {
        if (animateRef.current) animateRef.current(timestamp)
      })
    }, [results])

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
          pausedRef.current = false
          completedRef.current = false

          startAnimation()
        }
      }),
      [resetAnimation, results, startAnimation]
    )

    const handlePointerDown = useCallback(
      (event) => {
        if (results || mode === 'recoil') return

        const { x } = getCanvasPoint(event)

        if (mode === 'momentum') {
          dragRef.current = { active: true, target: 'velocity1' }
          const mapped = clamp((x - 300) / 22, -20, 20)
          onParamChange?.({ velocity1: parseFloat(mapped.toFixed(1)) })
          return
        }

        if (mode === 'collision') {
          if (x < width / 2) {
            dragRef.current = { active: true, target: 'velocity1' }
            const mapped = clamp((x - 250) / 22, -20, 20)
            onParamChange?.({ velocity1: parseFloat(mapped.toFixed(1)) })
          } else {
            dragRef.current = { active: true, target: 'velocity2' }
            const mapped = clamp((x - (width - 250)) / 22, -20, 20)
            onParamChange?.({ velocity2: parseFloat(mapped.toFixed(1)) })
          }
        }
      },
      [results, mode, onParamChange, getCanvasPoint, width]
    )

    const handlePointerMove = useCallback(
      (event) => {
        if (!dragRef.current.active || results) return

        const { x } = getCanvasPoint(event)

        if (dragRef.current.target === 'velocity1') {
          const base = mode === 'collision' ? 250 : 300
          const mapped = clamp((x - base) / 22, -20, 20)
          onParamChange?.({ velocity1: parseFloat(mapped.toFixed(1)) })
        }

        if (dragRef.current.target === 'velocity2') {
          const mapped = clamp((x - (width - 250)) / 22, -20, 20)
          onParamChange?.({ velocity2: parseFloat(mapped.toFixed(1)) })
        }
      },
      [results, mode, onParamChange, getCanvasPoint, width]
    )

    const handlePointerUp = useCallback(() => {
      dragRef.current = { active: false, target: null }
    }, [])

    useEffect(() => {
      resetAnimation()

      if (results) {
        startAnimation()
      }

      return () => {
        if (animationId.current) {
          cancelAnimationFrame(animationId.current)
          animationId.current = null
        }
      }
    }, [results, mode, params, resetAnimation, startAnimation])

    return (
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="simulation-canvas"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
        />

        {!results && (
          <div className="canvas-placeholder">
            <p>
              Choose a scenario, set the values, drag objects if needed, and click
              “Calculate”
            </p>
          </div>
        )}
      </div>
    )
  }
)

MomentumCanvas.displayName = 'MomentumCanvas'

export default MomentumCanvas