import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CommentForm } from './CommentForm';
import userEvent from '@testing-library/user-event';

describe('CommentForm', () => {
  it('renders a textarea and submit button', () => {
    render(<CommentForm />);

    expect(screen.getByPlaceholderText(/Write your comment.../i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Post Comment/i })).toBeInTheDocument();
  });

  it('shows error message when submitting empty comment', async() => {
    const user = userEvent.setup()
    render(<CommentForm />);
    
    const submitButton = screen.getByRole('button', { name: /Post Comment/i });
    await user.click(submitButton);
    
    expect(screen.getByText(/Comment cannot be empty/i)).toBeInTheDocument();
  });
});
