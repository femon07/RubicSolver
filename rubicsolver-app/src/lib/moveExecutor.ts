import type ICubeRenderer from './ICubeRenderer'

export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function executeMoves(
  renderer: ICubeRenderer,
  algorithm: string,
  interval = 0
) {
  const moves = algorithm.split(' ').filter(Boolean)
  for (let i = 0; i < moves.length; i++) {
    await renderer.applyMove(moves[i])
    if (interval > 0 && i < moves.length - 1) {
      await wait(interval)
    }
  }
}
