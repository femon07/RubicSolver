import CubeRenderer2D from '../rubicsolver-app/src/lib/CubeRenderer2D'
// @ts-ignore
import Cube from '../rubicsolver-app/node_modules/cubejs'

Cube.initSolver()

it('applyMove 後の状態がモデルと一致する', async () => {
  const renderer = new CubeRenderer2D()
  await renderer.applyMove('U')
  const cube = new Cube()
  cube.move('U')
  expect(renderer.getState()).toBe(cube.asString())
})
