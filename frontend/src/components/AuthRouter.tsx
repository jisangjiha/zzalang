import styles from "./AuthRouter.module.css";
import { Link } from "react-router-dom";
import { cn } from "../utils/className";

type AuthRouterProps = {
  type: "login" | "register";
  className?: string;
};

const LINK_PROPS: Record<
  AuthRouterProps["type"],
  { question: string; linkText: string; linkTo: string }
> = {
  login: {
    question: "계정이 없으신가요?",
    linkText: "회원가입하러 가기",
    linkTo: "/register",
  },
  register: {
    question: "이미 계정이 있으신가요?",
    linkText: "로그인하러 가기",
    linkTo: "/login",
  },
} as const;

export default function AuthRouter({ type, className }: AuthRouterProps) {
  const props = LINK_PROPS[type];

  return (
    <div className={cn(styles.container, className)}>
      <span className={styles.text}>{props.question}</span>
      <Link to={props.linkTo} className={styles.link}>
        {props.linkText}
      </Link>
    </div>
  );
}
