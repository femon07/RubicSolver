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
    const alg: string[] = []
    let prev = ''
    for (let i = 0; i < length; i++) {
      let face = faces[Math.floor(Math.random() * faces.length)]
      while (face === prev) {
        face = faces[Math.floor(Math.random() * faces.length)]
      }
      prev = face
      const mod = modifiers[Math.floor(Math.random() * modifiers.length)]
      alg.push(face + mod)
    }
    return alg.join(' ')
  }
}

export const generateScramble = CubeController.generateScramble
