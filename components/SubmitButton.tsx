"use client";

import { useFormStatus } from "react-dom";

/** Submit button that disables itself and shows a pending label while its form's action runs. */
export function SubmitButton({
  children,
  pendingLabel,
  className,
  confirmMessage,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  /** When set, asks for confirmation before submitting (for destructive actions). */
  confirmMessage?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={className}
      onClick={(e) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
