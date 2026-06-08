import {
  GameStateData,
  PlayerState,
  BulletState,
  PowerUpState,
  Vector2,
} from '@nebula/shared'
import { GAME_CONFIG, COLORS } from '@nebula/shared'
import { lerp, lerpVector2 } from '@nebula/shared'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

export class GameRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private width: number = 0
  private height: number = 0
  private scale: number = 1
  private offsetX: number = 0
  private offsetY: number = 0

  private previousState: GameStateData | null = null
  private currentState: GameStateData | null = null
  private particles: Particle[] = []

  private animationFrameId: number | null = null
  private lastTime: number = 0
  private isRunning: boolean = false

  private stars: { x: number; y: number; size: number; brightness: number }[] = []

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.resize()
    this.initStars()
    window.addEventListener('resize', () => this.resize())
  }

  private initStars(): void {
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random() * GAME_CONFIG.MAP.WIDTH,
        y: Math.random() * GAME_CONFIG.MAP.HEIGHT,
        size: Math.random() * 2 + 0.5,
        brightness: Math.random(),
      })
    }
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect()
    this.canvas.width = rect.width * window.devicePixelRatio
    this.canvas.height = rect.height * window.devicePixelRatio
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    this.width = rect.width
    this.height = rect.height

    const scaleX = this.width / GAME_CONFIG.MAP.WIDTH
    const scaleY = this.height / GAME_CONFIG.MAP.HEIGHT
    this.scale = Math.min(scaleX, scaleY)

    const mapWidth = GAME_CONFIG.MAP.WIDTH * this.scale
    const mapHeight = GAME_CONFIG.MAP.HEIGHT * this.scale
    this.offsetX = (this.width - mapWidth) / 2
    this.offsetY = (this.height - mapHeight) / 2
  }

  setGameState(state: GameStateData): void {
    this.previousState = this.currentState
    this.currentState = state
  }

  start(): void {
    if (this.isRunning) return
    this.isRunning = true
    this.lastTime = performance.now()
    this.animate()
  }

  stop(): void {
    this.isRunning = false
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  private animate = (): void => {
    if (!this.isRunning) return

    const now = performance.now()
    const deltaTime = (now - this.lastTime) / 1000
    this.lastTime = now

    this.update(deltaTime)
    this.render()

    this.animationFrameId = requestAnimationFrame(this.animate)
  }

  private update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.x += p.vx * deltaTime
      p.y += p.vy * deltaTime
      p.life -= deltaTime * 1000

      if (p.life <= 0) {
        this.particles.splice(i, 1)
      }
    }
  }

  private render(): void {
    const ctx = this.ctx

    ctx.clearRect(0, 0, this.width, this.height)

    ctx.save()
    ctx.translate(this.offsetX, this.offsetY)
    ctx.scale(this.scale, this.scale)

    this.renderBackground()
    this.renderBorder()
    this.renderPowerUps()
    this.renderBullets()
    this.renderPlayers()
    this.renderParticles()

    ctx.restore()
  }

  private renderBackground(): void {
    const ctx = this.ctx

    const gradient = ctx.createRadialGradient(
      GAME_CONFIG.MAP.WIDTH / 2,
      GAME_CONFIG.MAP.HEIGHT / 2,
      0,
      GAME_CONFIG.MAP.WIDTH / 2,
      GAME_CONFIG.MAP.HEIGHT / 2,
      GAME_CONFIG.MAP.WIDTH / 2
    )
    gradient.addColorStop(0, '#1a1f3a')
    gradient.addColorStop(1, '#0a0e27')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, GAME_CONFIG.MAP.WIDTH, GAME_CONFIG.MAP.HEIGHT)

    for (const star of this.stars) {
      const alpha = 0.3 + star.brightness * 0.5 + Math.sin(Date.now() / 1000 + star.x) * 0.2
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)'
    ctx.lineWidth = 1
    const gridSize = 100
    for (let x = 0; x <= GAME_CONFIG.MAP.WIDTH; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, GAME_CONFIG.MAP.HEIGHT)
      ctx.stroke()
    }
    for (let y = 0; y <= GAME_CONFIG.MAP.HEIGHT; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(GAME_CONFIG.MAP.WIDTH, y)
      ctx.stroke()
    }
  }

  private renderBorder(): void {
    const ctx = this.ctx

    ctx.strokeStyle = COLORS.primary
    ctx.lineWidth = 4
    ctx.shadowColor = COLORS.primary
    ctx.shadowBlur = 20

    ctx.strokeRect(2, 2, GAME_CONFIG.MAP.WIDTH - 4, GAME_CONFIG.MAP.HEIGHT - 4)

    ctx.shadowBlur = 0
  }

  private renderPlayers(): void {
    if (!this.currentState) return

    const players = Object.values(this.currentState.players)

    for (const player of players) {
      this.renderPlayer(player)
    }
  }

  private renderPlayer(player: PlayerState): void {
    const ctx = this.ctx
    const { x, y } = player.position

    if (!player.isAlive) {
      ctx.globalAlpha = 0.3
    }

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(player.rotation)

    const size = GAME_CONFIG.PLAYER.SIZE

    ctx.shadowColor = COLORS.primary
    ctx.shadowBlur = 15

    ctx.fillStyle = COLORS.primary
    ctx.beginPath()
    ctx.moveTo(size, 0)
    ctx.lineTo(-size * 0.7, -size * 0.6)
    ctx.lineTo(-size * 0.4, 0)
    ctx.lineTo(-size * 0.7, size * 0.6)
    ctx.closePath()
    ctx.fill()

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.shadowBlur = 0

    if (player.energy > 0) {
      ctx.fillStyle = `rgba(255, 107, 53, ${0.5 + Math.sin(Date.now() / 100) * 0.3})`
      ctx.beginPath()
      ctx.moveTo(-size * 0.4, -size * 0.3)
      ctx.lineTo(-size * 0.8 - Math.random() * 10, 0)
      ctx.lineTo(-size * 0.4, size * 0.3)
      ctx.closePath()
      ctx.fill()
    }

    ctx.restore()

    if (player.isAlive) {
      const barWidth = 50
      const barHeight = 6
      const barX = x - barWidth / 2
      const barY = y - GAME_CONFIG.PLAYER.SIZE - 15

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillRect(barX, barY, barWidth, barHeight)

      const healthPercent = player.health / player.maxHealth
      let healthColor = COLORS.success
      if (healthPercent < 0.3) healthColor = COLORS.danger
      else if (healthPercent < 0.6) healthColor = COLORS.warning

      ctx.fillStyle = healthColor
      ctx.shadowColor = healthColor
      ctx.shadowBlur = 5
      ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight)
      ctx.shadowBlur = 0

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 1
      ctx.strokeRect(barX, barY, barWidth, barHeight)
    }

    ctx.globalAlpha = 1
  }

  private renderBullets(): void {
    if (!this.currentState) return

    const ctx = this.ctx

    for (const bullet of this.currentState.bullets) {
      ctx.save()
      ctx.translate(bullet.position.x, bullet.position.y)

      const angle = Math.atan2(bullet.velocity.y, bullet.velocity.x)
      ctx.rotate(angle)

      const gradient = ctx.createLinearGradient(-20, 0, 5, 0)
      gradient.addColorStop(0, 'rgba(0, 240, 255, 0)')
      gradient.addColorStop(1, COLORS.primary)

      ctx.fillStyle = gradient
      ctx.shadowColor = COLORS.primary
      ctx.shadowBlur = 10

      ctx.beginPath()
      ctx.ellipse(0, 0, 10, GAME_CONFIG.BULLET.SIZE, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.shadowBlur = 0
      ctx.restore()
    }
  }

  private renderPowerUps(): void {
    if (!this.currentState) return

    const ctx = this.ctx

    for (const powerUp of this.currentState.powerUps) {
      if (powerUp.respawnTime > 0) continue

      const pulse = 1 + Math.sin(Date.now() / 200) * 0.2
      const size = 15 * pulse

      let color = COLORS.success
      switch (powerUp.type) {
        case 'health':
          color = COLORS.danger
          break
        case 'energy':
          color = COLORS.warning
          break
        case 'speed':
          color = COLORS.primary
          break
        case 'damage':
          color = COLORS.secondary
          break
      }

      ctx.save()
      ctx.translate(powerUp.position.x, powerUp.position.y)

      ctx.shadowColor = color
      ctx.shadowBlur = 20

      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(0, 0, size, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = color
      ctx.globalAlpha = 0.3
      ctx.beginPath()
      ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2)
      ctx.fill()

      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
      ctx.restore()
    }
  }

  private renderParticles(): void {
    const ctx = this.ctx

    for (const p of this.particles) {
      const alpha = p.life / p.maxLife
      ctx.globalAlpha = alpha
      ctx.fillStyle = p.color
      ctx.shadowColor = p.color
      ctx.shadowBlur = 5
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
  }

  spawnExplosion(x: number, y: number, color: string, count: number = 20): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 50 + Math.random() * 150

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 500 + Math.random() * 500,
        maxLife: 1000,
        color,
        size: 2 + Math.random() * 4,
      })
    }
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas
  }

  destroy(): void {
    this.stop()
    window.removeEventListener('resize', () => this.resize())
  }
}
