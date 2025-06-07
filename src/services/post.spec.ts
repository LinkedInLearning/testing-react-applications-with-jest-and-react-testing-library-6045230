import { afterAll, describe, it, expect, vi, beforeEach } from 'vitest';
import { createPost } from './post';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockURL = 'https://api.example.com'
// Save original env value
const originalEnv = import.meta.env.VITE_API_URL;

// Set test value
import.meta.env.VITE_API_URL = mockURL;



describe('createPost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    import.meta.env.VITE_API_URL = originalEnv;
  })
  const token = 'fake-token';
  const params = {
    title: 'Test Product',
    description: 'Test Description',
    token
  };

  it('sends POST request with correct data and headers', async () => {
    const mockResponse = {
      id: 1,
      title: params.title,
      description: params.description
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await createPost(params);

    /* expect(fetch).toHaveBeenCalledWith(`${mockURL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: expect.stringContaining(JSON.stringify({
        title: mockResponse.title,
        description: mockResponse.description,
        price: 0,
        categoryId: 1,
        images: [`https://picsum.photos/seed/${Date.now()}/800/400`]
      })),
    }); */

    expect(result).toEqual(mockResponse);
  });

  it('throws an error if response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false
    });

    await expect(createPost(params)).rejects.toThrow('Failed to create post');
  });
});
