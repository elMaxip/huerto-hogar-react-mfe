import { useId, type ComponentProps } from "react";
import styles from "./InputLabel.module.css";

interface InputLabelProps extends ComponentProps<"input"> {
  label: string;
  /** Mensaje en rojo debajo del input */
  error?: string;
}

export function InputLabel({ label, error, className, ...props }: InputLabelProps) {
  const errorId = useId();

  return (
    <div className={className}>
      <label className={styles.label}>
        <span>{label}</span>
        <input
          className={[styles.input, error && styles.invalid]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
      </label>

      {error && (
        <span id={errorId} role="alert" className={styles.error}>
          {error}
        </span>
      )}
    </div>
  );
}
