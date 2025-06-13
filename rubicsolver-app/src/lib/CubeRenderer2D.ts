import ICubeRenderer from './ICubeRenderer'
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
    if (!this.ctx || !this.canvas) return
    const ctx = this.ctx
    const c = this.cell
    this.canvas.width = c * 12
    this.canvas.height = c * 9
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    const state = this.cube.asString()
    const faces = state.match(/.{9}/g)!
    const drawFace = (index: number, ox: number, oy: number) => {
      const face = faces[index]
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const color = this.colorMap[face[i * 3 + j] as keyof typeof this.colorMap]
          ctx.fillStyle = color
          ctx.strokeStyle = '#000'
          ctx.fillRect(ox + j * c, oy + i * c, c, c)
          ctx.strokeRect(ox + j * c, oy + i * c, c, c)
        }
      }
    }
    drawFace(0, c * 3, 0)
    drawFace(4, 0, c * 3)
    drawFace(2, c * 3, c * 3)
    drawFace(1, c * 6, c * 3)
    drawFace(5, c * 9, c * 3)
    drawFace(3, c * 3, c * 6)
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
