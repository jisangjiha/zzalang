import styles from "./AuthRouter.module.css";
import { Link } from "react-router-dom";

type AuthRouterProps = {
  type: "login" | "register";
  className?: string;
};

export default function AuthRouter({ type, className }: AuthRouterProps) {
  const isLoginPage = type === "login";

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <span className={styles.text}>
        {isLoginPage ? "계정이 없으신가요?" : "이미 계정이 있으신가요?"}
      </span>
      <Link to={isLoginPage ? "/register" : "/login"} className={styles.link}>
        {isLoginPage ? "회원가입하러 가기" : "로그인하러 가기"}
      </Link>
    </div>
  );
}
