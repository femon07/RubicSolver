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

 test('そろえるボタン押下で手順が表示される', async () => {
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
    expect(screen.getByTestId('solution-steps')).toBeInTheDocument()
  })
  expect(screen.getByText('一手すすめる')).toBeInTheDocument()
  expect(screen.getByText('自動でそろえる')).toBeInTheDocument()
})
