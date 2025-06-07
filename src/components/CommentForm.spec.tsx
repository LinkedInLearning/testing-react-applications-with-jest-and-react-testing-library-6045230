import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CommentForm } from './CommentForm';
import userEvent, {UserEvent} from '@testing-library/user-event';

const mockSubmit = vi.fn()
describe('CommentForm', () => {
  const renderCommentForm = (props = {}) => {
    return render(
      <CommentForm onSubmit={mockSubmit} {...props}/>
    );
  };

  const typeComment = async (text: string, user: UserEvent) => {
    const textarea = screen.getByPlaceholderText(/Write your comment.../i);
    await user.type(textarea, text);
  };

  const clickSubmit = async(user: UserEvent) => {
    const submitButton = screen.getByRole('button', { name: /Post Comment/i });
    await user.click(submitButton);
  };

  it('renders a textarea and submit button', () => {
    renderCommentForm()

    expect(screen.getByPlaceholderText(/Write your comment.../i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Post Comment/i })).toBeInTheDocument();
  });

  it('shows error message when submitting empty comment', async() => {
    const user = userEvent.setup()
    renderCommentForm()
    
    await clickSubmit(user);
    
    expect(screen.getByText(/Comment cannot be empty/i)).toBeInTheDocument();
  });

  it('calls onSubmit with comment text when form is submitted with content', async() => {
    const user = userEvent.setup()
    renderCommentForm()
    
    await typeComment('This is my comment', user)
    
    await clickSubmit(user);
    
    expect(mockSubmit).toHaveBeenCalledWith({content: 'This is my comment'});
    expect(screen.queryByText(/Comment cannot be empty/i)).not.toBeInTheDocument();
  }); 

  it('displays character count as user types', async() => {
    const user = userEvent.setup()
    renderCommentForm()
    
    // Initially should show 0/255
    expect(screen.getByText('0/255')).toBeInTheDocument();
    await typeComment('This is my comment', user)
    
    // Should now show 15/255
    expect(screen.getByText('18/255')).toBeInTheDocument();
  }); 

  it('shows error when comment exceeds maximum length', async() => {
    const user = userEvent.setup()
    render(<CommentForm onSubmit={mockSubmit} />);

    expect(screen.getByText('0/255')).toBeInTheDocument();
    await typeComment('a'.repeat(256), user)
    const submitButton =  screen.getByRole('button', { name: /Post Comment/i })
    
    expect(submitButton).not.toBeDisabled();
    
    expect(screen.getByText('256/255')).toBeInTheDocument();
    expect(screen.queryByText(/Comment cannot exceed 255 words/i)).toBeInTheDocument()
  }); 
});
