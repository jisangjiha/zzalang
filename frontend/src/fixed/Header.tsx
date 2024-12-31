import { Link } from "react-router-dom";
import logo from "../assets/casper.svg";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <Link to={`/main`} className={styles.zzalang}>
        <img src={logo} height={30} width={30} />
        <div>zzalang</div>
      </Link>
      <div className={styles.identify}>
        <Link to={`/register`}>회원가입</Link>
        <Link to={`/login`}>로그인</Link>
      </div>
    </header>
  );
}
