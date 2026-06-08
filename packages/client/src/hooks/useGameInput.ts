import { useEffect, useRef, useState } from 'react'
import { PlayerInput, Vector2 } from '@nebula/shared'
import { useAuthStore } from '../store/authStore'

interface InputState {
  movement: Vector2
  shooting: boolean
  mouseAngle: number
}

export function useGameInput(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  onInput: (input: PlayerInput) => void,
  isPlaying: boolean
) {
  const [keys, setKeys] = useState<Set<string>>(new Set())
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [mousePos, setMousePos] = useState<Vector2>({ x: 0, y: 0 })
  const lastInputTime = useRef(0)
  const inputSeq = useRef(0)
  const playerPos = useRef<Vector2>({ x: 400, y: 300 })

  useEffect(() => {
    if (!isPlaying) return

    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys((prev) => new Set(prev).add(e.key.toLowerCase()))
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys((prev) => {
        const newKeys = new Set(prev)
        newKeys.delete(e.key.toLowerCase())
        return newKeys
      })
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        setIsMouseDown(true)
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        setIsMouseDown(false)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const canvasWidth = rect.width
        const canvasHeight = rect.height
        const mapWidth = 1600
        const mapHeight = 900
        const scale = Math.min(canvasWidth / mapWidth, canvasHeight / mapHeight)
        const offsetX = (canvasWidth - mapWidth * scale) / 2
        const offsetY = (canvasHeight - mapHeight * scale) / 2

        const gameX = (x - offsetX) / scale
        const gameY = (y - offsetY) / scale

        setMousePos({ x: gameX, y: gameY })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isPlaying, canvasRef])

  useEffect(() => {
    if (!isPlaying) return

    let animationId: number

    const sendInput = () => {
      const now = Date.now()
      if (now - lastInputTime.current < 33) {
        animationId = requestAnimationFrame(sendInput)
        return
      }

      lastInputTime.current = now
      inputSeq.current++

      const movement: Vector2 = { x: 0, y: 0 }

      if (keys.has('w') || keys.has('arrowup')) movement.y -= 1
      if (keys.has('s') || keys.has('arrowdown')) movement.y += 1
      if (keys.has('a') || keys.has('arrowleft')) movement.x -= 1
      if (keys.has('d') || keys.has('arrowright')) movement.x += 1

      const angle = Math.atan2(
        mousePos.y - playerPos.current.y,
        mousePos.x - playerPos.current.x
      )

      const input: PlayerInput = {
        seq: inputSeq.current,
        timestamp: now,
        movement,
        shooting: isMouseDown,
        mouseAngle: angle,
      }

      onInput(input)

      animationId = requestAnimationFrame(sendInput)
    }

    animationId = requestAnimationFrame(sendInput)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [isPlaying, keys, isMouseDown, mousePos, onInput])

  const setPlayerPosition = (pos: Vector2) => {
    playerPos.current = pos
  }

  return {
    keys,
    isMouseDown,
    mousePos,
    setPlayerPosition,
  }
}
