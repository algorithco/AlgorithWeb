import { type ReactNode, ViewTransition } from "react";

/**
 * The root template only remounts between top-level routes. This one covers
 * the product list <-> product detail hop, which stays inside /products.
 */
export default function ProductsTemplate({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ViewTransition default="none" enter="page-enter" exit="page-exit">
      {children}
    </ViewTransition>
  );
}
