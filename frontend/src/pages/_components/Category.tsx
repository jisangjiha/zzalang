import { Link } from "react-router-dom";
import { useContext } from "react";
import { CategoryContext } from "../../contexts/category-context";
import styles from "./Category.module.css";

export default function Category() {
  const { categories } = useContext(CategoryContext);

  // 백엔드에서 최초에 만든 기본 카테고리 숨김
  const visibleCategories = categories.filter((cat) => cat.title !== "기본");

  return (
    <div className={styles.category}>
      {visibleCategories.map((category) => (
        <Link key={category.id} to={`/categories/${category.id}`}>
          {category.title}
        </Link>
      ))}
    </div>
  );
}
