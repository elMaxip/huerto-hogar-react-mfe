import type { ComponentProps } from "react";
import styles from "./PrimaryButton.module.css";

export function PrimaryButton({
  className,
  type = "button",
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={[styles.button, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
