import { type ReactNode, ViewTransition } from "react";

/**
 * Re-mounts on every top-level route change, which lets React's
 * <ViewTransition> animate the old page out and the new page in (the classes
 * are styled in motion.css). Browsers without View Transitions simply swap
 * pages instantly.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <ViewTransition default="none" enter="page-enter" exit="page-exit">
      {children}
    </ViewTransition>
  );
}
