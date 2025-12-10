import type { ComponentProps } from "react";
import styles from "./PageButton.module.css";

type ButtonProps = ComponentProps<"button"> & {
  active?: boolean;
};

export default function PageButton({
  active = false,
  className,
  ...props
}: ButtonProps) {
  const mergedClassName = [
    styles.pageButton,
    active ? styles.pageButtonActive : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return <button {...props} className={mergedClassName} />;
}
