import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

import { Post } from './Post';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import * as api from '../lib/api';
import * as storage from '../lib/storage';
import { useAuth } from '../contexts/AuthContext';
import userEvent from '@testing-library/user-event';

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

  it('handles like button toggle', async () => {
    (storage.toggleLike as Mock).mockReturnValue(true);
    const user = userEvent.setup()
    renderComponent()

    expect(await screen.findByText('Test Post')).toBeInTheDocument();

    const likeButton = await screen.getAllByTestId('likeButton-1')[0]
    await user.click(likeButton);
    expect(storage.toggleLike).toHaveBeenCalledWith(1);
  });

  it('renders post content and comments', async () => {
    renderComponent()

    expect(await screen.findByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Nice post!')).toBeInTheDocument();
    expect(screen.getByText(/comments \(1\)/i)).toBeInTheDocument();
  });

  it('adds a new comment on submission', async () => {
    (api.createComment as Mock).mockResolvedValue({
      id: 2,
      name: 'Jane Doe',
      email: 'jane@example.com',
      body: 'New comment',
    });

    const user = userEvent.setup()
    renderComponent()

    const textarea = await screen.findByRole('textbox');
    // fireEvent.change(textarea, { target: { value: 'New comment' } });
    await user.type(textarea, 'New comment');

    const button = screen.getByRole('button', { name: /comment/i });
    // fireEvent.click(button);
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('New comment')).toBeInTheDocument();
      expect(screen.getByText(/comments \(2\)/i)).toBeInTheDocument();
    });
  });

  it('handles comment creation error gracefully', async () => {
    const error = new Error('Failed to comment');
    (api.createComment as Mock).mockRejectedValue(error);
    const user = userEvent.setup()
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    renderComponent()

    const textarea = await screen.findByRole('textbox');
    await user.type(textarea, 'Will fail');

    const button = screen.getByRole('button', { name: /comment/i });
    await user.click(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error adding comment:', error);
    });

    consoleErrorSpy.mockRestore();
  });

  it('deletes a comment', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    (api.fetchComments as Mock).mockResolvedValue([
      ...mockComments,
      {
        id: 2,
        name: 'Commenter',
        email: 'jane@example.com',
        body: 'Well said',
        postId: '1'
      }
    ]);
    const user = userEvent.setup();
    await renderComponent()


    expect(await screen.findByText('Test Post')).toBeInTheDocument();
    await user.click(screen.getByTestId(`${mockComments[0].id}-deleteBtn`))
    
    expect(screen.queryByText(mockComments[0].body)).not.toBeInTheDocument();

  });
});
