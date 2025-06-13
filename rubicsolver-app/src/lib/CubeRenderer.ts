import * as THREE from 'three'
import { gsap } from 'gsap'
import Cube from 'cubejs'
import { COLORS } from '../constants/colors'

interface Orientation {
  'x+': string | null
  'x-': string | null
  'y+': string | null
  'y-': string | null
  'z+': string | null
  'z-': string | null
}

interface Cubie {
  mesh: THREE.Mesh
  position: THREE.Vector3
  orientation: Orientation
}

export default class CubeRenderer {
  group: THREE.Group | null = null
  cubies: Cubie[] = []
  initialized = false
  cubeModel = new Cube()

  setGroup(node: THREE.Group | null) {
    this.group = node
    if (node && !this.initialized) {
      this.initCube()
      this.initialized = true
    }
  }

  private createCubieMaterials() {
    const faceColors = {
      U: COLORS.U,
      D: COLORS.D,
      L: COLORS.L,
      R: COLORS.R,
      F: COLORS.F,
      B: COLORS.B
    }
    const colors = [faceColors.R, faceColors.L, faceColors.U, faceColors.D, faceColors.F, faceColors.B]
    return colors.map((color) => new THREE.MeshStandardMaterial({ color }))
  }

  private initCube() {
    if (this.group) {
      while (this.group.children.length) {
        this.group.remove(this.group.children[0])
      }
    }
    this.cubeModel = new Cube()
    const cubies: Cubie[] = []
    const baseOrientation: Orientation = {
      'x+': 'R',
      'x-': 'L',
      'y+': 'U',
      'y-': 'D',
      'z+': 'F',
      'z-': 'B'
    }
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const geometry = new THREE.BoxGeometry(0.98, 0.98, 0.98)
          const materials = this.createCubieMaterials()
          const mesh = new THREE.Mesh(geometry, materials)
          mesh.position.set(x, y, z)
          if (this.group) {
            this.group.add(mesh)
          }
          const orientation: Orientation = {
            'x+': x === 1 ? baseOrientation['x+'] : null,
            'x-': x === -1 ? baseOrientation['x-'] : null,
            'y+': y === 1 ? baseOrientation['y+'] : null,
            'y-': y === -1 ? baseOrientation['y-'] : null,
            'z+': z === 1 ? baseOrientation['z+'] : null,
            'z-': z === -1 ? baseOrientation['z-'] : null
          }
          cubies.push({ mesh, position: new THREE.Vector3(x, y, z), orientation })
        }
      }
    }
    this.cubies = cubies
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

  private rotateOrientation(cubie: Cubie, axis: 'x' | 'y' | 'z', angle: number) {
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

  applyMove(move: string) {
    return new Promise<void>((resolve) => {
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
      if (this.group) {
        const rotationGroup = new THREE.Group()
        rotationGroup.position[axis] = layer
        this.group.add(rotationGroup)
        this.group.updateMatrixWorld(true)
        rotationGroup.updateMatrixWorld(true)
        selected.forEach((c) => rotationGroup.attach(c.mesh))
        const params: Record<'x' | 'y' | 'z', number> = { x: 0, y: 0, z: 0 }
        params[axis] = angle
        gsap.to(rotationGroup.rotation, {
          ...params,
          duration: 0.3,
          onComplete: () => {
            rotationGroup.updateMatrixWorld()
            selected.forEach((c) => {
              c.mesh.applyMatrix4(rotationGroup.matrix)
              const v = this.rotateVector(c.position, axis, angle, layer)
              c.position.set(Math.round(v.x), Math.round(v.y), Math.round(v.z))
              c.mesh.position.set(c.position.x, c.position.y, c.position.z)
              this.rotateOrientation(c, axis, angle)
              this.group!.attach(c.mesh)
            })
            this.cubeModel.move(move)
            this.group!.remove(rotationGroup)
            rotationGroup.clear()
            resolve()
          }
        })
      } else {
        selected.forEach((c) => {
          const v = this.rotateVector(c.position, axis, angle, layer)
          c.position.set(Math.round(v.x), Math.round(v.y), Math.round(v.z))
          this.rotateOrientation(c, axis, angle)
        })
        this.cubeModel.move(move)
        resolve()
      }
    })
  }

  getState(): string {
    return this.cubeModel.asString()
  }

  reset() {
    this.initCube()
  }

  dispose() {
    if (!this.group) return
    this.group.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh
        mesh.geometry.dispose()
        const mats = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material]
        mats.forEach((m) => m.dispose())
      }
    })
    while (this.group.children.length) {
      this.group.remove(this.group.children[0])
    }
    this.cubies = []
    this.initialized = false
  }
}
