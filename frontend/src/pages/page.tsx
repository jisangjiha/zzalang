import { useCallback, useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PostingButton from "../components/PostingButton";
import PageButton from "../components/PageButton";
import { Post, User } from "../types";
import { CategoryContext } from "../contexts/category-context";

import styles from "./page.module.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface PostsResponse {
  posts: Post[];
  total: number;
}

export default function MainPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [userHandles, setUserHandles] = useState<Record<string, string>>({});

  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId?: string }>();
  const { categoryMap } = useContext(CategoryContext);

  // 페이지 관련 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [pageSize] = useState(10);
  const [order] = useState<"ASC" | "DESC">("DESC");
  const totalPage = Math.max(1, Math.ceil(totalPosts / pageSize));

  // HTML 태그 제거 함수
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "");

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
        const response = await fetch(`${API_BASE_URL}/v1/users/${userId}`);
        if (response.ok) {
          const user: User = await response.json();
          return user.handle;
        }
      } catch (error) {
        console.log(`Failed to fetch user ${userId}:`, error);
      }
      return "Unknown User";
    },
    []
  );

  // 게시글 목록을 가져오는 함수
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      // categoryId가 있으면 쿼리 파라미터에 추가
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        order: order,
      });

      if (categoryId) {
        params.append("categoryId", categoryId);
      }

      const response = await fetch(
        `${API_BASE_URL}/v1/posts?${params.toString()}`
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
  }, [currentPage, fetchUserHandle, order, pageSize, categoryId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // 현재 카테고리 제목 가져오기
  const currentCategoryTitle = categoryId ? categoryMap[categoryId] : null;

  return (
    <main className={styles.mainContainer}>
      <div className={styles.boardHeader}>
        <div className={styles.boardHeaderName}>
          <h1>{currentCategoryTitle ? currentCategoryTitle : "전체 게시판"}</h1>
          <div>({totalPosts})</div>
        </div>
        <PostingButton text="+ 글쓰기" />
      </div>
      {/* <section>인기글</section> */}
      <div className={styles.postSection}>
        <div className={styles.postHeaders}>
          <div>게시판</div>
          <div>제목</div>
          <div>내용</div>
          <div>작성일</div>
          <div>작성자</div>
        </div>
        {isLoading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <>
            {posts.map((post) => (
              <div
                key={post.id}
                className={styles.post}
                onClick={() => navigate(`/posts/${post.id}`)}
              >
                <div>
                  {categoryMap[post.categoryId] === "기본"
                    ? ""
                    : categoryMap[post.categoryId]}
                </div>
                <div>{post.title}</div>
                <div>{stripHtml(post.content)}</div>
                <div>{new Date(post.createdAt).toLocaleDateString()}</div>
                <div>{userHandles[post.authorId] || "Loading..."}</div>
              </div>
            ))}
          </>
        )}
      </div>
      <section className={styles.pagination}>
        <PageButton
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        >
          ＜
        </PageButton>
        {pageNumbers.map((page) => (
          <PageButton
            key={page}
            active={page === currentPage}
            onClick={() => setCurrentPage(page)}
            disabled={page === currentPage}
          >
            {page}
          </PageButton>
        ))}
        <PageButton
          disabled={currentPage >= totalPage}
          onClick={() => setCurrentPage((p) => (p < totalPage ? p + 1 : p))}
        >
          ＞
        </PageButton>
      </section>
    </main>
  );
}
