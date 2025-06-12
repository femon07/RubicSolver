import { render } from '@testing-library/react';
import RubiksCube from '../RubiksCube';

test('RubiksCube コンポーネントがレンダリングできる', () => {
  const { container } = render(<RubiksCube />);
  expect(container).toBeInTheDocument();
});
