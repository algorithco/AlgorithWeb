import Link from "next/link";
import type { ReactNode } from "react";
import { type InlineToken, parseInline } from "@/lib/changelog";

function render(tokens: InlineToken[]): ReactNode[] {
  // A line never changes after the build, so the position is a stable key.
  return tokens.map((token, index) => {
    switch (token.kind) {
      case "code":
        return <code key={index}>{token.text}</code>;
      case "strong":
        return <strong key={index}>{render(token.children)}</strong>;
      case "link":
        return token.href.startsWith("/") ? (
          <Link href={token.href} key={index}>
            {render(token.children)}
          </Link>
        ) : (
          <a href={token.href} key={index} rel="noreferrer">
            {render(token.children)}
          </a>
        );
      default:
        return token.text;
    }
  });
}

/** One line of a changelog, with its `code`, **bold** and links. */
export function InlineText({ text }: { text: string }) {
  return <>{render(parseInline(text))}</>;
}
