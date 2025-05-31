import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

import { Post } from './Post';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import * as api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

vi.mock('../lib/api');
vi.mock('../lib/storage');
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => mockNavigate,
  };
});

const mockPost = {
  id: 1,
  title: 'Test Post',
  body: 'This is a test post.\nSecond paragraph.',
  userId: 1,
  commentsCount: 1,
  likesCount: 0,
  isLiked: false,
};

const mockUser = {
  id: 1,
  name: 'Jane Doe',
  username: 'janedoe',
  email: 'jane@example.com',
};

const mockComments = [
  {
    id: 1,
    name: 'Commenter',
    email: 'jane@example.com',
    body: 'Nice post!',
    postId: '1'
  }
];

const setup = (authUser = mockUser) => {
  (useAuth as Mock).mockReturnValue({ user: authUser });

  (api.fetchPost as Mock).mockResolvedValue(mockPost);
  (api.fetchUser as Mock).mockResolvedValue(mockUser);
  (api.fetchComments as Mock).mockResolvedValue(mockComments);
};

describe('<Post />', () => {
  beforeEach(() => {
    setup()
    vi.clearAllMocks();

  });

  const renderComponent = () => {
    return (
      render(
        <MemoryRouter initialEntries={['/posts/1']}>
          <Routes>
            <Route path="/posts/:id" element={<Post />} />
          </Routes>
        </MemoryRouter>
      )
    )
  }

  it('renders loading state', async () => {
    renderComponent()

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());
  });

  it('redirects if user is not logged in', async () => {
    (useAuth as Mock).mockReturnValue({ user: null });
    (api.fetchUser as Mock).mockResolvedValue(null);
    renderComponent()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('handles post not found', async () => {
    (api.fetchPost as Mock).mockResolvedValue(null);

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText(/post not found/i)).toBeInTheDocument();
    });
  });
});
