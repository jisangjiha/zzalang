import { Link } from "react-router-dom";
import { useContext } from "react";
import { CategoryContext } from "../../contexts/category-context";
import styles from "./Category.module.css";

export default function Category() {
  const { categories } = useContext(CategoryContext);

  return (
    <div className={styles.category}>
      {categories.map((category) => (
        <Link key={category.id} to={`/categories/${category.id}`}>
          {category.title}
        </Link>
      ))}
    </div>
  );
}
