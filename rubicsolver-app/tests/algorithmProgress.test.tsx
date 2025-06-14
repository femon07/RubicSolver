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

test('揃え中に手順ハイライトが表示される', async () => {
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
    const items = screen.getAllByRole('listitem')
    expect(items.some((li) => li.style.fontWeight === 'bold')).toBe(true)
  })
})
