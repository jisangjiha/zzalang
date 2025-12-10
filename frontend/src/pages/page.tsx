import { useCallback, useEffect, useState } from "react";
import PostingButton from "../components/PostingButton";

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
  const [isLoading, setIsLoading] = useState(true);
  const [userHandles, setUserHandles] = useState<Record<string, string>>({});

  const devApi = import.meta.env.VITE_API_BASE_URL;

  // 페이지 관련 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [pageSize] = useState(10);
  const [order] = useState<"ASC" | "DESC">("DESC");
  const totalPage = Math.max(1, Math.ceil(totalPosts / pageSize));

  // 페이지 번호 계산 (현재 페이지 중심으로 최대 5개 노출)
  const pageNumbers = (() => {
    const windowSize = 5;
    const half = Math.floor(windowSize / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPage, start + windowSize - 1);
    if (end - start + 1 < windowSize) {
      start = Math.max(1, end - windowSize + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  })();

  // 사용자 정보를 가져오는 함수
  const fetchUserHandle = useCallback(
    async (userId: string): Promise<string> => {
      try {
        const response = await fetch(`${devApi}/v1/users/${userId}`);
        if (response.ok) {
          const user: User = await response.json();
          return user.handle;
        }
      } catch (error) {
        console.log(`Failed to fetch user ${userId}:`, error);
      }
      return "Unknown User";
    },
    [devApi]
  );

  // 게시글 목록을 가져오는 함수
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${devApi}/v1/posts?page=${currentPage}&pageSize=${pageSize}&order=${order}`
      );
      if (!response.ok) {
        throw new Error(`status ${response.status}`);
      }

      const data: PostsResponse = await response.json();
      setPosts(data.posts);
      setTotalPosts(data.total);

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
    } catch (error) {
      console.log("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, devApi, fetchUserHandle, order, pageSize]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <main className={styles.mainContainer}>
      <div className={styles.boardHeader}>
        <h1>게시판</h1>
        <PostingButton />
      </div>
      {/**<section>인기글</section>*/}
      <section>전체글({totalPosts})</section>
      <div className={styles.postHeaders}>
        <div>제목</div>
        <div>내용</div>
        <div>작성일</div>
        <div>작성자</div>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          {posts.map((post) => (
            <div key={post.id} className={styles.post}>
              <div>{post.title}</div>
              <div>{post.content}</div>
              <div>{new Date(post.createdAt).toLocaleDateString()}</div>
              <div>{userHandles[post.authorId] || "Loading..."}</div>
            </div>
          ))}
        </>
      )}
      <section className={styles.pagination}>
        <button
          className={styles.pageButton}
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        >
          이전
        </button>
        {pageNumbers.map((page) => (
          <button
            key={page}
            className={`${styles.pageButton} ${
              page === currentPage ? styles.pageButtonActive : ""
            }`}
            onClick={() => setCurrentPage(page)}
            disabled={page === currentPage}
          >
            {page}
          </button>
        ))}
        <button
          className={styles.pageButton}
          disabled={currentPage >= totalPage}
          onClick={() => setCurrentPage((p) => (p < totalPage ? p + 1 : p))}
        >
          다음
        </button>
      </section>
    </main>
  );
}
