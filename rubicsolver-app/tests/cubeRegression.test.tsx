import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import RubiksCube from '../src/components/RubiksCube'
import Cube from 'cubejs'

jest.mock('gsap', () => ({
  to: (_target: unknown, { onComplete }: { onComplete?: () => void }) => {
    if (onComplete) onComplete()
    return {}
  }
}))

test('1手回した後にそろえると元に戻る', async () => {
  Cube.initSolver()
  const solved = new Cube().asString()
  render(<RubiksCube />)
  const input = screen.getByLabelText('手数:') as HTMLInputElement
  fireEvent.change(input, { target: { value: 1 } })
  fireEvent.click(screen.getByText('ランダム'))
  await waitFor(() => {
    expect(screen.getByTestId('cube-state').textContent).not.toBe(solved)
  })
  fireEvent.click(screen.getByText('そろえる'))
  await waitFor(() => {
    expect(screen.getByTestId('cube-state').textContent).toBe(solved)
  })
})
