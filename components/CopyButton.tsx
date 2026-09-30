"use client";

import { useState } from "react";

/** Copies `path` as an absolute URL on the current origin. */
export function CopyLinkButton({ path, className }: { path: string; className?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(new URL(path, window.location.origin).toString());
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 2000);
  }

  return (
    <button type="button" onClick={copy} className={className} aria-live="polite">
      {state === "copied" ? "Copied!" : state === "failed" ? "Copy failed" : "Copy link"}
    </button>
  );
}
