import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import RubiksCube2D from '../src/components/RubiksCube2D'
import * as CubeControllerModule from '../src/lib/CubeController'
import Cube from 'cubejs'

Cube.initSolver()

test('ランダムボタンは現在の状態からスクランブルを適用する', async () => {
  const scrambleSpy = jest
    .spyOn(CubeControllerModule, 'generateScramble')
    .mockReturnValue('U')

  const ref = React.createRef<{
    getRendererState: () => string
    getControllerState: () => string
  }>()
  const { getByRole } = render(<RubiksCube2D ref={ref} />)

  await act(async () => {
    fireEvent.click(getByRole('button', { name: 'R →' }))
  })

  await act(async () => {
    fireEvent.click(getByRole('button', { name: 'ランダム' }))
  })

  scrambleSpy.mockRestore()

  const cube = new Cube()
  cube.move('R U')
  expect(ref.current!.getControllerState()).toBe(cube.asString())
})
