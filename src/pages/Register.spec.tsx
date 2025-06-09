import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom';
import { Register } from './Register';
import { useAuth } from '../contexts/AuthContext';

// Mock the useAuth hook
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockSignUp = vi.fn();

describe('Register Component', () => {
  beforeEach(() => {
    (useAuth as Mock).mockReturnValue({ signUp: mockSignUp });

});

  const setup = () => render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );

  it('renders form elements correctly', () => {
    setup();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByTestId('register-header')).toBeInTheDocument();
  });

  it('shows validation errors for incorrect inputs', async () => {
    setup();
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'ab' } });
    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'invalid@email' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: '12345' } });

    fireEvent.click(screen.getByTestId('create-account-btn'));

    expect(await screen.findByText('Username must be at least 3 characters long')).toBeInTheDocument();
    expect(await screen.findByText('Invalid email format')).toBeInTheDocument();
    expect(await screen.findByText('Password must be at least 8 characters long')).toBeInTheDocument();
  });

  it('shows validation errors for incorrect inputs -(with user Event setup)', async () => {
    const user = userEvent.setup()
    setup();

    await user.type(screen.getByPlaceholderText('Username'), 'ab')
    await user.type(screen.getByPlaceholderText('Email address'), 'invalid@email')
    await user.type(screen.getByPlaceholderText('Password'), '12345')

    await user.click(screen.getByTestId('create-account-btn'));

    expect(await screen.findByText('Username must be at least 3 characters long')).toBeInTheDocument();
    expect(await screen.findByText('Invalid email format')).toBeInTheDocument();
    expect(await screen.findByText('Password must be at least 8 characters long')).toBeInTheDocument();
  });

  it('submits the form when inputs are valid', async () => {
    const user = userEvent.setup()
    setup();

    await user.type(screen.getByPlaceholderText('Username'), 'validUser' );
    await user.type(screen.getByPlaceholderText('Email address'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'validPassword123');

    await user.click(screen.getByTestId('create-account-btn'));

    expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'validPassword123', 'validUser');
  });

  it('displays an error message if signUp fails', async () => {
    mockSignUp.mockRejectedValue(new Error('Failed to create account'));
    const user = userEvent.setup()
    setup();

    await user.type(screen.getByPlaceholderText('Username'), 'validUser' );
    await user.type(screen.getByPlaceholderText('Email address'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'validPassword123');

    await user.click(screen.getByTestId('create-account-btn'));

    expect(await screen.findByText('Failed to create account')).toBeInTheDocument();
  });
});
