import styles from "./InputBox.module.css";

export default function InputBox(props: { placeholder: string }) {
  return <input className={styles.inputBox} placeholder={props.placeholder} />;
}
