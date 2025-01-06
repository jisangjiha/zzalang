import styles from "./Button.module.css";

export default function Button(props: { buttonName: string }) {
  return <button className={styles.button}>{props.buttonName}</button>;
}
