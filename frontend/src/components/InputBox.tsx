import { ComponentProps, useId } from "react";
import styles from "./InputBox.module.css";

type InputProps = ComponentProps<"input"> & {
  label?: string;
};

export default function InputBox({ label, ...props }: InputProps) {
  const inputId = useId();

  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <input {...props} className={styles.inputBox} id={inputId} />
    </div>
  );
}
