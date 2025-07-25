import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Notes title in sidebar', () => {
  render(<App />);
  const titleElement = screen.getByText(/Notes/i);
  expect(titleElement).toBeInTheDocument();
});
