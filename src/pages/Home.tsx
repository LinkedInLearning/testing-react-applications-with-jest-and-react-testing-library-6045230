import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import styled from 'styled-components';
import { fetchPosts, fetchUser } from '../lib/api';
import { toggleLike } from '../lib/storage';
import { PostCard } from '../components/PostCard';
import type { PostWithCounts, User } from '../types/blog';

const Container = styled.div`
  max-width: 64rem;
  margin: 0 auto;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 2rem;
  max-width: 32rem;
  margin: 0 auto 2rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  font-size: 1rem;
  background-color: white;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
  transition: color 0.2s;

  ${SearchInput}:focus + & {
    color: #2563eb;
  }
`;

const PostGrid = styled.div`
  display: grid;
  gap: 2rem;
  margin-top: 3rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`;

export function Home() {
  const [posts, setPosts] = useState<PostWithCounts[]>([]);
  const [users, setUsers] = useState<Record<number, User>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const posts = await fetchPosts(searchQuery);
        setPosts(posts);
        
        const uniqueUserIds = [...new Set(posts.map(post => post.userId))];
        const userPromises = uniqueUserIds.map(id => fetchUser(id));
        const users = await Promise.all(userPromises);
        
        setUsers(users.reduce((acc, user) => ({
          ...acc,
          [user.id]: user
        }), {}));
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(loadPosts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleLike = async (postId: number, e: React.MouseEvent) => {
    e.preventDefault();
    const isLiked = toggleLike(postId);
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked, likesCount: isLiked ? 1 : 0 }
        : post
    ));
  };

  if (loading) {
    return <EmptyState>Loading posts...</EmptyState>;
  }

  return (
    <Container>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <SearchIconWrapper>
          <Search size={20} />
        </SearchIconWrapper>
      </SearchContainer>

      {posts.length === 0 ? (
        <EmptyState>No posts found</EmptyState>
      ) : (
        <PostGrid>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              authorName={users[post.userId]?.name || 'Unknown Author'}
              onLike={handleLike}
            />
          ))}
        </PostGrid>
      )}
    </Container>
  );
}