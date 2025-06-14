import { executeMoves } from '../src/lib/moveExecutor'
import type ICubeRenderer from '../src/lib/ICubeRenderer'

jest.useFakeTimers()

test('intervalを指定すると待機する', async () => {
  const renderer: ICubeRenderer = {
    applyMove: jest.fn().mockResolvedValue(undefined),
    getState: () => '',
    reset: () => {},
    dispose: () => {}
  }
  const p = executeMoves(renderer, 'U R', 1000)
  await Promise.resolve()
  expect((renderer.applyMove as jest.Mock).mock.calls).toHaveLength(1)
  jest.advanceTimersByTime(999)
  await Promise.resolve()
  expect((renderer.applyMove as jest.Mock).mock.calls).toHaveLength(1)
  jest.advanceTimersByTime(1)
  await Promise.resolve()
  expect((renderer.applyMove as jest.Mock).mock.calls).toHaveLength(2)
  await p
})
