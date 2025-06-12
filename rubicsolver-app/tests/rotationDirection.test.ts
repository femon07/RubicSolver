import CubeRenderer from '../src/lib/CubeRenderer'
import * as THREE from 'three'

jest.mock('gsap', () => ({
  gsap: {
    to: (_target: unknown, { onComplete }: { onComplete?: () => void }) => {
      if (onComplete) onComplete()
      return {}
    }
  }
}))

type Case = { move: string; start: [number, number, number]; expected: [number, number, number] }

const cases: Case[] = [
  { move: 'U', start: [1, 1, 1], expected: [-1, 1, 1] },
  { move: 'D', start: [1, -1, 1], expected: [1, -1, -1] },
  { move: 'R', start: [1, 1, 1], expected: [1, 1, -1] },
  { move: 'L', start: [-1, 1, 1], expected: [-1, -1, 1] },
  { move: 'F', start: [1, 1, 1], expected: [1, -1, 1] },
  { move: 'B', start: [1, 1, -1], expected: [-1, 1, -1] }
]

describe('単独回転の方向確認', () => {
  it.each(cases)('%s 面の回転で座標が正しい', async ({ move, start, expected }) => {
    const renderer = new CubeRenderer()
    const group = new THREE.Group()
    renderer.setGroup(group)
    const cubie = renderer.cubies.find(
      (c) => c.position.x === start[0] && c.position.y === start[1] && c.position.z === start[2]
    )
    expect(cubie).toBeDefined()
    await renderer.applyMove(move)
    expect(cubie!.position.x).toBe(expected[0])
    expect(cubie!.position.y).toBe(expected[1])
    expect(cubie!.position.z).toBe(expected[2])
  })

  it('U面回転後もy=1のキュービーは全てy=1のまま', async () => {
    const renderer = new CubeRenderer()
    const group = new THREE.Group()
    renderer.setGroup(group)
    const layer = renderer.cubies.filter((c) => c.position.y === 1)
    await renderer.applyMove('U')
    for (const c of layer) {
      expect(c.position.y).toBe(1)
    }
  })
})
