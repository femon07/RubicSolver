import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import RubiksCube from '../src/components/RubiksCube2D'
import Cube from 'cubejs'

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

test('一手すすめるで段階的に解法を実行できる', async () => {
  Cube.initSolver()
  render(<RubiksCube />)
  const input = screen.getByLabelText('手数:') as HTMLInputElement
  fireEvent.change(input, { target: { value: 1 } })
  fireEvent.click(screen.getByText('ランダム'))
  await waitFor(() => {
    expect(screen.getByTestId('cube-state').textContent).not.toBe(new Cube().asString())
  })
  fireEvent.click(screen.getByText('そろえる'))
  await waitFor(() => {
    expect(screen.getByText('一手すすめる')).toBeInTheDocument()
  })
  const before = screen.getByTestId('cube-state').textContent
  fireEvent.click(screen.getByText('一手すすめる'))
  await waitFor(() => {
    expect(screen.getByTestId('cube-state').textContent).not.toBe(before)
  })
  fireEvent.click(screen.getByText('自動でそろえる'))
  await waitFor(() => {
    expect(screen.getByTestId('cube-state').textContent).toBe(new Cube().asString())
  })
})
