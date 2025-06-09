import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { Home } from './Home';
import * as api from '../lib/api';
import * as storage from '../lib/storage';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import userEvent from '@testing-library/user-event';

vi.mock('../lib/api');
vi.mock('../lib/storage');
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe.only('Home component', () => {
  const mockPosts = [
    {
      id: 1,
      title: 'Test Post',
      body: 'This is a post body',
      userId: 1,
      commentsCount: 3,
      likesCount: 1,
      isliked: true
    }
  ];

  const mockUser = {
    id: 1,
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com'
  };

  const renderComponent = () => {
    return (
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </MemoryRouter>
      )
    )
  }

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as Mock).mockReturnValue({ user: mockUser });
    (api.fetchPosts as Mock).mockResolvedValue(mockPosts);
    (api.fetchUser as Mock).mockResolvedValue(mockUser);
  });

  it('displays loading state initially', () => {
    renderComponent();
    expect(screen.getByText(/loading posts/i)).toBeInTheDocument();
  });

  it('renders posts after loading', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  it('displays empty state when no posts found', async () => {
    (api.fetchPosts as any).mockResolvedValueOnce([]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/no posts found/i)).toBeInTheDocument();
    });
  });

  it('handles fetching of posts error gracefully', async () => {
    const error = new Error('Failed to fetch posts');

    (api.fetchPosts as any).mockRejectedValue(error);
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/no posts found/i)).toBeInTheDocument();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching posts:', error);
    });
  });

  it('filters posts based on search input', async () => {
    const user = userEvent.setup()
    renderComponent();;
    await waitFor(() => screen.getByText('Test Post'));

    await user.type(screen.getByPlaceholderText(/search posts/i), 'hello');

    await waitFor(() => expect(api.fetchPosts).toHaveBeenCalledWith('hello'))
  });

  it('handles like toggling', async () => {
    const user = userEvent.setup();
    (storage.toggleLike as any).mockReturnValue(false);

    renderComponent();

    await waitFor(async () => await screen.findByText('Test Post'));

    const likeButton = screen.getByTestId('likeBtn'); // assuming PostCard renders a button for like
    await user.click(likeButton);

    expect(storage.toggleLike).toHaveBeenCalledWith(1);
  });
});
