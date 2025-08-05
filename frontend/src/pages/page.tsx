import { useEffect, useState } from "react";
import PostingButton from "./_components/PostingButton";
import styles from "./page.module.css";

interface Post {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  content: string;
  authorId: string;
}

interface PostsResponse {
  posts: Post[];
  total: number;
}

interface User {
  id: string;
  name: string;
  handle: string;
  createdAt: string;
  updatedAt: string;
}

export default function MainPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userHandles, setUserHandles] = useState<Record<string, string>>({});

  // 사용자 정보를 가져오는 함수
  const fetchUserHandle = async (userId: string): Promise<string> => {
    try {
      const response = await fetch(`http://localhost:8787/v1/users/${userId}`);
      if (response.ok) {
        const user: User = await response.json();
        return user.handle;
      }
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error);
    }
    return "Unknown User";
  };

  // 게시글 목록을 가져오는 함수
  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:8787/v1/posts");
      const data: PostsResponse = await response.json();
      setPosts(data.posts);
      setTotal(data.total);

      // 각 게시글의 작성자 handle을 가져오기
      const handles: Record<string, string> = {};
      const uniqueUserIds = [
        ...new Set(data.posts.map((post) => post.authorId)),
      ];

      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          const handle = await fetchUserHandle(userId);
          handles[userId] = handle;
        })
      );

      setUserHandles(handles);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <main className={styles.mainContainer}>
      <PostingButton />
      <section>인기글</section>
      <section>전체글({total})</section>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {posts.map((post) => (
            <div key={post.id}>
              <div>{post.title}</div>
              <div>{post.content}</div>
              <div>{new Date(post.createdAt).toLocaleDateString()}</div>
              <div>{userHandles[post.authorId] || "Loading..."}</div>
            </div>
          ))}
        </div>
      )}
      <section>페이지네이션</section>
    </main>
  );
}
