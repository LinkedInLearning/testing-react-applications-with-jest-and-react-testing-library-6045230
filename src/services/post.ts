interface CreateProductParams {
  title: string;
  description: string;
  token: string;
}

export const createPost = async ({ title, description, token }: CreateProductParams) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title,
      description,
      price: 0,
      categoryId: 1,
      images: [`https://picsum.photos/seed/${Date.now()}/800/400`]
    }),
  });

  if (!response.ok) throw new Error('Failed to create post');
  return response.json();
};