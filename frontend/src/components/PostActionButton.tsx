import React from "react";
import styles from "../components/PostActionButton.module.css";

type Variant = "modify" | "delete" | "default";

type PostActionButtonProps = {
  text: string;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  variant?: Variant;
};

export default function PostActionButton({
  text,
  onClick,
  disabled = false,
  variant = "default",
}: PostActionButtonProps) {
  const variantClass =
    variant === "modify"
      ? styles.modifyButton
      : variant === "delete"
      ? styles.deleteButton
      : "";

  return (
    <button onClick={onClick} disabled={disabled} className={variantClass}>
      {text}
    </button>
  );
}
