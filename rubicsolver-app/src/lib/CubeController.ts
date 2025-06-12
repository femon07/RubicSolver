import Cube from 'cubejs'

export default class CubeController {
  cube: Cube

  constructor() {
    this.cube = new Cube()
  }

  reset() {
    this.cube = new Cube()
  }

  applyMove(move: string) {
    this.cube.move(move)
  }

  executeMoves(algorithm: string) {
    this.cube.move(algorithm)
  }

  solve(): string {
    return this.cube.solve()
  }

  getState(): string {
    return this.cube.asString()
  }

  static generateScramble(length: number) {
    const faces = ['U', 'D', 'L', 'R', 'F', 'B']
    const modifiers = ['', "'", '2']
    const axisMap: Record<string, string> = {
      U: 'UD',
      D: 'UD',
      L: 'LR',
      R: 'LR',
      F: 'FB',
      B: 'FB'
    }
    const alg: string[] = []
    let prevAxis = ''
    let prevFace = ''
    for (let i = 0; i < length; i++) {
      let face = faces[Math.floor(Math.random() * faces.length)]
      let axis = axisMap[face]
      while (face === prevFace || axis === prevAxis) {
        face = faces[Math.floor(Math.random() * faces.length)]
        axis = axisMap[face]
      }
      prevFace = face
      prevAxis = axis
      const mod = modifiers[Math.floor(Math.random() * modifiers.length)]
      alg.push(face + mod)
    }
    return alg.join(' ')
  }
}

export const generateScramble = CubeController.generateScramble
