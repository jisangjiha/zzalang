import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Post, User } from "../../../types";
import styles from "../../page.module.css";
import { AuthContext } from "../../../contexts/auth-context";

export default function PostedPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { token } = useContext(AuthContext);
  const [post, setPost] = useState<Post | null>(null);
  const [authorHandle, setAuthorHandle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
          throw new Error(`status ${response.status}`);
        }

        const data: Post = await response.json();
        setPost(data);

        // authorId를 이용해서 작성자 handle 가져오기
        try {
          const userRes = await fetch(
            `${API_BASE_URL}/v1/users/${data.authorId}`
          );
          if (userRes.ok) {
            const user: User = await userRes.json();
            setAuthorHandle(user.handle);
          }
        } catch {
          setAuthorHandle("알 수 없음");
        }
      } catch (err) {
        console.log("Failed to fetch post:", err);
        setError("게시글을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [API_BASE_URL, id]);

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
        const errorData = await response.json();
        setError(errorData.message || "게시글 삭제에 실패하였습니다.");
        return;
      }

      navigate("/");
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  // 수정, 삭제 버튼이 본인에게만 보이도록 해야 함
  return (
    <div className={styles.mainContainer}>
      <div className={styles.postedContainer}>
        <h2>{post.title}</h2>
        <div className={styles.postedInfo}>
          <span>작성자: {authorHandle}</span>
          <span>|</span>
          <span>작성일: {new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
        <div>
          <button onClick={handleModify} disabled={isDeleting}>
            수정
          </button>
          <button onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "삭제 중..." : "삭제"}
          </button>
        </div>
        {error && (
          <div style={{ color: "red", marginTop: "10px" }}>{error}</div>
        )}
      </div>
    </div>
  );
}
