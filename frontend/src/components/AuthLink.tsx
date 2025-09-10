import styles from "./AuthLink.module.css";
import { Link } from "react-router-dom";
import { cn } from "../utils/className";

type AuthLinkProps = {
  type: "login" | "register";
  className?: string;
};

const LINK_PROPS: Record<
  AuthLinkProps["type"],
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

export default function AuthLink({ type, className }: AuthLinkProps) {
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
