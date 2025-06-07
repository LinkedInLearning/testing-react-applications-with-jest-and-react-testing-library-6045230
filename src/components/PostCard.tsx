import React from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageSquare, Calendar, User } from 'lucide-react';
import styled from 'styled-components';
import type { PostWithCounts } from '../types/blog';

const Article = styled.article`
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`;

const PostImage = styled.img`
  width: 100%;
  height: 15rem;
  object-fit: cover;
  transition: transform 0.3s ease;

  ${Article}:hover & {
    transform: scale(1.05);
  }
`;

const PostContent = styled.div`
  padding: 1.5rem;
`;

const PostTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 0.75rem;
  line-height: 1.3;
`;

const PostExcerpt = styled.p`
  color: #4b5563;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const PostMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

const PostAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;

  span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const PostStats = styled.div`
  display: flex;
  gap: 1rem;
`;

const StatButton = styled.button<{ isliked?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.isliked ? '#2563eb' : '#6b7280'};
  background: ${props => props.isliked ? '#eff6ff' : 'transparent'};
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.isliked ? '#dbeafe' : '#f3f4f6'};
    transform: translateY(-1px);
  }

  svg {
    transition: transform 0.2s;
  }

  &:hover svg {
    transform: scale(1.1);
  }
`;

interface PostCardProps {
  post: PostWithCounts;
  authorName: string;
  onLike: (postId: number, e: React.MouseEvent) => void;
}

export function PostCard({ post, authorName, onLike }: PostCardProps) {
  return (
    <Article>
      <Link to={`/post/${post.id}`}>
        <PostImage
          src={`https://picsum.photos/seed/${post.id}/800/400`}
          alt={post.title}
        />
        <PostContent>
          <PostTitle>{post.title}</PostTitle>
          <PostExcerpt>
            {post.body.slice(0, 200)}
            {post.body.length > 200 ? '...' : ''}
          </PostExcerpt>
          <PostMeta>
            <PostAuthor>
              <span>
                <User size={16} />
                {authorName}
              </span>
              <span>
                <Calendar size={16} />
                {new Date().toLocaleDateString()}
              </span>
            </PostAuthor>
            <PostStats>
              <StatButton
                onClick={(e) => onLike(post.id, e)}
                isliked={post.isliked}
              >
                <ThumbsUp size={16} />
                <span>{post.likesCount}</span>
              </StatButton>
              <StatButton as="div">
                <MessageSquare size={16} />
                <span>{post.commentsCount}</span>
              </StatButton>
            </PostStats>
          </PostMeta>
        </PostContent>
      </Link>
    </Article>
  );
}