import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CommentForm } from './CommentForm';
import userEvent from '@testing-library/user-event';

const mockSubmit = vi.fn()
describe('CommentForm', () => {
  it('renders a textarea and submit button', () => {
    render(<CommentForm onSubmit={mockSubmit}/>);

    expect(screen.getByPlaceholderText(/Write your comment.../i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Post Comment/i })).toBeInTheDocument();
  });

  it('shows error message when submitting empty comment', async() => {
    const user = userEvent.setup()
    render(<CommentForm  onSubmit={mockSubmit}/>);
    
    const submitButton = screen.getByRole('button', { name: /Post Comment/i });
    await user.click(submitButton);
    
    expect(screen.getByText(/Comment cannot be empty/i)).toBeInTheDocument();
  });

  it('calls onSubmit with comment text when form is submitted with content', async() => {
    const user = userEvent.setup()
    render(<CommentForm onSubmit={mockSubmit} />);
    
    const textarea = screen.getByPlaceholderText(/Write your comment.../i);
    await user.type(textarea, 'This is my comment');
    
    const submitButton = screen.getByRole('button', { name: /Post Comment/i });
    await user.click(submitButton);
    
    expect(mockSubmit).toHaveBeenCalledWith({content: 'This is my comment'});
    expect(screen.queryByText(/Comment cannot be empty/i)).not.toBeInTheDocument();
  }); 
});
