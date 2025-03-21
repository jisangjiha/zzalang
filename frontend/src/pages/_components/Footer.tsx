import styles from "./Footer.module.css";

export default function Footer() {
  const today = new Date();

  return (
    <footer className={styles.footer}>
      ⓒ {today.getFullYear()}. Jisang Hong
    </footer>
  );
}
