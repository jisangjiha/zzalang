import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import type { ComponentProps } from "react";

import { AuthContext } from "../contexts/auth-context";
import { toast } from "react-toastify";
import styles from "./PostingButton.module.css";

type PostingButtonProps = ComponentProps<"button"> & {
  text: string;
  useAuthGuard?: boolean;
};

export default function PostingButton({
  text,
  useAuthGuard = true, // main page에서 글쓰기 버튼 기본값
  onClick,
  className,
  type,
  ...rest
}: PostingButtonProps) {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const isNotLogin = () => toast.error("로그인 후 글쓰기가 가능합니다.");

  const defaultClick = () => {
    if (!token) {
      isNotLogin();
      return;
    }
    navigate("/posts");
  };

  const handleClick = useAuthGuard && !onClick ? defaultClick : onClick;
  const mergedClassName = [styles.button, className].filter(Boolean).join(" ");

  return (
    <button
      type={type ?? "button"}
      className={mergedClassName}
      onClick={handleClick}
      {...rest}
    >
      {text}
    </button>
  );
}
