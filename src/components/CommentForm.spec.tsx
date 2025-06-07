import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CommentForm } from './CommentForm';


describe('CommentForm', () => {
  it('renders a textarea and submit button', () => {
    render(<CommentForm />);

    expect(screen.getByPlaceholderText(/Write your comment.../i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Post Comment/i })).toBeInTheDocument();
  });
});
