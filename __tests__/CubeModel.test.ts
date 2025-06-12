import CubeModel from '../rubicsolver-app/src/model/CubeModel'
import { COLORS } from '../rubicsolver-app/src/constants/colors'

const map = {
  U: COLORS.U,
  R: COLORS.R,
  F: COLORS.F,
  D: COLORS.D,
  L: COLORS.L,
  B: COLORS.B
}

const expectedState = (alg: string) => {
  const Cube = require('../rubicsolver-app/node_modules/cubejs')
  Cube.initSolver()
  const cube = new Cube()
  cube.move(alg)
  return cube.asString().split('').map((c: string) => map[c as keyof typeof map])
}

test("初期状態で U' を適用すると正しい面配置になる", () => {
  const model = new CubeModel()
  model.applyMoves("U'")
  expect(model.getFacelets()).toEqual(expectedState("U'"))
})

test('R を適用すると正しい状態になる', () => {
  const model = new CubeModel()
  model.applyMoves('R')
  expect(model.getFacelets()).toEqual(expectedState('R'))
})

test('L を適用すると正しい状態になる', () => {
  const model = new CubeModel()
  model.applyMoves('L')
  expect(model.getFacelets()).toEqual(expectedState('L'))
})

test('F を適用すると正しい状態になる', () => {
  const model = new CubeModel()
  model.applyMoves('F')
  expect(model.getFacelets()).toEqual(expectedState('F'))
})


