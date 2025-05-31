import { describe, it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navbar } from './Navbar';
import { MemoryRouter } from 'react-router-dom';

// Mock AuthContext
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../contexts/AuthContext';

describe('Navbar component', () => {
  it('renders Sign In and Sign Up when user is not logged in', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    expect(screen.queryByText(/create post/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sign out/i)).not.toBeInTheDocument();
  });

  it('renders Create Post and Sign Out when user is logged in', () => {
    (useAuth as any).mockReturnValue({
      user: { id: 1, name: 'Test User' },
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText(/create post/i)).toBeInTheDocument();
    expect(screen.getByText(/sign out/i)).toBeInTheDocument();
    expect(screen.queryByText(/sign in/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sign up/i)).not.toBeInTheDocument();
  });

  it('calls signOut when Sign Out button is clicked', async () => {
    const signOutMock = vi.fn();

    (useAuth as any).mockReturnValue({
      user: { id: 1, name: 'Test User' },
      signOut: signOutMock,
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByText(/sign out/i));
    expect(signOutMock).toHaveBeenCalled();
  });
});
