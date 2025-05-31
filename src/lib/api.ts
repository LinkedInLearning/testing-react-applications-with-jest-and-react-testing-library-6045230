import { getStorageData, isPostLiked } from './storage';
import type { Post, Comment, User, PostWithCounts } from '../types/blog';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function fetchPosts(query?: string): Promise<PostWithCounts[]> {
  const [posts, comments] = await Promise.all([
    fetch(`${API_BASE_URL}/posts`).then(res => res.json()),
    fetch(`${API_BASE_URL}/comments`).then(res => res.json())
  ]);
  
  const commentCounts = comments.reduce((acc: Record<number, number>, comment: Comment) => {
    acc[comment.postId] = (acc[comment.postId] || 0) + 1;
    return acc;
  }, {});

  const { likes } = getStorageData();
  
  const postsWithCounts = posts.map((post: Post) => ({
    ...post,
    commentsCount: commentCounts[post.id] || 0,
    likesCount: likes.includes(post.id) ? 1 : 0,
    isLiked: likes.includes(post.id)
  }));
  
  if (query) {
    return postsWithCounts.filter((post: PostWithCounts) => 
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.body.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  return postsWithCounts;
}

export async function fetchPost(id: number): Promise<PostWithCounts> {
  const [post, comments] = await Promise.all([
    fetch(`${API_BASE_URL}/posts/${id}`).then(res => res.json()),
    fetch(`${API_BASE_URL}/posts/${id}/comments`).then(res => res.json())
  ]);

  return {
    ...post,
    commentsCount: comments.length,
    likesCount: isPostLiked(post.id) ? 1 : 0,
    isLiked: isPostLiked(post.id)
  };
}

export async function fetchComments(postId: number): Promise<Comment[]> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
  return response.json();
}

export async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`);
  return response.json();
}

export async function createComment(postId: number, comment: Partial<Comment>): Promise<Comment> {
  const response = await fetch(`${API_BASE_URL}/comments`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
      ...getAuthHeaders()
    },
    body: JSON.stringify({
      postId,
      ...comment,
    }),
  });
  return response.json();
}