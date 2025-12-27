import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../contexts/auth-context";
import { Category } from "../../../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function CategoriesPage() {
  const { token } = useContext(AuthContext);

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 카테고리 목록 불러오기
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 카테고리 추가
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setMessage("로그인이 필요합니다.");
      return;
    }

    if (!title.trim() || !description.trim()) {
      setMessage("제목과 설명을 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/v1/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      if (response.ok) {
        setMessage(`"${title}" 카테고리가 추가되었습니다.`);
        setTitle("");
        setDescription("");
        // 리스트 갱신
        await fetchCategories();
      } else {
        const error = await response.json();
        setMessage(`실패: ${error.message || "알 수 없는 오류"}`);
      }
    } catch (error) {
      setMessage(`네트워크 오류: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>카테고리 관리</h1>
      <h2>현재 카테고리 목록</h2>
      <ul>
        {categories.map((cat) => (
          <li key={cat.id}>
            {cat.title} - {cat.description}
          </li>
        ))}
      </ul>
      <h2>카테고리 추가</h2>
      <form onSubmit={handleAddCategory}>
        <div>
          <label>
            제목:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </label>
        </div>
        <div>
          <label>
            설명:
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </label>
        </div>
        <button type="submit" disabled={isLoading || !token}>
          {isLoading ? "추가 중..." : "추가"}
        </button>
      </form>

      {message && <p>{message}</p>}
      {!token && <p>로그인이 필요합니다.</p>}
    </div>
  );
}
