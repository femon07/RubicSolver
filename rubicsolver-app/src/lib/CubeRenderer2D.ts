import type ICubeRenderer from './ICubeRenderer'
import Cube from 'cubejs'

export default class CubeRenderer2D implements ICubeRenderer {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private cell = 30
  private cube = new Cube()

  setCanvas(el: HTMLCanvasElement | null) {
    this.canvas = el
    if (el) {
      if (process.env.NODE_ENV !== 'test') {
        try {
          this.ctx = el.getContext('2d')
        } catch {
          this.ctx = null
        }
      }
      this.draw()
    }
  }

  private colorMap: Record<string, string> = {
    U: '#ffffff',
    D: '#ffff00',
    L: '#ff8000',
    R: '#ff0000',
    F: '#00ff00',
    B: '#0000ff'
  }

  private draw() {
    if (!this.canvas) return
    const ctx = this.ctx
    const c = this.cell
    this.canvas.width = c * 8
    this.canvas.height = c * 8
    if (!ctx) return
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    const centerX = this.canvas.width / 2
    const centerY = c * 3
    const iso = (x: number, y: number, z: number) => {
      const ang = Math.PI / 4
      const ix = (x - z) * Math.cos(ang) * c + centerX
      const iy = (x + z) * Math.sin(ang) * c - y * c + centerY
      return { x: ix, y: iy }
    }

    const drawQuad = (pts: Array<{ x: number; y: number }>, color: string) => {
      ctx.fillStyle = color
      ctx.strokeStyle = '#000'
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let k = 1; k < pts.length; k++) {
        ctx.lineTo(pts[k].x, pts[k].y)
      }
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }

    const state = this.cube.asString()
    const faces = state.match(/.{9}/g)!

    // U face
    const drawTop = () => {
      const face = faces[0]
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const color = this.colorMap[face[i * 3 + j] as keyof typeof this.colorMap]
          const p1 = iso(j, 3, i)
          const p2 = iso(j + 1, 3, i)
          const p3 = iso(j + 1, 3, i + 1)
          const p4 = iso(j, 3, i + 1)
          drawQuad([p1, p2, p3, p4], color)
        }
      }
    }

    // F face
    const drawFront = () => {
      const face = faces[2]
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const color = this.colorMap[face[i * 3 + j] as keyof typeof this.colorMap]
          const yTop = 3 - i
          const yBottom = 2 - i
          const p1 = iso(j, yTop, 3)
          const p2 = iso(j + 1, yTop, 3)
          const p3 = iso(j + 1, yBottom, 3)
          const p4 = iso(j, yBottom, 3)
          drawQuad([p1, p2, p3, p4], color)
        }
      }
    }

    // R face
    const drawRight = () => {
      const face = faces[1]
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const color = this.colorMap[face[i * 3 + j] as keyof typeof this.colorMap]
          const yTop = 3 - i
          const yBottom = 2 - i
          const zFront = 3 - j
          const zBack = 2 - j
          const p1 = iso(3, yTop, zFront)
          const p2 = iso(3, yTop, zBack)
          const p3 = iso(3, yBottom, zBack)
          const p4 = iso(3, yBottom, zFront)
          drawQuad([p1, p2, p3, p4], color)
        }
      }
    }

    drawTop()
    drawFront()
    drawRight()
  }

  async applyMove(move: string) {
    this.cube.move(move)
    this.draw()
  }

  getState(): string {
    return this.cube.asString()
  }

  reset() {
    this.cube = new Cube()
    this.draw()
  }

  dispose() {
    // no resources
  }
}
