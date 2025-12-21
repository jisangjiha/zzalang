import { useState, useContext, ChangeEvent, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";

import type { ComponentType } from "react";
import { AuthContext } from "../../contexts/auth-context";
import { Post } from "../../types";

import PostingButton from "../../components/PostingButton";

import styles from "../page.module.css";
import "react-quill/dist/quill.snow.css";

export default function PostingPage() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const QuillEditor = ReactQuill as unknown as ComponentType<{
    value: string;
    onChange: (value: string) => void;
    className?: string;
    theme?: string;
    placeholder?: string;
  }>;
  const [postingData, setPostingData] = useState({
    title: "",
    content: "",
  });

  const categoryData = ["일상 공유", "질문과 답변", "스터디 모집"];
  const [currentCategory, setCurrentCategory] = useState(categoryData[0]);
  const handleOnChangeCategory = (e: ChangeEvent<HTMLSelectElement>) => {
    setCurrentCategory(e.target.value);
  };

  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);

  // 포스트를 수정할 때의 PostingPage를 구분하기 위한 상태들
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isEdit = !!id && location.pathname.includes("/edit");

  const devApi = import.meta.env.VITE_API_BASE_URL;

  // edit 모드일 때 기존 게시글 데이터 불러오기
  useEffect(() => {
    if (!isEdit || !id) return;

    const fetchPost = async () => {
      setIsLoadingPost(true);
      setErrorMessage(undefined);
      try {
        const response = await fetch(`${devApi}/v1/posts/${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          setErrorMessage(errorData.message || "게시글을 불러오지 못했습니다.");
          return;
        }

        const data: Post = await response.json();
        setPostingData({
          title: data.title,
          content: data.content,
        });
      } catch {
        setErrorMessage("네트워크 오류가 발생했습니다.");
      } finally {
        setIsLoadingPost(false);
      }
    };

    fetchPost();
  }, [isEdit, id, devApi]);

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

      let response;

      if (isEdit) {
        response = await fetch(`${devApi}/v1/posts/${id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            title: postingData.title.trim(),
            content: postingData.content.trim(),
          }),
        });
      } else {
        response = await fetch(`${devApi}/v1/posts`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            title: postingData.title.trim(),
            content: postingData.content.trim(),
          }),
        });
      }

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

  if (isLoadingPost) {
    return <div className={styles.mainContainer}>게시글을 불러오는 중...</div>;
  }

  return (
    <form className={styles.mainContainer} onSubmit={handleSubmit}>
      <div className={styles.postingContainer}>
        <label className={styles.postingSelectCategory}>
          <select
            value={currentCategory}
            onChange={handleOnChangeCategory}
            className={styles.postingSelect}
          >
            {categoryData.map((data) => (
              <option key={data} value={data}>
                {data}
              </option>
            ))}
          </select>
        </label>
        <input
          className={styles.postingTitle}
          type="text"
          placeholder="제목을 입력하세요"
          value={postingData.title}
          onChange={(e) =>
            setPostingData({ ...postingData, title: e.target.value })
          }
          disabled={isLoadingPost}
        />
        <QuillEditor
          className={styles.postingEditor}
          theme="snow"
          value={postingData.content}
          onChange={(value: string) =>
            setPostingData({ ...postingData, content: value })
          }
          placeholder="내용을 입력하세요"
        />
      </div>
      <div className={styles.postingFooter}>
        {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
        <PostingButton
          type="submit"
          useAuthGuard={false}
          disabled={isLoading}
          text={
            isEdit
              ? isLoading
                ? "수정 중..."
                : "수정하기"
              : isLoading
              ? "등록 중..."
              : "등록하기"
          }
        />
      </div>
    </form>
  );
}
