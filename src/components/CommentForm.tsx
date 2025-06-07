import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import styled from 'styled-components';

type CommentFormData = z.infer<typeof commentSchema>;

const Form = styled.form`
  margin-bottom: 1.5rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
`;

const ErrorMessage = styled.p`
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const SubmitButton = styled.button`
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2563eb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface CommentFormProps {
  onSubmit: (data: CommentFormData) => Promise<void>;
  initialValue?: string;
  submitLabel?: string;
  inputTestId?: string
}

const MAX_LENGTH = 255;
const commentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(255, 'Comment cannot exceed 255 words')
    .refine((value) => value.trim().split(/\s+/).length <= 255, {
      message: 'Comment cannot exceed 255 words',
    }),
});

export function CommentForm({
  onSubmit,
  initialValue = '',
  submitLabel = 'Post Comment',
  inputTestId = 'createInput'
}: CommentFormProps) {
  const {
    register,
    handleSubmit,
    watch, // 👈 Track input value in real-time
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: initialValue,
    },
    // mode: 'onChange', // 👈 Validate on every change
  });

  // Watch the 'content' field to get its current value
  const contentValue = watch("content");
  const charCount = contentValue?.length || 0;

  const handleFormSubmit = async (data: CommentFormData) => {
    await onSubmit(data);
    if (!initialValue) {
      reset();
    }
  };

  return (
    <Form onSubmit={handleSubmit(handleFormSubmit)}>
      <TextArea
        {...register('content')}
        placeholder="Write your comment..."
        data-testid={inputTestId}
      />
      <span className="character-count">{charCount}/{255}</span>
      {errors.content && (
        <ErrorMessage>{errors.content.message}</ErrorMessage>
      )}
      <SubmitButton type="submit" disabled={isSubmitting || charCount > 255}>
        {isSubmitting ? 'Submitting...' : submitLabel}
      </SubmitButton>
    </Form>
  );
}