import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Calendar, User } from 'lucide-react';
import styled from 'styled-components';
import { fetchPost, fetchComments, fetchUser, createComment } from '../lib/api';
import { toggleLike } from '../lib/storage';
import { CommentForm } from '../components/CommentForm';
import { Comment } from '../components/Comment';
import { useAuth } from '../contexts/AuthContext';
import type { PostWithCounts, Comment as CommentType, User as UserType } from '../types/blog';

const Container = styled.div`
  max-width: 64rem;
  margin: 0 auto;
`;

const Article = styled.article`
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
`;

const PostImage = styled.img`
  width: 100%;
  height: 24rem;
  object-fit: cover;
`;

const PostContent = styled.div`
  padding: 2.5rem;
`;

const PostTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #111827;
  margin: 0 0 1.5rem 0;
  line-height: 1.2;
`;

const PostMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 2rem;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #4b5563;
  font-size: 0.875rem;

  span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const PostStats = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const StatButton = styled.button<{ isLiked?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.isLiked ? '#2563eb' : '#6b7280'};
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background-color: #f3f4f6;
  }
`;

const PostBody = styled.div`
  color: #374151;
  line-height: 1.8;
  font-size: 1.125rem;
  
  p {
    margin-bottom: 1.5rem;
  }
`;

const CommentsSection = styled.div`
  margin-top: 3rem;
`;

const CommentsHeader = styled.h2`
  font-size: 1.875rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 1.5rem;
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const fetchWithRetry = async (fn: () => Promise<any>, retries = 3, delay = 200): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log({i})
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

export function Post() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<PostWithCounts | null>(null);
  const [author, setAuthor] = useState<UserType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadPost = async () => {
      if (!id) return;
      
      try {
        const postData = await fetchPost(parseInt(id));
        setPost(postData);

        const [authorData, commentsData] = await Promise.all([
          fetchUser(postData.userId),
          fetchWithRetry(() => fetchComments(postData.id), 3),
        ]);
       
        setAuthor(authorData);
        setComments(commentsData.reverse()); // Show newest comments first      
      } catch (error) {
        console.error('Error fetching post:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id, navigate, user]);

  const handleComment = async ({ content }: { content: string }) => {
    if (!post || !user) return;

    try {
      const comment = await createComment(post.id, {
        name: user.username,
        email: user.email,
        body: content
      });
      
      setComments(prev => [comment, ...prev]); // Add new comment at the top
      setPost(prev => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : null);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = async (commentId: number, content: string) => {
    setComments(comments.map(comment =>
      comment.id === commentId
        ? { ...comment, body: content }
        : comment
    ));
  };

  const handleDeleteComment = async (commentId: number) => {
    setComments(comments.filter(comment => comment.id !== commentId));
    setPost(prev => prev ? { ...prev, commentsCount: prev.commentsCount - 1 } : null);
  };

  const handleLike = () => {
    if (!post) return;
    
    const isLiked = toggleLike(post.id);
    setPost({ ...post, isLiked, likesCount: isLiked ? 1 : 0 });
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!post || !author) {
    return <div className="text-center py-8">Post not found</div>;
  }
  
  return (
    <Container>
      <Article>
        <PostImage
          src={`https://picsum.photos/seed/${post.id}/1200/600`}
          alt={post.title}
        />
        <PostContent>
          <PostTitle>{post.title}</PostTitle>
          <PostMeta>
            <AuthorInfo>
              <span>
                <User size={18} />
                {author.name}
              </span>
              <span>
                <Calendar size={18} />
                {new Date().toLocaleDateString()}
              </span>
            </AuthorInfo>
            <PostStats>
              <StatButton onClick={handleLike} isLiked={post.isLiked} data-testid={`likeButton-${post.id}`}>
                <ThumbsUp size={20} />
                <span>{post.likesCount}</span>
              </StatButton>
              <StatButton as="div">
                <MessageSquare size={20} />
                <span>{post.commentsCount}</span>
              </StatButton>
            </PostStats>
          </PostMeta>
          <PostBody>
            {post.body.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </PostBody>
        </PostContent>
      </Article>

      <CommentsSection>
        <CommentsHeader>Comments ({post.commentsCount})</CommentsHeader>
          <CommentForm onSubmit={handleComment} />
        <CommentsList>
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              canModify={user?.email === comment.email}
            />
          ))}
        </CommentsList>
      </CommentsSection>
    </Container>
  );
}