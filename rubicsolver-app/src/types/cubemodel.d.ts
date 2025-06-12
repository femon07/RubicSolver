export {}

declare global {
  interface Window {
    cubeModel?: {
      applyMoves: (moves: string[]) => Promise<void>
    }
  }
}
