import * as THREE from 'three'
import { gsap } from 'gsap'
import { COLORS } from '../constants/colors'

interface Cubie {
  mesh: THREE.Mesh
  position: THREE.Vector3
}

export default class CubeRenderer {
  group: THREE.Group | null = null
  cubies: Cubie[] = []
  initialized = false

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
    if (!this.group) return
    while (this.group.children.length) {
      this.group.remove(this.group.children[0])
    }
    const cubies: Cubie[] = []
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const geometry = new THREE.BoxGeometry(0.98, 0.98, 0.98)
          const materials = this.createCubieMaterials()
          const mesh = new THREE.Mesh(geometry, materials)
          mesh.position.set(x, y, z)
          this.group.add(mesh)
          cubies.push({ mesh, position: new THREE.Vector3(x, y, z) })
        }
      }
    }
    this.cubies = cubies
  }

  private rotateVector(v: THREE.Vector3, axis: 'x' | 'y' | 'z', angle: number) {
    const m = new THREE.Matrix4()
    if (axis === 'x') m.makeRotationX(angle)
    if (axis === 'y') m.makeRotationY(angle)
    if (axis === 'z') m.makeRotationZ(angle)
    return v.clone().applyMatrix4(m)
  }

  applyMove(move: string) {
    return new Promise<void>((resolve) => {
      if (!this.group) return resolve()
      const face = move[0] as 'U' | 'D' | 'L' | 'R' | 'F' | 'B'
      const modifier = move.length > 1 ? move[1] : ''
      const axisMap: Record<string, { axis: 'x' | 'y' | 'z'; layer: number; dir: 1 | -1 }> = {
        U: { axis: 'y', layer: 1, dir: 1 },
        D: { axis: 'y', layer: -1, dir: -1 },
        R: { axis: 'x', layer: 1, dir: 1 },
        L: { axis: 'x', layer: -1, dir: -1 },
        F: { axis: 'z', layer: 1, dir: 1 },
        B: { axis: 'z', layer: -1, dir: -1 }
      }
      const { axis, layer, dir } = axisMap[face]
      let angle = (Math.PI / 2) * dir
      if (modifier === "'") angle *= -1
      if (modifier === '2') angle *= 2

      const selected = this.cubies.filter((c) => Math.round(c.position[axis]) === layer)
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
            const v = this.rotateVector(c.position, axis, angle)
            c.position.set(Math.round(v.x), Math.round(v.y), Math.round(v.z))
            c.mesh.position.set(c.position.x, c.position.y, c.position.z)
            this.group!.attach(c.mesh)
          })
          this.group!.remove(rotationGroup)
          rotationGroup.clear()
          resolve()
        }
      })
    })
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
