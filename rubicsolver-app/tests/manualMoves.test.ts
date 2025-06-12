import CubeController from '../src/lib/CubeController'
import Cube from 'cubejs'

// 1手動かして正しい状態か確認
it('U面を1回回した状態が正しい', () => {
  Cube.initSolver()
  const controller = new CubeController()
  controller.applyMove('U')
  const cube = new Cube()
  cube.move('U')
  const expected = cube.asString()
  expect(controller.getState()).toBe(expected)
})

// 別の面をさらに1手動かして正しい状態か確認
it('U面に続いてF面を1回回した状態が正しい', () => {
  Cube.initSolver()
  const controller = new CubeController()
  controller.applyMove('U')
  controller.applyMove('F')
  const cube = new Cube()
  cube.move('U F')
  const expected = cube.asString()
  expect(controller.getState()).toBe(expected)
})
