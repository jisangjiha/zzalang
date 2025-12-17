export interface Post {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  content: string;
  authorId: string;
}

export interface User {
  id: string;
  name: string;
  handle: string;
  createdAt: string;
  updatedAt: string;
}
