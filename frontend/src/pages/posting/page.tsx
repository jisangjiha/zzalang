import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/auth";
import styles from "../page.module.css";

export default function PostingPage() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [postingData, setPostingData] = useState({
    title: "",
    content: "",
  });

  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (postingData.title.trim() === "" || postingData.content.trim() === "") {
      setErrorMessage("제목과 내용을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(undefined);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:8787/v1/posts", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: postingData.title.trim(),
          content: postingData.content.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "글 작성에 실패했습니다.");
        return;
      }

      navigate("/");
    } catch {
      setErrorMessage("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="제목"
        value={postingData.title}
        onChange={(e) =>
          setPostingData({ ...postingData, title: e.target.value })
        }
      />
      <textarea
        placeholder="내용"
        value={postingData.content}
        onChange={(e) =>
          setPostingData({ ...postingData, content: e.target.value })
        }
      />
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "등록 중..." : "등록하기"}
      </button>
    </form>
  );
}
