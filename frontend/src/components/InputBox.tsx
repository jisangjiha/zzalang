import { ComponentProps } from "react";
import styles from "./InputBox.module.css";

type InputProps = ComponentProps<"input">;

export default function InputBox({ ...props }: InputProps) {
  return <input {...props} className={styles.inputBox} />;
}
