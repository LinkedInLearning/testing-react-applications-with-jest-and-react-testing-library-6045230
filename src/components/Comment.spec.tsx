import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Comment } from './Comment';
;

const mockComment = {
  id: 1,
  postId: 1,
  name: 'Jane Doe',
  body: 'This is a test comment.',
  email: 'jane.doe@gmail.com'
};

describe('Comment component', () => {
  it('renders comment with author and content', () => {
    render(
      <Comment
        comment={mockComment}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        canModify={false}
      />
    );

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('This is a test comment.')).toBeInTheDocument();
    expect(screen.queryByTitle('Edit')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Delete')).not.toBeInTheDocument();
  });

  it('shows edit and delete buttons when canModify is true', () => {
    render(
      <Comment
        comment={mockComment}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        canModify={true}
      />
    );

    expect(screen.getByTitle('Edit')).toBeInTheDocument();
    expect(screen.getByTitle('Delete')).toBeInTheDocument();
  });

  it('enters edit mode and submits edited comment', async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);
    render(
      <Comment
        comment={mockComment}
        onEdit={onEdit}
        onDelete={vi.fn()}
        canModify={true}
      />
    );

    await userEvent.click(screen.getByTitle('Edit'));

    const textarea = screen.getByPlaceholderText('Write your comment...');
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Updated comment content');
    await userEvent.click(screen.getByText('Save Changes'));

    await waitFor(() =>
      expect(onEdit).toHaveBeenCalledWith(1, 'Updated comment content')
    );
  });

  it('calls onDelete after confirmation', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <Comment
        comment={mockComment}
        onEdit={vi.fn()}
        onDelete={onDelete}
        canModify={true}
      />
    );

    await userEvent.click(screen.getByTitle('Delete'));

    await waitFor(() => expect(onDelete).toHaveBeenCalledWith(1));
  });

  it('does not call onDelete if user cancels', async () => {
    const onDelete = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <Comment
        comment={mockComment}
        onEdit={vi.fn()}
        onDelete={onDelete}
        canModify={true}
      />
    );

    await userEvent.click(screen.getByTitle('Delete'));

    expect(onDelete).not.toHaveBeenCalled();
  });
});
