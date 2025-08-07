import { ComponentProps } from "react";
import styles from "./InputBox.module.css";

type InputProps = ComponentProps<"input"> & {
  label?: string;
};

export default function InputBox({ label, ...props }: InputProps) {
  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      <input {...props} className={styles.inputBox} />
    </div>
  );
}
