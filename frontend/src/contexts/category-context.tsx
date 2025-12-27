import { createContext, useState, useEffect, ReactNode } from "react";
import type { Category } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface CategoryContextType {
  categories: Category[];
  categoryMap: Record<string, string>;
  isLoading: boolean;
}

export const CategoryContext = createContext<CategoryContextType>({
  categories: [],
  categoryMap: {},
  isLoading: true,
});

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/v1/categories`);
        if (response.ok) {
          const data = await response.json();
          if (data.categories && data.categories.length > 0) {
            // 역순으로 정렬 (최신 카테고리가 앞에 오도록)
            setCategories([...data.categories].reverse());
          }
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // 카테고리 id → title 매핑
  const categoryMap = Object.fromEntries(
    categories.map((cat) => [cat.id, cat.title])
  );

  return (
    <CategoryContext.Provider value={{ categories, categoryMap, isLoading }}>
      {children}
    </CategoryContext.Provider>
  );
}
