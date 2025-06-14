import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import RubiksCube from '../src/components/RubiksCube2D'
import Cube from 'cubejs'
import { getAlgorithmSteps } from '../src/lib/algorithmExplanation'

jest.setTimeout(10000)

jest.mock('gsap', () => ({
  gsap: {
    to: (_: unknown, { onComplete }: { onComplete?: () => void }) => {
      if (onComplete) onComplete()
      return {}
    }
  },
  to: (_: unknown, { onComplete }: { onComplete?: () => void }) => {
    if (onComplete) onComplete()
    return {}
  }
}))

test('getAlgorithmSteps が手順リストを返す', () => {
  const steps = getAlgorithmSteps()
  expect(Array.isArray(steps)).toBe(true)
  expect(steps.length).toBeGreaterThan(0)
  expect(steps[0]).toContain('十字')
})

test('そろえる実行後にアルゴリズム解説が表示される', async () => {
  Cube.initSolver()
  render(<RubiksCube />)
  const input = screen.getByLabelText('手数:') as HTMLInputElement
  fireEvent.change(input, { target: { value: 1 } })
  fireEvent.click(screen.getByText('ランダム'))
  await waitFor(() => {
    const solved = new Cube().asString()
    expect(screen.getByTestId('cube-state').textContent).not.toBe(solved)
  })
  fireEvent.click(screen.getByText('そろえる'))
  await waitFor(() => {
    expect(screen.getByTestId('algorithm-explanation')).toBeInTheDocument()
  })
})
