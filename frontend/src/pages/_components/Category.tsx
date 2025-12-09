import { Link } from "react-router-dom";
import styles from "./Category.module.css";

export default function Category() {
  return (
    <div className={styles.category}>
      <Link to="/category-daily">일상 공유</Link>
      <Link to="/category-qna">질문과 답변</Link>
      <Link to="/category-study">스터디 모집</Link>
    </div>
  );
}
