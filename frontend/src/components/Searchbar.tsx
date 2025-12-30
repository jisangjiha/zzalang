import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Searchbar.module.css";

type SearchType = "all" | "title" | "content";

interface SearchbarProps {
  onSearch?: (query: string, type: SearchType) => void;
}

export default function Searchbar({ onSearch }: SearchbarProps) {
  const [search, setSearch] = useState<string>("");
  const [type, setType] = useState<SearchType>("all");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!search.trim()) {
      return;
    }

    const params = new URLSearchParams();
    params.append("q", search.trim());
    params.append("type", type);

    navigate(`/?${params.toString()}`);

    if (onSearch) {
      onSearch(search.trim(), type);
    }
  };

  return (
    <form className={styles.searchbar} onSubmit={handleSubmit}>
      <div className={styles.searchbarContent}>
        <select
          value={type}
          className={styles.searchType}
          onChange={(e) => setType(e.target.value as SearchType)}
        >
          <option value="all">제목+내용</option>
          <option value="title">제목</option>
          <option value="content">내용</option>
        </select>
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          value={search}
          className={styles.searchInput}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <button type="submit" className={styles.searchButton}>
        검색
      </button>
    </form>
  );
}
