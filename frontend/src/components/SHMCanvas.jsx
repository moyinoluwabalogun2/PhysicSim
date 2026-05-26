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

const massScale = (mass = 2, min = 0.8, max = 1.8) =>
  clamp(0.75 + Math.sqrt(Math.max(mass, 0.1)) / 8, min, max)

const drawCloud = (ctx, x, y, scale = 1) => {
  ctx.beginPath()
  ctx.arc(x, y, 18 * scale, 0, 2 * Math.PI)
  ctx.arc(x + 20 * scale, y - 8 * scale, 24 * scale, 0, 2 * Math.PI)
  ctx.arc(x + 48 * scale, y, 18 * scale, 0, 2 * Math.PI)
  ctx.fill()
}

const drawLabel = (ctx, x, y, text, width = 300) => {
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

const drawObjectLabel = (ctx, x, y, lines = [], width = 130) => {
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
    ctx.fillText(label, (x1 + x2) / 2 + 8, (y1 + y2) / 2 - 8)
  }

  ctx.restore()
}

const drawSpring = (ctx, x1, y1, x2, y2, coils = 12, stiffness = 20) => {
  const dx = x2 - x1
  const dy = y2 - y1
  const length = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx)
  const coilHeight = clamp(14 - stiffness / 18, 6, 14)

  ctx.save()
  ctx.translate(x1, y1)
  ctx.rotate(angle)

  ctx.strokeStyle = '#ef4444'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(0, 0)

  const segment = length / coils
  for (let i = 1; i < coils; i++) {
    const x = i * segment
    const y = i % 2 === 0 ? -coilHeight : coilHeight
    ctx.lineTo(x, y)
  }

  ctx.lineTo(length, 0)
  ctx.stroke()
  ctx.restore()
}

const drawMassBlock = (ctx, x, y, mass, color = '#2563eb') => {
  const s = massScale(mass)
  const w = 80 * s
  const h = 58 * s

  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(x - w / 2, y - h / 2, w, h, 10)
  ctx.fill()

  ctx.strokeStyle = 'rgba(15,23,42,0.2)'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 13px Arial'
  ctx.fillText(`${mass} kg`, x - 20, y + 4)

  ctx.restore()

  return { w, h }
}

const drawBell = (ctx, pivotX, pivotY, bobX, bobY, lengthPx) => {
  ctx.save()

  ctx.strokeStyle = '#8b5e34'
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(pivotX - 70, pivotY - 8)
  ctx.lineTo(pivotX + 70, pivotY - 8)
  ctx.stroke()

  ctx.strokeStyle = '#475569'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(pivotX, pivotY)
  ctx.lineTo(bobX, bobY)
  ctx.stroke()

  ctx.fillStyle = '#f59e0b'
  ctx.beginPath()
  ctx.moveTo(bobX - 34, bobY + 22)
  ctx.quadraticCurveTo(bobX, bobY - 42, bobX + 34, bobY + 22)
  ctx.lineTo(bobX + 42, bobY + 34)
  ctx.lineTo(bobX - 42, bobY + 34)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = '#92400e'
  ctx.lineWidth = 3
  ctx.stroke()

  ctx.fillStyle = '#7c2d12'
  ctx.beginPath()
  ctx.arc(bobX, bobY + 36, 8, 0, 2 * Math.PI)
  ctx.fill()

  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 12px Arial'
  ctx.fillText(`${(lengthPx / 90).toFixed(1)} m`, pivotX + 16, pivotY + lengthPx / 2)

  ctx.restore()
}

