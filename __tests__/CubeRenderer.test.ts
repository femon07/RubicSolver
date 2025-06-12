import CubeRenderer from '../rubicsolver-app/src/lib/CubeRenderer'
// @ts-ignore
import * as THREE from '../rubicsolver-app/node_modules/three/build/three.cjs'
import { COLORS } from '../rubicsolver-app/src/constants/colors'

jest.mock('../rubicsolver-app/node_modules/gsap', () => ({
  gsap: {
    to: (_: unknown, { onComplete }: { onComplete?: () => void }) => {
      if (onComplete) onComplete()
      return {}
    }
  }
}))

test('初期化時のキュービー配置と色が正しい', () => {
  const renderer = new CubeRenderer()
  const group = new THREE.Group()
  renderer.setGroup(group)
  for (const cubie of renderer.cubies) {
    const mesh = cubie.mesh
    expect(mesh.position.x).toBe(cubie.position.x)
    expect(mesh.position.y).toBe(cubie.position.y)
    expect(mesh.position.z).toBe(cubie.position.z)
    const mats = mesh.material as any
    expect(mats[0].color.getHex()).toBe(COLORS.R)
    expect(mats[1].color.getHex()).toBe(COLORS.L)
    expect(mats[2].color.getHex()).toBe(COLORS.U)
  }
})

test('モデルとレンダラーの状態が一致する', async () => {
  const renderer = new CubeRenderer()
  const group = new THREE.Group()
  renderer.setGroup(group)
  await renderer.applyMove('U')
  const state = renderer.getState()
  const Cube = require('../rubicsolver-app/node_modules/cubejs')
  Cube.initSolver()
  const cube = new Cube()
  cube.move('U')
  expect(state).toBe(cube.asString())
})


