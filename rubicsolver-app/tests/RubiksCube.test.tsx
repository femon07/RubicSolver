import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RubiksCube from '../src/components/RubiksCube2D';

test('RubiksCube コンポーネントがレンダリングされるか', () => {
  render(<RubiksCube />);
  expect(screen.getByText('再描画')).toBeInTheDocument();
});
