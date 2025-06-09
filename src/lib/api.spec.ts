import {
  fetchPosts,
  fetchPost,
  fetchComments,
  fetchUser,
  createComment
} from './api';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getStorageData, isPostLiked } from './storage';

vi.mock('./storage', () => ({
  getStorageData: vi.fn(),
  isPostLiked: vi.fn()
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

const samplePosts = [
  { id: 1, title: 'Post 1', body: 'Body 1', userId: 1 },
  { id: 2, title: 'Post 2', body: 'Body 2', userId: 1 }
];

const sampleComments = [
  { id: 1, postId: 1, name: 'Comment 1', email: 'a@b.com', body: 'Nice' },
  { id: 2, postId: 1, name: 'Comment 2', email: 'b@c.com', body: 'Cool' }
];

const sampleUser = { id: 1, name: 'John', username: 'johnny', email: 'john@example.com' };

describe('API Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchPosts returns posts with commentsCount and likes info', async () => {
    mockFetch
      .mockResolvedValueOnce({ json: async () => samplePosts })
      .mockResolvedValueOnce({ json: async () => sampleComments });

    (getStorageData as any).mockReturnValue({ likes: [1] });

    const posts = await fetchPosts();
    expect(posts).toHaveLength(2);
    expect(posts[0].commentsCount).toBe(2);
    expect(posts[0].likesCount).toBe(1);
    expect(posts[0].isliked).toBe(true);
    expect(posts[1].commentsCount).toBe(0);
  });

  it('fetchPosts filters posts by query', async () => {
    mockFetch
      .mockResolvedValueOnce({ json: async () => samplePosts })
      .mockResolvedValueOnce({ json: async () => [] });

    (getStorageData as any).mockReturnValue({ likes: [] });

    const posts = await fetchPosts('post 1');
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe('Post 1');
  });

  it('fetchPost returns post with comment count and like info', async () => {
    const post = samplePosts[0];
    mockFetch
      .mockResolvedValueOnce({ json: async () => post })
      .mockResolvedValueOnce({ json: async () => sampleComments });

    (isPostLiked as any).mockReturnValue(true);

    const result = await fetchPost(post.id);
    expect(result.commentsCount).toBe(2);
    expect(result.likesCount).toBe(1);
    expect(result.isliked).toBe(true);
  });

  it('fetchComments returns comments for a post', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => sampleComments });

    const comments = await fetchComments(1);
    expect(comments).toEqual(sampleComments);
  });

  it('fetchUser returns user data', async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => sampleUser });

    const user = await fetchUser(1);
    expect(user).toEqual(sampleUser);
  });

  it('createComment sends a POST request with correct headers and body', async () => {
    const comment = { name: 'Tester', email: 'test@example.com', body: 'Great post!' };
    const responseComment = { ...comment, id: 123, postId: 1 };

    const localStorageMock = {
      getItem: vi.fn(() => 'mock-token')
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    mockFetch.mockResolvedValueOnce({ json: async () => responseComment });

    const result = await createComment(1, comment);
    expect(result).toEqual(responseComment);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/comments',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
          'Content-type': expect.stringContaining('application/json')
        }),
        body: JSON.stringify({ postId: 1, ...comment })
      })
    );
  });
});
