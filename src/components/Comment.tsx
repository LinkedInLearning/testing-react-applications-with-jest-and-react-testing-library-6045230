import { useState } from 'react';
import styled from 'styled-components';
import { Pencil, Trash2, Clock } from 'lucide-react';
import { CommentForm } from './CommentForm';
import type { Comment as CommentType } from '../types/blog';

const CommentContainer = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.75rem;
`;

const CommentAuthor = styled.div`
  h4 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  p {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0.25rem 0 0 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const CommentActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  border-radius: 0.5rem;

  &:hover {
    color: #111827;
    background-color: #f3f4f6;
  }
`;

const CommentContent = styled.p`
  color: #374151;
  line-height: 1.625;
  margin: 0;
  white-space: pre-wrap;
  font-size: 1rem;
`;

interface CommentProps {
  comment: CommentType;
  onEdit: (id: number, content: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  canModify: boolean;
}

export function Comment({ comment, onEdit, onDelete, canModify }: CommentProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = async ({ content }: { content: string }) => {
    await onEdit(comment.id, content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await onDelete(comment.id);
    }
  };

  if (isEditing) {
    return (
      <CommentContainer>
        <CommentForm
          onSubmit={handleEdit}
          initialValue={comment.body}
          submitLabel="Save Changes"
          inputTestId= "editInput"
        />
      </CommentContainer>
    );
  }

  return (
    <CommentContainer>
      <CommentHeader>
        <CommentAuthor>
          <h4>{comment.name}</h4>
          <p>
            <Clock size={14} />
            {new Date().toLocaleDateString()}
          </p>
        </CommentAuthor>
        {canModify && (
          <CommentActions>
            <ActionButton onClick={() => setIsEditing(true)} title="Edit" data-testid={`${comment.id}-editBtn`}>
              <Pencil size={18} />
            </ActionButton>
            <ActionButton onClick={handleDelete} title="Delete" data-testid={`${comment.id}-deleteBtn`}>
              <Trash2 size={18} />
            </ActionButton>
          </CommentActions>
        )}
      </CommentHeader>
      <CommentContent>{comment.body}</CommentContent>
    </CommentContainer>
  );
}