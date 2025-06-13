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



test('R を適用すると cubie の座標と向きが正しい', async () => {
  const renderer = new CubeRenderer()
  const group = new THREE.Group()
  renderer.setGroup(group)
  const target = renderer.cubies.find(
    (c) => c.position.x === 1 && c.position.y === 1 && c.position.z === 1
  )!
  await renderer.applyMove('R')
  expect(target.position.x).toBe(1)
  expect(target.position.y).toBe(1)
  expect(target.position.z).toBe(-1)
  expect(target.orientation).toEqual({
    'x+': 'R',
    'x-': null,
    'y+': 'F',
    'y-': null,
    'z+': null,
    'z-': 'U'
  })
})

test('R2 を適用すると cubie の座標と向きが正しい', async () => {
  const renderer = new CubeRenderer()
  const group = new THREE.Group()
  renderer.setGroup(group)
  const target = renderer.cubies.find(
    (c) => c.position.x === 1 && c.position.y === 1 && c.position.z === 1
  )!
  await renderer.applyMove('R2')
  expect(target.position.x).toBe(1)
  expect(target.position.y).toBe(-1)
  expect(target.position.z).toBe(-1)
  expect(target.orientation).toEqual({
    'x+': 'R',
    'x-': null,
    'y+': null,
    'y-': 'U',
    'z+': null,
    'z-': 'F'
  })
})

test('F を適用すると cubie の座標と向きが正しい', async () => {
  const renderer = new CubeRenderer()
  const group = new THREE.Group()
  renderer.setGroup(group)
  const target = renderer.cubies.find(
    (c) => c.position.x === 1 && c.position.y === 1 && c.position.z === 1
  )!
  await renderer.applyMove('F')
  expect(target.position.x).toBe(1)
  expect(target.position.y).toBe(-1)
  expect(target.position.z).toBe(1)
  expect(target.orientation).toEqual({
    'x+': 'U',
    'x-': null,
    'y+': null,
    'y-': 'R',
    'z+': 'F',
    'z-': null
  })
})
