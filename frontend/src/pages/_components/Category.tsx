import { Link } from "react-router-dom";
import styles from "./Category.module.css";

// 게시글 작성할 때 카테고리 선택할 수 있도록 해야 함
// 백엔드 필요

// 메인페이지 구성 어떻게 할 건지 기획 후 페이지 route 분리

export default function Category() {
  return (
    <div className={styles.category}>
      <Link to="/category-daily">일상 공유</Link>
      <Link to="/category-qna">질문과 답변</Link>
      <Link to="/category-study">스터디 모집</Link>
    </div>
  );
}
