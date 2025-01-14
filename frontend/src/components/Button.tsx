import type { ComponentProps } from "react";
import styles from "./Button.module.css";

type ButtonProps = ComponentProps<"button">;

export default function Button({ ...props }: ButtonProps) {
  return <button {...props} className={styles.button} />;
}
