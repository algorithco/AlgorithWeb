import { type ReactNode, ViewTransition } from "react";

/**
 * The root template only remounts between top-level routes. This one animates
 * page changes inside /voice, while the product navbar in the layout stays put.
 */
export default function VoiceTemplate({ children }: { children: ReactNode }) {
  return (
    <ViewTransition default="none" enter="page-enter" exit="page-exit">
      {children}
    </ViewTransition>
  );
}
