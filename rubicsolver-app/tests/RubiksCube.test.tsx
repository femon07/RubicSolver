import { render, screen } from '@testing-library/react';
import RubiksCube from '../src/components/RubiksCube';

test('RubiksCube コンポーネントがレンダリングされるか', () => {
  render(<RubiksCube />);
  expect(screen.getByText('再描画')).toBeInTheDocument();
});
