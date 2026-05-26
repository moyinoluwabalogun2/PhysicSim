import React, {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useState
} from 'react'
import '../styles/canvas.css'

const NewtonCanvas = forwardRef(
  ({ lawType, params, results, width = 1200, height = 700, onParamChange }, ref) => {
    const canvasRef = useRef(null)
    const animationId = useRef(null)
    const currentIndex = useRef(0)
    const isPaused = useRef(false)
    const animateRef = useRef(null)
    const [dragState, setDragState] = useState(null)

    const groundY = height - 110

    const drawArrow = useCallback((ctx, fromX, fromY, toX, toY, color, label = '') => {
      const headLength = 10
      const angle = Math.atan2(toY - fromY, toX - fromX)

      ctx.save()
      ctx.strokeStyle = color
      ctx.fillStyle = color
      ctx.lineWidth = 3

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

      if (label) {
        ctx.font = 'bold 12px Arial'
        ctx.fillText(label, (fromX + toX) / 2 + 6, (fromY + toY) / 2 - 6)
      }

      ctx.restore()
    }, [])

    const getCurrentSinglePoint = useCallback(() => {
      if (!results?.points?.length) {
        return { t: 0, x: 0, v: 0 }
      }
      const idx = Math.min(currentIndex.current, results.points.length - 1)
      return results.points[idx]
    }, [results])

    const getCurrentDualPoint = useCallback(() => {
      if (!results?.dual_points?.length) {
        return { t: 0, xA: 0, xB: 0, vA: 0, vB: 0 }
      }
      const idx = Math.min(currentIndex.current, results.dual_points.length - 1)
      return results.dual_points[idx]
    }, [results])

    const getSingleBodyPosition = useCallback(() => {
      if (!results?.points?.length) return width * 0.28
      const idx = Math.min(currentIndex.current, results.points.length - 1)
      const introShift = Math.min(idx * 2.5, 60)
      return width * 0.28 + introShift
    }, [results, width])

    const getSceneAnchors = useCallback(() => {
      const x = getSingleBodyPosition()
      const y = groundY - 50

      return {
        objectX: x,
        objectY: y,
        wallX: width * 0.72,
        personBaseX: width * 0.42
      }
    }, [getSingleBodyPosition, groundY, width])

    const getThirdSceneData = useCallback(() => {
      const { wallX, personBaseX } = getSceneAnchors()
      const point = getCurrentDualPoint()

      if (params.scenarioPreset === 'wall-push') {
        const reactionShift = Math.max(-18, Math.min(0, point.xA * 18))
        return {
          wallX,
          personX: personBaseX + reactionShift
        }
      }

      if (params.scenarioPreset === 'skaters') {
        const maxAbs = Math.max(
          ...(results?.dual_points || []).map((p) => Math.max(Math.abs(p.xA), Math.abs(p.xB))),
          1
        )
        const usable = width / 2 - 260
        const scale = usable / maxAbs

        return {
          skaterAX: width / 2 - 130 + point.xA * scale,
          skaterBX: width / 2 + 20 + point.xB * scale
        }
      }

      const boardX = width * 0.58
      const jumperX = width * 0.48 + Math.max(0, point.xA * 25)
      const boardShift = Math.min(40, Math.abs(point.xB) * 60)

      return {
        jumperX,
        boardX: boardX - boardShift
      }
    }, [getSceneAnchors, getCurrentDualPoint, params.scenarioPreset, results, width])

    const drawBackground = useCallback((ctx) => {
      const sky = ctx.createLinearGradient(0, 0, 0, height)
      sky.addColorStop(0, '#020617')
      sky.addColorStop(0.5, '#0f172a')
      sky.addColorStop(1, '#111827')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, width, height)

      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.beginPath()
      ctx.arc(120, 90, 20, 0, Math.PI * 2)
      ctx.arc(145, 85, 25, 0, Math.PI * 2)
      ctx.arc(175, 92, 20, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.arc(width - 250, 120, 18, 0, Math.PI * 2)
      ctx.arc(width - 225, 115, 24, 0, Math.PI * 2)
      ctx.arc(width - 195, 122, 18, 0, Math.PI * 2)
      ctx.fill()

      let gridOffset = 0
      if (lawType !== 'third' && results?.points?.length) {
        const point = getCurrentSinglePoint()
        gridOffset = (point.x * 20) % 50
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.05)'
      ctx.lineWidth = 1

      for (let x = -gridOffset; x < width; x += 50) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, groundY)
        ctx.stroke()
      }

      for (let y = 0; y < groundY; y += 50) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      ctx.fillStyle = '#14532d'
      ctx.fillRect(0, groundY, width, height - groundY)
    }, [width, height, groundY, lawType, results, getCurrentSinglePoint])

    const drawTrack = useCallback((ctx) => {
      ctx.save()

      ctx.strokeStyle = 'rgba(255,255,255,0.18)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(70, groundY)
      ctx.lineTo(width - 70, groundY)
      ctx.stroke()

      let offset = 0
      if (lawType !== 'third' && results?.points?.length) {
        const point = getCurrentSinglePoint()
        offset = (point.x * 35) % 50
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.14)'
      ctx.lineWidth = 2

      for (let x = 70 - offset; x < width - 70; x += 50) {
        ctx.beginPath()
        ctx.moveTo(x, groundY + 8)
        ctx.lineTo(x + 18, groundY + 8)
        ctx.stroke()
      }

      for (let i = 0; i < 10; i++) {
        const markX = 100 + i * 90
        ctx.fillStyle = 'rgba(255,255,255,0.45)'
        ctx.font = '10px Arial'
        ctx.fillText(`${i * 5} m`, markX, groundY + 28)
      }

      ctx.restore()
    }, [groundY, width, lawType, results, getCurrentSinglePoint])

    const drawInfoPanel = useCallback((ctx) => {
      ctx.save()
      ctx.fillStyle = 'rgba(15,23,42,0.84)'
      ctx.strokeStyle = 'rgba(148,163,184,0.16)'
      ctx.beginPath()
      ctx.roundRect(width - 295, 24, 255, 176, 14)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#e5e7eb'
      ctx.font = 'bold 14px Arial'
      ctx.fillText(`Law: ${lawType.toUpperCase()}`, width - 270, 50)

      ctx.font = '12px Arial'

      if (lawType === 'first') {
        const point = getCurrentSinglePoint()
        ctx.fillText(`Speed: ${point.v.toFixed(2)} m/s`, width - 270, 78)
        ctx.fillText(`Distance: ${point.x.toFixed(2)} m`, width - 270, 98)
        ctx.fillText(`Friction: ${params.frictionEnabled ? 'On' : 'Off'}`, width - 270, 118)
        ctx.fillText(`Net force: ${results?.net_force ?? 0} N`, width - 270, 138)
        ctx.fillText(`Scene: ${params.scenarioPreset}`, width - 270, 158)
      } else if (lawType === 'second') {
        const point = getCurrentSinglePoint()
        ctx.fillText(`Speed: ${point.v.toFixed(2)} m/s`, width - 270, 78)
        ctx.fillText(`Distance: ${point.x.toFixed(2)} m`, width - 270, 98)
        ctx.fillText(`Acceleration: ${results?.acceleration ?? 0} m/s²`, width - 270, 118)
        ctx.fillText(`Push force: ${params.appliedForce} N`, width - 270, 138)
        ctx.fillText(`Scene: ${params.scenarioPreset}`, width - 270, 158)
      } else {
        const point = getCurrentDualPoint()
        ctx.fillText(`Force: ${params.interactionForce} N`, width - 270, 78)
        ctx.fillText(`A movement: ${Math.abs(point.xA).toFixed(2)} m`, width - 270, 98)
        ctx.fillText(`B movement: ${Math.abs(point.xB).toFixed(2)} m`, width - 270, 118)
        ctx.fillText(`Time: ${params.interactionTime} s`, width - 270, 138)
        ctx.fillText(`Scene: ${params.scenarioPreset}`, width - 270, 158)
      }

      ctx.restore()
    }, [width, lawType, params, results, getCurrentSinglePoint, getCurrentDualPoint])

    const drawExplanation = useCallback((ctx) => {
      ctx.save()
      ctx.fillStyle = 'rgba(15,23,42,0.84)'
      ctx.strokeStyle = 'rgba(148,163,184,0.16)'
      ctx.beginPath()
      ctx.roundRect(width / 2 - 290, 24, 580, 56, 14)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#e5e7eb'
      ctx.font = '13px Arial'

      let text = ''
      if (lawType === 'first') {
        text = params.frictionEnabled
          ? 'A push starts the motion. Friction then slows the object down.'
          : 'A push starts the motion. With no opposing force, it keeps moving.'
      } else if (lawType === 'second') {
        text = 'A bigger push causes more acceleration. A heavier object responds less.'
      } else if (params.scenarioPreset === 'wall-push') {
        text = 'You push the wall. The wall pushes back with the same amount of force.'
      } else if (params.scenarioPreset === 'skaters') {
        text = 'The skaters push each other apart with equal and opposite forces.'
      } else {
        text = 'The person pushes the board back. The board pushes the person forward.'
      }

      ctx.fillText(text, width / 2 - 260, 58)
      ctx.restore()
    }, [width, lawType, params])

    const drawSimpleHand = useCallback((ctx, x, y) => {
      ctx.save()
      ctx.fillStyle = '#fbbf24'
      ctx.fillRect(x, y, 22, 18)
      ctx.fillRect(x + 18, y + 4, 8, 8)
      ctx.restore()
    }, [])

    const drawPersonPushingCart = useCallback((ctx, x, y, color = '#22c55e') => {
      ctx.save()

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x - 38, y + 8, 11, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillRect(x - 46, y + 18, 18, 34)

      ctx.strokeStyle = color
      ctx.lineWidth = 5

      ctx.beginPath()
      ctx.moveTo(x - 38, y + 52)
      ctx.lineTo(x - 48, y + 78)
      ctx.moveTo(x - 36, y + 52)
      ctx.lineTo(x - 18, y + 76)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(x - 28, y + 28)
      ctx.lineTo(x - 4, y + 24)
      ctx.stroke()

      ctx.restore()
    }, [])

    const drawPersonPushingWall = useCallback((ctx, personX, y, wallX) => {
      ctx.save()

      ctx.fillStyle = '#22c55e'
      ctx.beginPath()
      ctx.arc(personX, y + 10, 11, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillRect(personX - 8, y + 20, 16, 36)

      ctx.strokeStyle = '#22c55e'
      ctx.lineWidth = 5

      ctx.beginPath()
      ctx.moveTo(personX - 2, y + 56)
      ctx.lineTo(personX - 12, y + 82)
      ctx.moveTo(personX + 2, y + 56)
      ctx.lineTo(personX + 14, y + 80)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(personX + 8, y + 28)
      ctx.lineTo(wallX - 6, y + 28)
      ctx.stroke()

      ctx.restore()
    }, [])

    const drawSkater = useCallback((ctx, x, y, color, label) => {
      ctx.save()
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x, y + 10, 11, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillRect(x - 8, y + 20, 16, 36)

      ctx.strokeStyle = color
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(x - 2, y + 56)
      ctx.lineTo(x - 10, y + 80)
      ctx.moveTo(x + 2, y + 56)
      ctx.lineTo(x + 12, y + 80)
      ctx.stroke()

      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(x - 24, y + 84)
      ctx.lineTo(x + 24, y + 84)
      ctx.stroke()

      ctx.fillStyle = '#e5e7eb'
      ctx.font = 'bold 12px Arial'
      ctx.fillText(label, x - 8, y + 102)
      ctx.restore()
    }, [])

    const drawBoardJump = useCallback((ctx, jumperX, boardX, y) => {
      ctx.save()

      ctx.fillStyle = '#22c55e'
      ctx.beginPath()
      ctx.arc(jumperX, y + 8, 11, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillRect(jumperX - 8, y + 18, 16, 34)

      ctx.strokeStyle = '#22c55e'
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.moveTo(jumperX - 2, y + 52)
      ctx.lineTo(jumperX - 14, y + 76)
      ctx.moveTo(jumperX + 2, y + 52)
      ctx.lineTo(jumperX + 18, y + 72)
      ctx.stroke()

      ctx.fillStyle = '#f59e0b'
      ctx.fillRect(boardX, groundY - 16, 78, 10)
      ctx.fillStyle = '#e5e7eb'
      ctx.font = 'bold 12px Arial'
      ctx.fillText('Board', boardX + 20, groundY - 24)

      ctx.restore()
    }, [groundY])

    const drawFirstLaw = useCallback((ctx) => {
      const x = getSingleBodyPosition()
      const y = groundY - 50
      const point = getCurrentSinglePoint()

      const fill =
        params.scenarioPreset === 'ice'
          ? '#60a5fa'
          : params.scenarioPreset === 'rough-floor'
            ? '#8b5cf6'
            : '#14b8a6'

      ctx.fillStyle = fill
      ctx.fillRect(x, y, 110, 60)

      ctx.fillStyle = '#dbeafe'
      ctx.font = 'bold 14px Arial'
      ctx.fillText(
        params.scenarioPreset === 'trolley' ? 'Trolley' : 'Box',
        x + (params.scenarioPreset === 'trolley' ? 26 : 38),
        y + 35
      )

      drawArrow(ctx, x + 55, y + 95, x + 55, y + 20, '#38bdf8', 'N')
      drawArrow(ctx, x + 55, y + 10, x + 55, y + 82, '#ef4444', 'W')

      if (currentIndex.current < 20 || !results) {
        drawSimpleHand(ctx, x - 34, y + 18)
        drawArrow(ctx, x - 6, y + 28, x + 42, y + 28, '#22c55e', 'Push')
      }

      if (point.v > 0.1) {
        drawArrow(ctx, x + 55, y - 24, x + 120, y - 24, '#22c55e', 'v')
      } else if (point.v < -0.1) {
        drawArrow(ctx, x + 55, y - 24, x - 20, y - 24, '#22c55e', 'v')
      }

      if (params.frictionEnabled && Math.abs(point.v) > 0.1) {
        const frictionToLeft = point.v > 0
        drawArrow(
          ctx,
          x + 55,
          y - 2,
          frictionToLeft ? x + 8 : x + 102,
          y - 2,
          '#f87171',
          'f'
        )
      }

      const dragSpeed = dragState?.type === 'speed' ? dragState.value : null
      if (dragSpeed !== null) {
        drawArrow(ctx, x + 55, y - 48, x + 55 + dragSpeed * 4, y - 48, '#facc15', 'Drag to set speed')
      }
    }, [
      getSingleBodyPosition,
      groundY,
      drawArrow,
      getCurrentSinglePoint,
      params,
      drawSimpleHand,
      results,
      dragState
    ])

    const drawSecondLaw = useCallback((ctx) => {
      const x = getSingleBodyPosition()
      const y = groundY - 50

      const cartColor =
        params.scenarioPreset === 'cart-push'
          ? '#f59e0b'
          : params.scenarioPreset === 'heavy-crate'
            ? '#7c3aed'
            : '#06b6d4'

      const cartLabel =
        params.scenarioPreset === 'heavy-crate'
          ? 'Crate'
          : params.scenarioPreset === 'sled'
            ? 'Sled'
            : 'Cart'

      ctx.fillStyle = cartColor
      ctx.fillRect(x, y, 110, 60)

      ctx.fillStyle = '#fff7ed'
      ctx.font = 'bold 14px Arial'
      ctx.fillText(cartLabel, x + 36, y + 35)

      drawPersonPushingCart(ctx, x, y, '#22c55e')

      const liveForce =
        dragState?.type === 'force'
          ? dragState.value
          : params.appliedForce || 0

      const forceScale = Math.min(liveForce * 1.6, 110)
      const frictionScale = Math.min((params.frictionCoefficient || 0) * 90, 55)

      drawArrow(
        ctx,
        x - 8,
        y + 28,
        x - 8 + Math.max(forceScale, 26),
        y + 28,
        '#22c55e',
        'Push'
      )

      drawArrow(ctx, x + 55, y + 95, x + 55, y + 20, '#38bdf8', 'N')
      drawArrow(ctx, x + 55, y + 10, x + 55, y + 82, '#ef4444', 'W')

      if (params.frictionCoefficient > 0) {
        drawArrow(
          ctx,
          x + 55,
          y - 2,
          x + 55 - frictionScale,
          y - 2,
          '#f87171',
          'f'
        )
      }

      const netDirection = (results?.net_force ?? 0) >= 0 ? 1 : -1
      const netScale = Math.min(Math.abs(results?.net_force ?? liveForce) * 1.2, 80)

      drawArrow(
        ctx,
        x + 55,
        y - 56,
        x + 55 + netDirection * Math.max(netScale, 18),
        y - 56,
        '#f59e0b',
        'Fnet'
      )

      ctx.save()
      ctx.fillStyle = 'rgba(245,158,11,0.12)'
      ctx.fillRect(x - 20, y - 90, 220, 24)
      ctx.fillStyle = '#fdba74'
      ctx.font = '12px Arial'
      ctx.fillText('Drag on the scene to set the push force', x - 6, y - 74)
      ctx.restore()
    }, [
      getSingleBodyPosition,
      groundY,
      drawArrow,
      params,
      results,
      drawPersonPushingCart,
      dragState
    ])

    const drawThirdLaw = useCallback((ctx) => {
      const y = groundY - 50
      const forceSize = Math.min(
        Math.abs(dragState?.type === 'interaction' ? dragState.value : (results?.force_on_a ?? params.interactionForce ?? 20)) * 2.2,
        95
      )

      if (params.scenarioPreset === 'wall-push') {
        const { wallX, personX } = getThirdSceneData()

        ctx.save()
        ctx.fillStyle = '#475569'
        ctx.fillRect(wallX, y - 18, 44, 118)
        ctx.fillStyle = '#64748b'
        ctx.fillRect(wallX + 8, y - 18, 8, 118)

        ctx.fillStyle = '#e2e8f0'
        ctx.font = 'bold 14px Arial'
        ctx.fillText('Wall', wallX - 2, y + 120)
        ctx.restore()

        drawPersonPushingWall(ctx, personX, y, wallX)

        drawArrow(
          ctx,
          wallX - 10,
          y + 28,
          wallX + 10 + forceSize,
          y + 28,
          '#22c55e',
          'Force on wall'
        )

        drawArrow(
          ctx,
          personX + 4,
          y + 62,
          personX - forceSize,
          y + 62,
          '#f472b6',
          'Pushes back'
        )
      } else if (params.scenarioPreset === 'skaters') {
        const { skaterAX, skaterBX } = getThirdSceneData()

        drawSkater(ctx, skaterAX, y, '#3b82f6', 'A')
        drawSkater(ctx, skaterBX, y, '#ef4444', 'B')

        drawArrow(
          ctx,
          skaterAX + 16,
          y + 26,
          skaterAX + 16 - forceSize,
          y + 26,
          '#60a5fa',
          'Force'
        )

        drawArrow(
          ctx,
          skaterBX - 16,
          y + 26,
          skaterBX - 16 + forceSize,
          y + 26,
          '#f472b6',
          'Force'
        )
      } else {
        const { jumperX, boardX } = getThirdSceneData()

        drawBoardJump(ctx, jumperX, boardX, y)

        drawArrow(
          ctx,
          boardX + 60,
          groundY - 26,
          boardX + 60 - forceSize,
          groundY - 26,
          '#f59e0b',
          'Board back'
        )

        drawArrow(
          ctx,
          jumperX,
          y + 64,
          jumperX + forceSize,
          y + 64,
          '#22c55e',
          'Person forward'
        )
      }

      ctx.save()
      ctx.fillStyle = 'rgba(244,114,182,0.10)'
      ctx.fillRect(width * 0.22, y - 38, 280, 24)
      ctx.fillStyle = '#f9a8d4'
      ctx.font = '12px Arial'
      ctx.fillText('The two forces are equal in size and opposite in direction.', width * 0.235, y - 22)
      ctx.restore()
    }, [
      groundY,
      results,
      params,
      drawArrow,
      getThirdSceneData,
      drawPersonPushingWall,
      drawSkater,
      drawBoardJump,
      dragState,
      width
    ])

    const drawInteractionHint = useCallback((ctx) => {
      if (results) return

      ctx.save()
      ctx.fillStyle = 'rgba(15,23,42,0.8)'
      ctx.strokeStyle = 'rgba(148,163,184,0.18)'
      ctx.beginPath()
      ctx.roundRect(24, 24, 280, 72, 12)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#e5e7eb'
      ctx.font = 'bold 13px Arial'
      ctx.fillText('Interactive Canvas', 42, 50)

      ctx.font = '12px Arial'
      if (lawType === 'first') {
        ctx.fillText('Drag on the object to set starting speed.', 42, 74)
      } else if (lawType === 'second') {
        ctx.fillText('Drag on the object to set push force.', 42, 74)
      } else {
        ctx.fillText('Drag near the contact area to set force.', 42, 74)
      }

      ctx.restore()
    }, [results, lawType])

    const drawCanvas = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, width, height)

      drawBackground(ctx)
      drawTrack(ctx)
      drawInfoPanel(ctx)
      drawExplanation(ctx)
      drawInteractionHint(ctx)

      if (lawType === 'first') {
        drawFirstLaw(ctx)
      } else if (lawType === 'second') {
        drawSecondLaw(ctx)
      } else {
        drawThirdLaw(ctx)
      }
    }, [
      width,
      height,
      lawType,
      drawBackground,
      drawTrack,
      drawInfoPanel,
      drawExplanation,
      drawInteractionHint,
      drawFirstLaw,
      drawSecondLaw,
      drawThirdLaw
    ])

    const animate = useCallback(() => {
      const pointLength =
        lawType === 'third'
          ? results?.dual_points?.length || 0
          : results?.points?.length || 0

      if (isPaused.current) return

      if (pointLength > 0 && currentIndex.current < pointLength - 1) {
        currentIndex.current = Math.min(currentIndex.current + 2, pointLength - 1)
        drawCanvas()

        animationId.current = requestAnimationFrame(() => {
          if (animateRef.current) {
            animateRef.current()
          }
        })
      }
    }, [lawType, results, drawCanvas])

    useEffect(() => {
      animateRef.current = animate
    }, [animate])

    useImperativeHandle(
      ref,
      () => ({
        resetAnimation: () => {
          if (animationId.current) {
            cancelAnimationFrame(animationId.current)
            animationId.current = null
          }
          currentIndex.current = 0
          isPaused.current = false
          drawCanvas()
        },
        pauseAnimation: () => {
          isPaused.current = true
          if (animationId.current) {
            cancelAnimationFrame(animationId.current)
            animationId.current = null
          }
        },
        resumeAnimation: () => {
          if (!results) return
          isPaused.current = false
          animationId.current = requestAnimationFrame(() => {
            if (animateRef.current) {
              animateRef.current()
            }
          })
        },
        restartAnimation: () => {
          if (animationId.current) {
            cancelAnimationFrame(animationId.current)
            animationId.current = null
          }
          currentIndex.current = 0
          isPaused.current = false
          drawCanvas()
          animationId.current = requestAnimationFrame(() => {
            if (animateRef.current) {
              animateRef.current()
            }
          })
        }
      }),
      [drawCanvas, results]
    )

    const getMousePos = useCallback((event) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }
    }, [])

    const handleMouseDown = useCallback((event) => {
      if (results) return

      const { x, y } = getMousePos(event)
      const { objectX, objectY, wallX, personBaseX } = getSceneAnchors()

      if (lawType === 'first') {
        if (x >= objectX && x <= objectX + 110 && y >= objectY && y <= objectY + 60) {
          setDragState({
            type: 'speed',
            startX: x,
            startY: y,
            value: params.initialVelocity
          })
        }
        return
      }

      if (lawType === 'second') {
        if (x >= objectX - 60 && x <= objectX + 110 && y >= objectY - 10 && y <= objectY + 80) {
          setDragState({
            type: 'force',
            startX: x,
            startY: y,
            value: params.appliedForce
          })
        }
        return
      }

      if (lawType === 'third') {
        let contactHit = false

        if (params.scenarioPreset === 'wall-push') {
          contactHit = x >= personBaseX && x <= wallX + 10 && y >= objectY && y <= objectY + 90
        } else if (params.scenarioPreset === 'skaters') {
          contactHit = y >= objectY && y <= objectY + 110
        } else {
          contactHit = y >= objectY && y <= groundY + 10
        }

        if (contactHit) {
          setDragState({
            type: 'interaction',
            startX: x,
            startY: y,
            value: params.interactionForce
          })
        }
      }
    }, [results, getMousePos, getSceneAnchors, lawType, params, groundY])

    const handleMouseMove = useCallback((event) => {
      if (!dragState) return

      const { x } = getMousePos(event)
      const dx = x - dragState.startX

      if (dragState.type === 'speed') {
        const nextValue = Math.max(-20, Math.min(20, dx / 4))
        setDragState((prev) => ({ ...prev, value: nextValue }))
        onParamChange?.({ initialVelocity: parseFloat(nextValue.toFixed(1)) })
      } else if (dragState.type === 'force') {
        const nextValue = Math.max(0, Math.min(100, dx * 1.2))
        setDragState((prev) => ({ ...prev, value: nextValue }))
        onParamChange?.({ appliedForce: parseFloat(nextValue.toFixed(1)) })
      } else if (dragState.type === 'interaction') {
        const nextValue = Math.max(1, Math.min(100, Math.abs(dx) * 1.4))
        setDragState((prev) => ({ ...prev, value: nextValue }))
        onParamChange?.({ interactionForce: parseFloat(nextValue.toFixed(1)) })
      }

      drawCanvas()
    }, [dragState, getMousePos, onParamChange, drawCanvas])

    const handleMouseUp = useCallback(() => {
      if (dragState) {
        setDragState(null)
        drawCanvas()
      }
    }, [dragState, drawCanvas])

    useEffect(() => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current)
        animationId.current = null
      }

      currentIndex.current = 0
      isPaused.current = false
      drawCanvas()

      const pointLength =
        lawType === 'third'
          ? results?.dual_points?.length || 0
          : results?.points?.length || 0

      if (pointLength > 0) {
        animationId.current = requestAnimationFrame(() => {
          if (animateRef.current) {
            animateRef.current()
          }
        })
      }

      return () => {
        if (animationId.current) {
          cancelAnimationFrame(animationId.current)
          animationId.current = null
        }
      }
    }, [results, lawType, drawCanvas])

    useEffect(() => {
      drawCanvas()
    }, [drawCanvas, dragState])

    return (
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="simulation-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        {!results && (
          <div className="canvas-placeholder">
            <p>Choose a law, choose a scenario, then drag on the scene or use the controls.</p>
          </div>
        )}
      </div>
    )
  }
)

NewtonCanvas.displayName = 'NewtonCanvas'

export default NewtonCanvas