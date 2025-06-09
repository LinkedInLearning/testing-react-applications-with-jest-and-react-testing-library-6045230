import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, vi, it, expect } from 'vitest';
import { Login } from './Login';
import userEvent from '@testing-library/user-event';

// Mock functions we'll configure in each test
const mockNavigate = vi.fn()
const mockSignIn = vi.fn()


// Mock the modules we need to control
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
  }),
}));


// Test constants
const validCredentials = {
  email: 'test@example.com',
  password: 'Password123'
};

// Helper to render component with necessary providers
const renderLogin = () => {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
};

// Helper to fill form fields
const fillLoginForm = async (email = validCredentials.email, password = validCredentials.password) => {
  const user = userEvent.setup();
  const emailInput = screen.getByPlaceholderText('Email address');
  const passwordInput = screen.getByPlaceholderText('Password');

  await user.type(emailInput, email);
  await user.type(passwordInput, password);

  return { emailInput, passwordInput };
};

// Helper to submit the form
const submitForm = async () => {
  const user = userEvent.setup();
  const submitButton = screen.getByRole('button', { name: /sign in/i });
  await user.click(submitButton);
  return submitButton;
};

describe('Login Component Snapshots', () => {
  it('renders initial login form correctly', () => {
    const { asFragment } = renderLogin();
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders error state correctly', async () => {
    // Configure the mock to throw an error
    mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'));

    const { asFragment } = renderLogin();

    // Fill and submit form to trigger error state
    await fillLoginForm();
    await submitForm();

    // Wait for error to appear
    await screen.findByText('Invalid email or password');

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders loading state correctly', async () => {
    // Configure the mock to return a pending promise that won't resolve during the test
    mockSignIn.mockImplementationOnce(() => new Promise(() => { }));

    const { asFragment } = renderLogin();

    // Fill and submit form to trigger loading state
    await fillLoginForm();
    await submitForm();

    // Verify loading state is showing
    expect(screen.getByText('Signing in...')).toBeInTheDocument();

    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Login Component Functionality', () => {
  it('submits the form with correct email and password', async () => {
    renderLogin();

    // Fill and submit the form
    await fillLoginForm();
    await submitForm();

    // Verify signIn was called with correct values
    expect(mockSignIn).toHaveBeenCalledWith(
      validCredentials.email,
      validCredentials.password
    );
  });

  it('shows error message when authentication fails', async () => {
    // Configure mock to reject
    mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'));

    renderLogin();

    // Fill and submit the form
    await fillLoginForm();
    await submitForm();

    // Verify error message appears
    const errorMessage = await screen.findByText('Invalid email or password');
    expect(errorMessage).toBeInTheDocument();
  });

  it('navigates to homepage after successful login', async () => {
    // Configure mock to resolve
    mockSignIn.mockResolvedValueOnce({});

    renderLogin();

    // Fill and submit the form
    await fillLoginForm();
    await submitForm();

    // Verify navigation occurred after successful login
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('disables button and shows loading state during authentication', async () => {
    // Set up a promise we can control
    let resolveSignIn: (value?: unknown) => void = () => { };
    mockSignIn.mockImplementationOnce(() => new Promise(resolve => {
      resolveSignIn = resolve;
    }));

    renderLogin();

    // Fill and submit the form
    await fillLoginForm();
    const button = await submitForm();

    // Verify button is disabled and shows loading text
    expect(button).toBeDisabled();
    expect(screen.getByText('Signing in...')).toBeInTheDocument();

    // Resolve the promise to complete the authentication
    resolveSignIn({});

    // Verify loading state is removed
    await waitFor(() => {
      expect(screen.queryByText('Signing in...')).not.toBeInTheDocument();
    });
  });

  it('validates that form fields are required', () => {
    renderLogin();

    // Get inputs directly to check their attributes
    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');

    // Verify required attribute is present
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
  });

  it('clears error message when form is resubmitted', async () => {
    // First submission fails
    mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'));

    renderLogin();

    // Fill and submit to trigger error
    await fillLoginForm();
    await submitForm();

    // Verify error appears
    const errorMessage = await screen.findByText('Invalid email or password');
    expect(errorMessage).toBeInTheDocument();

    // Mock second submission to resolve
    mockSignIn.mockResolvedValueOnce({});

    // Submit again
    submitForm();

    // Verify error is cleared
    await waitFor(() => {
      expect(screen.queryByText('Invalid email or password')).not.toBeInTheDocument();
    });
  });
});