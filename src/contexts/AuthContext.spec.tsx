import { describe, it, vi, expect, beforeEach, Mock, afterEach } from 'vitest';

import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import { jwtDecode } from 'jwt-decode';

vi.mock('jwt-decode', () => ({ jwtDecode: vi.fn() }));

const mockUser = {
  id: 1,
  email: 'test@example.com',
  username: 'TestUser'
};

const setupFetchMock = (responses: any[], ok = true) => {
  global.fetch = vi.fn().mockImplementation(() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(responses.shift())
    })
  );
};

const TestComponent = () => {
  const { user, signIn, signOut, signUp } = useAuth();

  return (
    <>
      <div data-testid="user">{user?.username || 'No User'}</div>
      <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => signUp('test@example.com', 'password', 'TestUser')}>Sign Up</button>
      <button onClick={signOut}>Sign Out</button>
    </>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks()
  })

  const renderWithProvider = () => render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  it('initially renders with no user', async () => {
    renderWithProvider();

    expect(await screen.findByTestId('user')).toHaveTextContent('No User');
  });

  it('registers and signs in a user successfully', async () => {
    (jwtDecode as Mock).mockReturnValue({ sub: mockUser.id });

    // Mock API responses
    setupFetchMock([
      { access_token: 'fake-token' }, // sign-in token response
      { id: mockUser.id, email: mockUser.email, name: mockUser.username } // Corrected: fetch user details
    ]);

    renderWithProvider();

    // Click sign up button
    await act(async () => await userEvent.click(screen.getByText('Sign Up')));

    // Verify user is registered and signin
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('TestUser');
      expect(localStorage.getItem('token')).toBe('fake-token');
    });
  });

  it('signs in a user successfully', async () => {
    (jwtDecode as Mock).mockReturnValue({ sub: mockUser.id });

    // Mock successful API responses
    setupFetchMock([
      { access_token: 'fake-token' },
      { id: mockUser.id, email: mockUser.email, name: mockUser.username }
    ]);

    renderWithProvider();

    // Click sign in button
    await userEvent.click(screen.getByText('Sign In'));

    // Verify user is sign in
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('TestUser');
      expect(localStorage.getItem('token')).toBe('fake-token');
    });
  });

  it('loads user from localStorage on init', async () => {
    localStorage.setItem('token', 'fake-token');
    (jwtDecode as Mock).mockReturnValue({ sub: mockUser.id });

    // Mock successful API responses
    setupFetchMock([
      { id: mockUser.id, email: mockUser.email, name: mockUser.username }
    ]);

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('TestUser');
    });
  });

  it('signs out the user', async () => {
    localStorage.setItem('token', 'fake-token');

    renderWithProvider();

    await userEvent.click(screen.getByText('Sign Out'));

    expect(screen.getByTestId('user')).toHaveTextContent('No User');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('fails to sign in with wrong credentials', async () => {
    // Mock successful API responses
    setupFetchMock([{ message: 'Invalid credentials' }], false);

    renderWithProvider();

    await act(async () => {
      await expect(userEvent.click(screen.getByText('Sign In')));
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  it('fails during user registration', async () => {
    // Mock successful API responses
    setupFetchMock([{ message: 'Registration failed' }], false);

    renderWithProvider();

    await act(async () => {
      await expect(userEvent.click(screen.getByText('Sign Up')))
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  it('throws error when component is not wrapped with AuthProvider', () => {
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider');

    console.error = originalError;
  });
});
