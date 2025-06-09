import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { PostCard } from './PostCard';

const mockPost = {
  id: 1,
  userId: 1,
  title: 'Test Post',
  body: 'A'.repeat(250),
  likesCount: 5,
  commentsCount: 3,
  isliked: false,
};

describe('PostCard component', () => {
  it('renders post title, excerpt, and metadata', () => {
    render(
      <MemoryRouter>
        <PostCard post={mockPost} authorName="John Doe" onLike={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /test post/i })).toBeInTheDocument();
    expect(screen.getByText(/a{200}\.\.\./i)).toBeInTheDocument(); // Excerpt truncated
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Likes
    expect(screen.getByText('3')).toBeInTheDocument(); // Comments
  });

  it('does not truncate if body is under 200 characters', () => {
    const shortPost = { ...mockPost, body: 'Short body' };
    render(
      <MemoryRouter>
        <PostCard post={shortPost} authorName="Jane Doe" onLike={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText('Short body')).toBeInTheDocument();
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('calls onLike when like button is clicked', async () => {
    const onLike = vi.fn();
    render(
      <MemoryRouter>
        <PostCard post={mockPost} authorName="Jane Doe" onLike={onLike} />
      </MemoryRouter>
    );

    const likeButton = screen.getByRole('button', { name: /5/i });
    await userEvent.click(likeButton);

    expect(onLike).toHaveBeenCalledWith(mockPost.id, expect.any(Object));
  });

  it('navigates to correct URL on click', async () => {
    render(
      <MemoryRouter>
        <PostCard post={mockPost} authorName="Jane Doe" onLike={vi.fn()} />
      </MemoryRouter>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/post/${mockPost.id}`);
  });

  it('applies correct styles when not liked', () => {
    render(
      <MemoryRouter>
        <PostCard post={{ ...mockPost, isliked: false }} authorName="Jane Doe" onLike={vi.fn()} />
      </MemoryRouter>
    );

    const likeButton = screen.getByRole('button', { name: /5/i });
    const styles = getComputedStyle(likeButton);

    expect(styles.color).toBe('rgb(107, 114, 128)'); // #6b7280
  });

  it('applies correct styles when liked', () => {
    render(
      <MemoryRouter>
        <PostCard post={{ ...mockPost, isliked: true }} authorName="Jane Doe" onLike={vi.fn()} />
      </MemoryRouter>
    );

    const likeButton = screen.getByRole('button', { name: /5/i });
    const styles = getComputedStyle(likeButton);

    expect(styles.color).toBe('rgb(37, 99, 235)'); // #2563eb
  });
});
