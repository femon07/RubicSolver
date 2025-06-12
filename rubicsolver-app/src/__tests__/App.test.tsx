import { render } from '@testing-library/react';
import App from '../App';

test('App コンポーネントがレンダリングできる', () => {
  const { container } = render(<App />);
  expect(container).toBeInTheDocument();
});
