import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/auth-context";

import { toast } from "react-toastify";
import styles from "./PostingButton.module.css";

export default function PostingButton() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const isNotLogin = () => toast.error("로그인 후 글쓰기가 가능합니다.");

  const handlePostingClick = () => {
    if (!token) {
      isNotLogin();
      return;
    }
    navigate("/posting");
  };

  return (
    <button className={styles.button} onClick={handlePostingClick}>
      글쓰기
    </button>
  );
}
