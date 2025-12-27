import { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Post, User } from "../../../types";
import { AuthContext } from "../../../contexts/auth-context";
import PostActionButton from "../../../components/PostActionButton";
import styles from "../../page.module.css";
import { CategoryContext } from "../../../contexts/category-context";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const handleApiError = async (
  response: Response,
  defaultMessage: string
): Promise<string> => {
  try {
    const errorData = await response.json();
    return errorData.message || defaultMessage;
  } catch {
    return defaultMessage;
  }
};

export default function PostedPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { token } = useContext(AuthContext);

  const [post, setPost] = useState<Post | null>(null);
  const [authorHandle, setAuthorHandle] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { categoryMap } = useContext(CategoryContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 로그인 회원과 게시글 작성자가 같은지 확인
  const isOwner = useMemo(
    () => !!currentUser && !!post && post.authorId === currentUser.id,
    [currentUser, post]
  );

  useEffect(() => {
    if (!token) {
      setCurrentUser(null);
      return;
    }

    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/v1/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const user: User = await response.json();
          setCurrentUser(user);
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }
    };

    fetchCurrentUser();
  }, [token]);

  useEffect(() => {
    if (!id) {
      setError("게시글 ID가 없습니다.");
      setIsLoading(false);
      return;
    }

    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/v1/posts/${id}`);

        if (!response.ok) {
          const message = await handleApiError(
            response,
            "게시글을 불러오지 못했습니다."
          );
          setError(message);
          return;
        }

        const data: Post = await response.json();
        setPost(data);

        // 작성자 handle 가져오기
        try {
          const userResponse = await fetch(
            `${API_BASE_URL}/v1/users/${data.authorId}`
          );

          if (userResponse.ok) {
            const user: User = await userResponse.json();
            setAuthorHandle(user.handle);
          } else {
            setAuthorHandle("알 수 없음");
          }
        } catch {
          setAuthorHandle("알 수 없음");
        }
      } catch {
        setError("네트워크 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleModify = () => {
    if (!id) return;
    navigate(`/posts/${id}/edit`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!id) {
      setError("게시글 ID가 없습니다.");
      return;
    }

    if (!window.confirm("해당 게시글을 삭제하시겠습니까?")) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/v1/posts/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const message = await handleApiError(
          response,
          "게시글 삭제에 실패하였습니다."
        );
        setError(message);
        return;
      }

      navigate("/");
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div className={styles.mainContainer}>Loading...</div>;
  }

  if (error || !post) {
    return (
      <div className={styles.mainContainer}>
        {error || "게시글이 없습니다."}
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.postedContainer}>
        <div className={styles.postedTitleButton}>
          <h2>{post.title}</h2>
          {isOwner && (
            <div>
              <PostActionButton
                text="수정"
                variant="modify"
                onClick={handleModify}
                disabled={isDeleting}
              />
              <PostActionButton
                text={isDeleting ? "삭제 중..." : "삭제"}
                variant="delete"
                onClick={handleDelete}
                disabled={isDeleting}
              />
            </div>
          )}
        </div>
        <div className={styles.postedInfo}>
          <span>
            카테고리:{" "}
            {categoryMap[post.categoryId] === "기본"
              ? "선택 없음"
              : categoryMap[post.categoryId]}
          </span>
          <div className={styles.postedInfoAuthorDate}>
            <span>작성자: {authorHandle}</span>
            <span>|</span>
            <span>작성일: {new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
        {error && (
          <div style={{ color: "red", marginTop: "10px" }}>{error}</div>
        )}
      </div>
    </div>
  );
}
