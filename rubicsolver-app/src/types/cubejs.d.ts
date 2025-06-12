declare module 'cubejs' {
  class Cube {
    constructor(state?: unknown)
    move(alg: string): void
    randomize(): void
    solve(maxDepth?: number): string
    isSolved(): boolean
    asString(): string
    static random(): Cube
    static initSolver(): void
    static scramble(): string
  }
  export default Cube
}
