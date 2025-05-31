import { describe, it, vi, expect, beforeEach, afterAll, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreatePost } from './CreatePost';
// Import mocked functions
import { useAuth } from '../contexts/AuthContext';
import { createPost } from '../services/post';


// Mock the useNavigate hook
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => navigateMock)
}));

// Mock the useAuth hook
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock the post service
vi.mock('../services/post', () => ({
  createPost: vi.fn()
}));

// Save original env value
const originalEnv = import.meta.env.VITE_API_URL;

// Set test value
import.meta.env.VITE_API_URL = 'https://api.example.com';

// Create mock functions
const navigateMock = vi.fn();

describe('CreatePost component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    import.meta.env.VITE_API_URL = originalEnv;
  })

  it('redirects to login if user is not authenticated', () => {
    // Mock unauthenticated state
    (useAuth as Mock).mockReturnValue({ user: null });

    render(<CreatePost />);

    // Check that navigate was called with the login path
    expect(navigateMock).toHaveBeenCalledWith('/login');

    // Component returns null when redirecting
    expect(screen.queryByText('Create New Post')).not.toBeInTheDocument();
  });

  it('renders the form when user is authenticated', () => {
    // Mock authenticated state
    (useAuth as Mock).mockReturnValue({ user: { id: 1, name: 'Test User' } });

    render(<CreatePost />);

    // Form should be visible
    expect(screen.getByText('Create New Post')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /publish post/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    // Mock authenticated user
    (useAuth as Mock).mockReturnValue({ user: { id: 1, name: 'Test User' } });

    render(<CreatePost />);
    const user = userEvent.setup();

    // Submit form without filling fields
    await user.click(screen.getByRole('button', { name: /publish post/i }));

    // Check for validation errors
    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/content is required/i)).toBeInTheDocument();
  });

  it('shows validation error when title exceeds maximum length', async () => {
    // Mock authenticated user
    (useAuth as Mock).mockReturnValue({ user: { id: 1, name: 'Test User' } });

    render(<CreatePost />);
    const user = userEvent.setup();

    // Type extremely long title
    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'A'.repeat(101));

    // Fill content field to avoid that validation error
    const contentInput = screen.getByLabelText(/content/i);
    await user.type(contentInput, 'Some content');

    // Submit form
    await user.click(screen.getByRole('button', { name: /publish post/i }));

    // Check for validation error
    expect(await screen.findByText(/title is too long/i)).toBeInTheDocument();
  });

  it('disables submit button and shows loading state during submission', async () => {
    // Mock authenticated user
    (useAuth as Mock).mockReturnValue({ user: { id: 1, name: 'Test User' } });

    // Create a delayed promise for createPost
    const delayedPromise = new Promise((resolve) => {
      setTimeout(() => resolve({ id: 1 }), 300); // 300ms delay
    });

    (createPost as Mock).mockImplementation(() => delayedPromise);

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'fake-token')
      }
    });

    render(<CreatePost />);
    const user = userEvent.setup();

    // Fill form fields
    await user.type(screen.getByLabelText(/title/i), 'Test Title');
    await user.type(screen.getByLabelText(/content/i), 'Test content');

    // Submit form
    await user.click(screen.getByRole('button', { name: /publish post/i }));

    const button = screen.getByRole('button');

    // Immediately after clicking, button should be disabled and show "Publishing..."
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Publishing...');

    // Wait for the promise to resolve (form submission to complete)
    await waitFor(() => {
      expect(createPost).toHaveBeenCalled();
    });
  });

  it('submits the form data to the API and navigates to homepage on success', async () => {
    // Mock authenticated user
    (useAuth as Mock).mockReturnValue({ user: { id: 1, name: 'Test User' } });
    // Mock successful post creation
    (createPost as Mock).mockResolvedValue({ id: 1, title: 'Test Title' });


    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'fake-token')
      }
    });



    render(<CreatePost />);
    const user = userEvent.setup();

    // Fill form fields
    await user.type(screen.getByLabelText(/title/i), 'Test Title');
    await user.type(screen.getByLabelText(/content/i), 'Test content');

    // Submit form
    await user.click(screen.getByRole('button', { name: /publish post/i }));

    // Verify API call
    await waitFor(() => {
      expect(createPost).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Title',
          description: 'Test content',
          token: 'fake-token'
        }),

      );
    });

    // Verify navigation
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock authenticated user
    (useAuth as Mock).mockReturnValue({ user: { id: 1, name: 'Test User' } });

    // Mock API error
    (createPost as Mock).mockRejectedValue(new Error('Failed to create post'));

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'fake-token')
      }
    });

    // Mock console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(<CreatePost />);
    const user = userEvent.setup();

    // Fill form fields
    await user.type(screen.getByLabelText(/title/i), 'Test Title');
    await user.type(screen.getByLabelText(/content/i), 'Test content');

    // Submit form
    await user.click(screen.getByRole('button', { name: /publish post/i }));

    // Verify error logging
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating post:',
        expect.any(Error)
      );
    });

    // Navigate should not be called
    expect(navigateMock).not.toHaveBeenCalled();

    // Clean up
    consoleErrorSpy.mockRestore();
  });
});