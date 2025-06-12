import Cube from 'cubejs'
import { COLORS } from '../constants/colors'

export default class CubeModel {
  private cube: Cube

  constructor() {
    this.cube = new Cube()
  }

  applyMoves(alg: string) {
    this.cube.move(alg)
  }

  getFacelets(): number[] {
    const str = this.cube.asString()
    const map: Record<string, number> = {
      U: COLORS.U,
      D: COLORS.D,
      L: COLORS.L,
      R: COLORS.R,
      F: COLORS.F,
      B: COLORS.B
    }
    return str.split('').map((c) => map[c])
  }
}
