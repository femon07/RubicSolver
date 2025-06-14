import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import RubiksCube from '../src/components/RubiksCube2D'
import { DEFAULT_SCRAMBLE_LENGTH as LENGTH2D } from '../src/components/RubiksCube2D'
import { DEFAULT_SCRAMBLE_LENGTH as LENGTH3D, DEFAULT_CAMERA_POSITION } from '../src/components/RubiksCube'

test('2D版のデフォルト手数が10である', () => {
  render(<RubiksCube />)
  const input = screen.getByLabelText('手数:') as HTMLInputElement
  expect(input.value).toBe(String(LENGTH2D))
})

test('3D版のデフォルト手数定数が10である', () => {
  expect(LENGTH3D).toBe(10)
})

test('カメラ位置定数が期待通り', () => {
  expect(DEFAULT_CAMERA_POSITION).toEqual([6, 5, 6])
})