const SHMCanvas = forwardRef(
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
    const progressRef = useRef(0)
    const animationStartTimeRef = useRef(null)
    const animateRef = useRef(null)
    const completedRef = useRef(false)
    const pausedRef = useRef(false)
    const dragRef = useRef({ active: false })

    const groundY = height - 110

    const getCanvasPoint = useCallback((e) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }

      const rect = canvas.getBoundingClientRect()
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
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
      ctx.fillText(`Period: ${results?.period ?? '-'} s`, width - 266, 68)
      ctx.fillText(`ω: ${results?.angular_frequency ?? '-'} rad/s`, width - 266, 92)

      if (mode === 'spring' || mode === 'horizontal') {
        ctx.fillText(`A = ${params.amplitude} m`, width - 266, 116)
        ctx.fillText(`k = ${params.springConstant} N/m`, width - 266, 136)
      } else {
        ctx.fillText(`L = ${params.length} m`, width - 266, 116)
        ctx.fillText(`θ = ${params.initialAngle}°`, width - 266, 136)
      }

      ctx.restore()
    }, [mode, params, results, width])

    const drawSpringMassScene = useCallback((ctx) => {
      const omega = results?.angular_frequency || Math.sqrt((params.springConstant || 20) / (params.mass || 2))
      const t = progressRef.current * 2 * Math.PI
      const displacement = (params.amplitude || 1) * Math.cos(omega * t)

      const topX = width / 2
      const topY = 106
      const equilibriumY = 300
      const visualAmplitude = clamp((params.amplitude || 1) * 48, 26, 180)
      const blockY = equilibriumY + displacement * 48
      const block = drawMassBlock(ctx, topX, blockY, params.mass, '#2563eb')

      ctx.save()

      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 9
      ctx.beginPath()
      ctx.moveTo(topX - 95, topY)
      ctx.lineTo(topX + 95, topY)
      ctx.stroke()

      ctx.fillStyle = '#64748b'
      ctx.fillRect(topX - 88, topY - 18, 176, 18)

      drawSpring(
        ctx,
        topX,
        topY,
        topX,
        blockY - block.h / 2,
        14,
        params.springConstant
      )

      ctx.setLineDash([8, 5])
      ctx.strokeStyle = 'rgba(15,23,42,0.35)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(topX - 160, equilibriumY)
      ctx.lineTo(topX + 160, equilibriumY)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 12px Arial'
      ctx.fillText('Equilibrium position', topX + 88, equilibriumY + 4)

      ctx.strokeStyle = 'rgba(239,68,68,0.45)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(topX - 130, equilibriumY - visualAmplitude)
      ctx.lineTo(topX - 130, equilibriumY + visualAmplitude)
      ctx.stroke()

      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 12px Arial'
      ctx.fillText('Amplitude range', topX - 174, equilibriumY - visualAmplitude - 8)

      if (blockY < equilibriumY) {
        drawArrow(ctx, topX + 112, blockY, topX + 112, equilibriumY, '#ef4444', 'restoring force')
      } else {
        drawArrow(ctx, topX + 112, blockY, topX + 112, equilibriumY, '#ef4444', 'restoring force')
      }

      drawObjectLabel(ctx, topX, blockY + block.h / 2 + 34, [
        `m=${params.mass}kg`,
        `A=${params.amplitude}m`
      ])

      drawLabel(
        ctx,
        34,
        150,
        'The mass moves up and down around equilibrium. The spring always pulls it back toward the middle.',
        390
      )

      ctx.restore()
    }, [results, params, width])

    const drawPendulumScene = useCallback((ctx) => {
      const omega = results?.angular_frequency || Math.sqrt((params.gravity || 9.81) / (params.length || 2))
      const angle0 = (params.initialAngle || 20) * (Math.PI / 180)
      const t = progressRef.current * 2 * Math.PI
      const theta = angle0 * Math.cos(omega * t)

      const lengthPx = clamp((params.length || 2) * 90, 90, groundY - 170)
      const pivotX = width / 2
      const pivotY = 118

      const bobX = pivotX + lengthPx * Math.sin(theta)
      const bobY = pivotY + lengthPx * Math.cos(theta)

      drawBell(ctx, pivotX, pivotY, bobX, bobY, lengthPx)

      ctx.save()

      ctx.setLineDash([7, 5])
      ctx.strokeStyle = 'rgba(15,23,42,0.28)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(pivotX, pivotY)
      ctx.lineTo(pivotX, pivotY + lengthPx)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(
        pivotX,
        pivotY,
        48,
        Math.PI / 2,
        Math.PI / 2 + theta,
        theta < 0
      )
      ctx.stroke()

      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 12px Arial'
      ctx.fillText('θ', pivotX + 34, pivotY + 36)

      drawArrow(ctx, bobX, bobY + 46, bobX - Math.sign(theta || 1) * 70, bobY + 30, '#2563eb', 'swing')

      drawObjectLabel(ctx, bobX, bobY + 78, [
        `L=${params.length}m`,
        `θ=${params.initialAngle}°`
      ])

      drawLabel(
        ctx,
        34,
        150,
        'A bell is a real pendulum. It swings left and right around the centre point.',
        360
      )

      ctx.restore()
    }, [results, params, width, groundY])

    const drawHorizontalScene = useCallback((ctx) => {
      const omega = results?.angular_frequency || Math.sqrt((params.springConstant || 20) / (params.mass || 2))
      const t = progressRef.current * 2 * Math.PI
      const displacement = (params.amplitude || 1) * Math.cos(omega * t)

      const wallX = 160
      const centerY = groundY - 72
      const equilibriumX = width / 2
      const visualAmplitude = clamp((params.amplitude || 1) * 62, 36, 220)
      const blockX = equilibriumX + displacement * 62

      ctx.save()

      ctx.fillStyle = '#d1d5db'
      ctx.fillRect(0, groundY + 6, width, height - groundY - 6)

      ctx.strokeStyle = 'rgba(15,23,42,0.15)'
      ctx.lineWidth = 2
      for (let x = 0; x < width; x += 70) {
        ctx.beginPath()
        ctx.moveTo(x, groundY + 22)
        ctx.lineTo(x + 34, groundY + 22)
        ctx.stroke()
      }

      ctx.fillStyle = '#64748b'
      ctx.fillRect(wallX, centerY - 78, 34, 156)

      drawSpring(
        ctx,
        wallX + 34,
        centerY,
        blockX - 50,
        centerY,
        16,
        params.springConstant
      )

      const block = drawMassBlock(ctx, blockX, centerY, params.mass, '#7c3aed')

      ctx.setLineDash([7, 5])
      ctx.strokeStyle = 'rgba(15,23,42,0.35)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(equilibriumX, centerY - 95)
      ctx.lineTo(equilibriumX, centerY + 95)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 12px Arial'
      ctx.fillText('Equilibrium', equilibriumX + 12, centerY - 72)

      ctx.strokeStyle = 'rgba(239,68,68,0.42)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(equilibriumX - visualAmplitude, centerY + 90)
      ctx.lineTo(equilibriumX + visualAmplitude, centerY + 90)
      ctx.stroke()

      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 12px Arial'
      ctx.fillText('Amplitude range', equilibriumX - 50, centerY + 112)

      drawArrow(ctx, blockX, centerY - 70, equilibriumX, centerY - 70, '#ef4444', 'F = -kx')

      drawObjectLabel(ctx, blockX, centerY + block.h / 2 + 34, [
        `m=${params.mass}kg`,
        `A=${params.amplitude}m`
      ])

      drawLabel(
        ctx,
        34,
        150,
        'The block slides left and right. The spring force always points back to equilibrium.',
        380
      )

      ctx.restore()
    }, [results, params, width, height, groundY])

    const drawCanvas = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, width, height)

      drawBackground(ctx)
      drawInfoPanel(ctx)

      if (mode === 'spring') drawSpringMassScene(ctx)
      if (mode === 'pendulum') drawPendulumScene(ctx)
      if (mode === 'horizontal') drawHorizontalScene(ctx)

      if (!results) {
        drawLabel(
          ctx,
          24,
          24,
          mode === 'spring'
            ? 'Interactive preview: drag vertically to set the amplitude.'
            : mode === 'pendulum'
              ? 'Interactive preview: drag left or right to set the starting angle.'
              : 'Interactive preview: drag horizontally to set the amplitude.',
          360
        )
      }
    }, [
      width,
      height,
      mode,
      results,
      drawBackground,
      drawInfoPanel,
      drawSpringMassScene,
      drawPendulumScene,
      drawHorizontalScene
    ])

    const animate = useCallback(
      (timestamp) => {
        if (pausedRef.current) return

        if (animationStartTimeRef.current === null) {
          animationStartTimeRef.current =
            timestamp - progressRef.current * PLAYBACK_DURATION_MS
        }

        const elapsed = timestamp - animationStartTimeRef.current
        progressRef.current = Math.min(elapsed / PLAYBACK_DURATION_MS, 1)

        drawCanvas()

        if (progressRef.current < 1) {
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

    const handlePointerDown = useCallback(
      (e) => {
        if (results) return

        dragRef.current.active = true

        const { x, y } = getCanvasPoint(e)

        if (mode === 'spring') {
          const amp = clamp(Math.abs((y - 300) / 48), 0.1, 5)
          onParamChange?.({ amplitude: parseFloat(amp.toFixed(2)) })
        }

        if (mode === 'horizontal') {
          const amp = clamp(Math.abs((x - width / 2) / 62), 0.1, 5)
          onParamChange?.({ amplitude: parseFloat(amp.toFixed(2)) })
        }

        if (mode === 'pendulum') {
          const angle = clamp((x - width / 2) / 4, -45, 45)
          onParamChange?.({ initialAngle: parseFloat(angle.toFixed(1)) })
        }
      },
      [results, mode, width, getCanvasPoint, onParamChange]
    )

    const handlePointerMove = useCallback(
      (e) => {
        if (!dragRef.current.active || results) return

        const { x, y } = getCanvasPoint(e)

        if (mode === 'spring') {
          const amp = clamp(Math.abs((y - 300) / 48), 0.1, 5)
          onParamChange?.({ amplitude: parseFloat(amp.toFixed(2)) })
        }

        if (mode === 'horizontal') {
          const amp = clamp(Math.abs((x - width / 2) / 62), 0.1, 5)
          onParamChange?.({ amplitude: parseFloat(amp.toFixed(2)) })
        }

        if (mode === 'pendulum') {
          const angle = clamp((x - width / 2) / 4, -45, 45)
          onParamChange?.({ initialAngle: parseFloat(angle.toFixed(1)) })
        }
      },
      [results, mode, width, getCanvasPoint, onParamChange]
    )

    const handlePointerUp = useCallback(() => {
      dragRef.current.active = false
    }, [])

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

          startAnimation()
        }
      }),
      [resetAnimation, results, startAnimation]
    )

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
            <p>Choose a system, set the values, drag if needed, and click “Calculate”</p>
          </div>
        )}
      </div>
    )
  }
)

SHMCanvas.displayName = 'SHMCanvas'

export default SHMCanvas