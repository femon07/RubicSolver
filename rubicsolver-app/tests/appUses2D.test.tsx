import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from '../src/App'

jest.mock('../src/App.css', () => '')
jest.mock('../src/components/RubiksCube2D', () => () => <div>RubiksCube2DMock</div>)

test('App コンポーネントが RubiksCube2D を表示する', () => {
  render(<App />)
  expect(screen.getByText('RubiksCube2DMock')).toBeInTheDocument()
})
