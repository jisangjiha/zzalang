import { ComponentProps } from "react";
import styles from "./InputBox.module.css";

type InputProps = ComponentProps<"input">;

export default function InputBox({ ...props }: InputProps) {
  return <input className={styles.inputBox} placeholder={props.placeholder} />;
}
