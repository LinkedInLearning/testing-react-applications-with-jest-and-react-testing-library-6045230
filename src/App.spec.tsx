import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App routing', () => {
  it('renders Home page on default route', () => {
    render(
      <App />
    );
    expect(screen.getByText('Annex Blog')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
});
