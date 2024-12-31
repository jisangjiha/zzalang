import { Link } from "react-router-dom";
import logo from "../assets/casper.svg";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img src={logo} height={30} width={30} />
        <div className={styles.zzalang}>zzalang</div>
      </div>
      <div className={styles.identify}>
        <Link to={`/register`}>회원가입</Link>
        <Link to={`/login`}>로그인</Link>
      </div>
    </header>
  );
}
