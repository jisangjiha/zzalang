import { useState, useContext, ChangeEvent, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import type { ComponentType } from "react";

import { AuthContext } from "../../contexts/auth-context";
import { CategoryContext } from "../../contexts/category-context";
import { Post } from "../../types";
import PostingButton from "../../components/PostingButton";

import styles from "../page.module.css";
import "react-quill/dist/quill.snow.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type QuillEditorProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  theme?: string;
  placeholder?: string;
};

// 텍스트 에디터 라이브러리
const QuillEditor = ReactQuill as unknown as ComponentType<QuillEditorProps>;

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

export default function PostingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { token } = useContext(AuthContext);
  const { categories } = useContext(CategoryContext);

  // 백엔드에서 최초에 만든 기본 카테고리 숨김
  const visibleCategories = categories.filter((cat) => cat.title !== "기본");

  // id가 truthy 값 → true 반환, falsy 값 → false 반환
  // id가 존재하고, 경로에 /edit이 포함되어 있으면 수정 모드로 판단
  const isEdit = useMemo(
    () => !!id && location.pathname.includes("/edit"),
    [id, location.pathname]
  );

  const [postingData, setPostingData] = useState({
    title: "",
    content: "",
    categoryId: "",
  });
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);

  // 카테고리 초기값 설정
  useEffect(() => {
    if (visibleCategories.length > 0 && !currentCategory) {
      setCurrentCategory(visibleCategories[0].id);
    }
  }, [visibleCategories, currentCategory]);

  useEffect(() => {
    if (!isEdit || !id) return;

    const fetchPost = async () => {
      setIsLoadingPost(true);
      setErrorMessage(undefined);

      try {
        const response = await fetch(`${API_BASE_URL}/v1/posts/${id}`);

        if (!response.ok) {
          const message = await handleApiError(
            response,
            "게시글을 불러오지 못했습니다."
          );
          setErrorMessage(message);
          return;
        }

        const data: Post = await response.json();
        setPostingData({
          title: data.title,
          content: data.content,
          categoryId: data.categoryId,
        });
        setCurrentCategory(data.categoryId);
      } catch {
        setErrorMessage("네트워크 오류가 발생했습니다.");
      } finally {
        setIsLoadingPost(false);
      }
    };

    fetchPost();
  }, [isEdit, id]);

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCurrentCategory(e.target.value);
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPostingData((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleContentChange = (value: string) => {
    setPostingData((prev) => ({ ...prev, content: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      const url = isEdit
        ? `${API_BASE_URL}/v1/posts/${id}`
        : `${API_BASE_URL}/v1/posts`;
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          title: postingData.title.trim(),
          content: postingData.content.trim(),
          categoryId: currentCategory,
        }),
      });

      if (!response.ok) {
        const message = await handleApiError(
          response,
          isEdit ? "글 수정에 실패했습니다." : "글 작성에 실패했습니다."
        );
        setErrorMessage(message);
        return;
      }

      navigate("/");
    } catch {
      setErrorMessage("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) {
      return isEdit ? "수정 중..." : "등록 중...";
    }
    return isEdit ? "수정하기" : "등록하기";
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
            onChange={handleCategoryChange}
            className={styles.postingSelect}
          >
            {visibleCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
        </label>
        <input
          className={styles.postingTitle}
          type="text"
          placeholder="제목을 입력하세요"
          value={postingData.title}
          onChange={handleTitleChange}
          disabled={isLoadingPost}
        />
        <QuillEditor
          className={styles.postingEditor}
          theme="snow"
          value={postingData.content}
          onChange={handleContentChange}
          placeholder="내용을 입력하세요"
        />
      </div>
      <div className={styles.postingFooter}>
        {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
        <PostingButton
          type="submit"
          useAuthGuard={false}
          disabled={isLoading}
          text={getButtonText()}
        />
      </div>
    </form>
  );
}
