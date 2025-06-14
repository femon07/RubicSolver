import type ICubeRenderer from './ICubeRenderer'
import Cube from 'cubejs'
import * as THREE from 'three'

interface Orientation {
  'x+': string | null
  'x-': string | null
  'y+': string | null
  'y-': string | null
  'z+': string | null
  'z-': string | null
}

interface Cubie {
  position: THREE.Vector3
  orientation: Orientation
}

export default class CubeRenderer2D implements ICubeRenderer {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private cell = 30
  private cube = new Cube()
  private cubies: Cubie[] = []

  constructor() {
    this.initCubies()
  }

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
      this.initCubies()
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

  private initCubies() {
    const base: Orientation = {
      'x+': 'R',
      'x-': 'L',
      'y+': 'U',
      'y-': 'D',
      'z+': 'F',
      'z-': 'B'
    }
    this.cubies = []
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const ori: Orientation = {
            'x+': x === 1 ? base['x+'] : null,
            'x-': x === -1 ? base['x-'] : null,
            'y+': y === 1 ? base['y+'] : null,
            'y-': y === -1 ? base['y-'] : null,
            'z+': z === 1 ? base['z+'] : null,
            'z-': z === -1 ? base['z-'] : null
          }
          this.cubies.push({
            position: new THREE.Vector3(x, y, z),
            orientation: ori
          })
        }
      }
    }
  }

  private iso(x: number, y: number, z: number) {
    const c = this.cell
    const centerX = (this.canvas?.width || 0) / 2
    const centerY = c * 3
    const ang = Math.PI / 4
    const ix = (x - z) * Math.cos(ang) * c + centerX
    const iy = (x + z) * Math.sin(ang) * c - y * c + centerY
    return { x: ix, y: iy }
  }

  private rotateVector(
    v: THREE.Vector3,
    axis: 'x' | 'y' | 'z',
    angle: number,
    offset = 0
  ) {
    const m = new THREE.Matrix4()
    const t = new THREE.Matrix4()
    const tInv = new THREE.Matrix4()
    if (axis === 'x') {
      m.makeRotationX(angle)
      t.makeTranslation(-offset, 0, 0)
      tInv.makeTranslation(offset, 0, 0)
    }
    if (axis === 'y') {
      m.makeRotationY(angle)
      t.makeTranslation(0, -offset, 0)
      tInv.makeTranslation(0, offset, 0)
    }
    if (axis === 'z') {
      m.makeRotationZ(angle)
      t.makeTranslation(0, 0, -offset)
      tInv.makeTranslation(0, 0, offset)
    }
    return v.clone().applyMatrix4(t).applyMatrix4(m).applyMatrix4(tInv)
  }

  private rotateOrientation(
    cubie: Cubie,
    axis: 'x' | 'y' | 'z',
    angle: number
  ) {
    const dirs: Record<string, THREE.Vector3> = {
      'x+': new THREE.Vector3(1, 0, 0),
      'x-': new THREE.Vector3(-1, 0, 0),
      'y+': new THREE.Vector3(0, 1, 0),
      'y-': new THREE.Vector3(0, -1, 0),
      'z+': new THREE.Vector3(0, 0, 1),
      'z-': new THREE.Vector3(0, 0, -1)
    }
    const newOri: Orientation = {
      'x+': null,
      'x-': null,
      'y+': null,
      'y-': null,
      'z+': null,
      'z-': null
    }
    ;(Object.keys(dirs) as Array<keyof Orientation>).forEach((k) => {
      const vec = this.rotateVector(dirs[k], axis, angle)
      const key = (() => {
        if (Math.round(vec.x) === 1) return 'x+'
        if (Math.round(vec.x) === -1) return 'x-'
        if (Math.round(vec.y) === 1) return 'y+'
        if (Math.round(vec.y) === -1) return 'y-'
        if (Math.round(vec.z) === 1) return 'z+'
        return 'z-' as const
      })()
      newOri[key] = cubie.orientation[k]
    })
    cubie.orientation = newOri
  }

  private getTempOrientation(
    cubie: Cubie,
    axis: 'x' | 'y' | 'z',
    angle: number
  ): Orientation {
    const dirs: Record<string, THREE.Vector3> = {
      'x+': new THREE.Vector3(1, 0, 0),
      'x-': new THREE.Vector3(-1, 0, 0),
      'y+': new THREE.Vector3(0, 1, 0),
      'y-': new THREE.Vector3(0, -1, 0),
      'z+': new THREE.Vector3(0, 0, 1),
      'z-': new THREE.Vector3(0, 0, -1)
    }
    const newOri: Orientation = {
      'x+': null,
      'x-': null,
      'y+': null,
      'y-': null,
      'z+': null,
      'z-': null
    }
    ;(Object.keys(dirs) as Array<keyof Orientation>).forEach((k) => {
      const vec = this.rotateVector(dirs[k], axis, angle)
      const key = (() => {
        if (Math.round(vec.x) === 1) return 'x+'
        if (Math.round(vec.x) === -1) return 'x-'
        if (Math.round(vec.y) === 1) return 'y+'
        if (Math.round(vec.y) === -1) return 'y-'
        if (Math.round(vec.z) === 1) return 'z+'
        return 'z-' as const
      })()
      newOri[key] = cubie.orientation[k]
    })
    return newOri
  }

  private draw(
    rotation?: { selected: Cubie[]; axis: 'x' | 'y' | 'z'; layer: number; angle: number }
  ) {
    if (!this.canvas) return
    const ctx = this.ctx
    const c = this.cell
    this.canvas.width = c * 8
    this.canvas.height = c * 8
    if (!ctx) return
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

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

    const cubies = [...this.cubies].sort(
      (a, b) => a.position.x + a.position.y + a.position.z - (b.position.x + b.position.y + b.position.z)
    )

    for (const cubie of cubies) {
      let pos = cubie.position
      let ori = cubie.orientation
      if (rotation && rotation.selected.includes(cubie)) {
        pos = this.rotateVector(cubie.position, rotation.axis, rotation.angle, rotation.layer)
        ori = this.getTempOrientation(cubie, rotation.axis, rotation.angle)
      }

      const { x, y, z } = pos
      const size = 1

      if (ori['y+']) {
        const p1 = this.iso(x, y + size, z)
        const p2 = this.iso(x + size, y + size, z)
        const p3 = this.iso(x + size, y + size, z + size)
        const p4 = this.iso(x, y + size, z + size)
        drawQuad([p1, p2, p3, p4], this.colorMap[ori['y+']])
      }

      if (ori['z+']) {
        const p1 = this.iso(x, y + size, z + size)
        const p2 = this.iso(x + size, y + size, z + size)
        const p3 = this.iso(x + size, y, z + size)
        const p4 = this.iso(x, y, z + size)
        drawQuad([p1, p2, p3, p4], this.colorMap[ori['z+']])
      }

      if (ori['x+']) {
        const p1 = this.iso(x + size, y + size, z)
        const p2 = this.iso(x + size, y + size, z + size)
        const p3 = this.iso(x + size, y, z + size)
        const p4 = this.iso(x + size, y, z)
        drawQuad([p1, p2, p3, p4], this.colorMap[ori['x+']])
      }
    }
  }

  async applyMove(move: string) {
    const face = move[0] as 'U' | 'D' | 'L' | 'R' | 'F' | 'B'
    const modifier = move.length > 1 ? move[1] : ''
    const axisMap: Record<string, { axis: 'x' | 'y' | 'z'; layer: number; dir: 1 | -1 }> = {
      U: { axis: 'y', layer: 1, dir: -1 },
      D: { axis: 'y', layer: -1, dir: 1 },
      R: { axis: 'x', layer: 1, dir: -1 },
      L: { axis: 'x', layer: -1, dir: 1 },
      F: { axis: 'z', layer: 1, dir: -1 },
      B: { axis: 'z', layer: -1, dir: 1 }
    }
    const { axis, layer, dir } = axisMap[face]
    let angle = (Math.PI / 2) * dir
    if (modifier === "'") angle *= -1
    if (modifier === '2') angle *= 2

    const selected = this.cubies.filter((c) => Math.round(c.position[axis]) === layer)

    if (process.env.NODE_ENV === 'test') {
      selected.forEach((c) => {
        const v = this.rotateVector(c.position, axis, angle, layer)
        c.position.set(Math.round(v.x), Math.round(v.y), Math.round(v.z))
        this.rotateOrientation(c, axis, angle)
      })
      this.cube.move(move)
      this.draw()
      return Promise.resolve()
    }

    const duration = 300
    const start = performance.now()

    return new Promise<void>((resolve) => {
      const animate = () => {
        const now = performance.now()
        const t = Math.min((now - start) / duration, 1)
        const current = angle * t
        this.draw({ selected, axis, layer, angle: current })
        if (t < 1) {
          requestAnimationFrame(animate)
        } else {
          selected.forEach((c) => {
            const v = this.rotateVector(c.position, axis, angle, layer)
            c.position.set(Math.round(v.x), Math.round(v.y), Math.round(v.z))
            this.rotateOrientation(c, axis, angle)
          })
          this.cube.move(move)
          this.draw()
          resolve()
        }
      }
      requestAnimationFrame(animate)
    })
  }

  getState(): string {
    return this.cube.asString()
  }

  reset() {
    this.cube = new Cube()
    this.initCubies()
    this.draw()
  }

  dispose() {
    // no resources
  }
}
