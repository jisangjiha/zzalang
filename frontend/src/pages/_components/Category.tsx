import { Link } from "react-router-dom";
import styles from "./Category.module.css";
import { useState, useEffect } from "react";
import type { Category } from "../../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Category() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/v1/categories`);
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, [API_BASE_URL]);

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
