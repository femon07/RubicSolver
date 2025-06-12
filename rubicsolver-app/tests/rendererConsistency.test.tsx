import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import RubiksCube from '../src/components/RubiksCube'
import Cube from 'cubejs'

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

test('回転後にビューとモデルの状態が一致する', async () => {
  Cube.initSolver()
  const ref = React.createRef<{
    getRendererState: () => string
    getControllerState: () => string
    initRenderer: () => void
  }>()
  render(<RubiksCube ref={ref} />)
  ref.current?.initRenderer()
  fireEvent.click(screen.getByText('U →'))
  await waitFor(() => {
    expect(ref.current?.getRendererState()).toBe(
      ref.current?.getControllerState()
    )
  })
  fireEvent.click(screen.getByText('F →'))
  await waitFor(() => {
    expect(ref.current?.getRendererState()).toBe(
      ref.current?.getControllerState()
    )
  })
})

