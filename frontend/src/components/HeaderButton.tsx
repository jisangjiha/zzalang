import type { ComponentProps } from "react";
import styles from "./HeaderButton.module.css";

type ButtonProps = ComponentProps<"button">;

export default function HeaderButton({ ...props }: ButtonProps) {
  return <button {...props} className={styles.button} />;
}
