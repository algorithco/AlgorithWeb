import { notFound } from "next/navigation";
import { McpTeaser } from "@/components/ai/mcp-teaser";
import {
  ProductOverview,
  productMetadata,
} from "@/components/product-overview";
import { getProduct } from "@/config/products";

const product = getProduct("guard");

export const metadata = product ? productMetadata(product) : {};

export default function GuardPage() {
  if (!product) notFound();
  return (
    <ProductOverview product={product}>
      <McpTeaser slug="guard" />
    </ProductOverview>
  );
}
