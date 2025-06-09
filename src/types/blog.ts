export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

export interface PostWithCounts extends Post {
  commentsCount: number;
  likesCount: number;
  isliked: boolean;
}

export interface LocalStorage {
  likes: number[];
  token?: string;
}