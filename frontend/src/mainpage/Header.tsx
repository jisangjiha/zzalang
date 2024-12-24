import logo from "../assets/casper.svg";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <img src={logo} height={30} width={30} />
      <div className={styles.zzalang}>zzalang</div>
    </header>
  );
}
