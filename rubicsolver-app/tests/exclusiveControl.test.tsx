import { render, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import RubiksCube2D from '../src/components/RubiksCube2D'
import CubeRenderer2D from '../src/lib/CubeRenderer2D'

jest.useFakeTimers()

test('操作中は他のボタン操作を無視する', async () => {
  const spy = jest
    .spyOn(CubeRenderer2D.prototype, 'applyMove')
    .mockImplementation(
      () => new Promise<void>((resolve) => setTimeout(resolve, 1000))
    )

  const { getByRole } = render(<RubiksCube2D />)

  await act(async () => {
    fireEvent.click(getByRole('button', { name: 'U →' }))
  })

  await act(async () => {
    fireEvent.click(getByRole('button', { name: 'R →' }))
  })

  expect(spy).toHaveBeenCalledTimes(1)

  jest.advanceTimersByTime(1000)
  await act(async () => {
    await Promise.resolve()
  })

  expect(spy).toHaveBeenCalledTimes(1)

  spy.mockRestore()
})
