import { useMemo } from "react";
import PageButton from "./PageButton";

import styles from "./Pagination.module.css";

interface PaginationProps {
  currentPage: number;
  totalPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPage,
  onPageChange,
}: PaginationProps) {
  // 페이지 번호 계산 (현재 페이지 중심으로 최대 5개 노출)
  const pageNumbers = useMemo(() => {
    const windowSize = 5;
    const half = Math.floor(windowSize / 2);

    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPage, start + windowSize - 1);

    if (end - start + 1 < windowSize) {
      start = Math.max(1, end - windowSize + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPage]);

  return (
    <section className={styles.pagination}>
      <PageButton
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        ＜
      </PageButton>
      {pageNumbers.map((page) => (
        <PageButton
          key={page}
          active={page === currentPage}
          onClick={() => onPageChange(page)}
          disabled={page === currentPage}
        >
          {page}
        </PageButton>
      ))}
      <PageButton
        disabled={currentPage >= totalPage}
        onClick={() =>
          onPageChange(currentPage < totalPage ? currentPage + 1 : currentPage)
        }
      >
        ＞
      </PageButton>
    </section>
  );
}
