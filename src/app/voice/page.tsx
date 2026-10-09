import { notFound } from "next/navigation";
import {
  ProductOverview,
  productMetadata,
} from "@/components/product-overview";
import { getProduct } from "@/config/products";

const product = getProduct("voice");

export const metadata = product ? productMetadata(product) : {};

export default function VoicePage() {
  if (!product) notFound();
  return <ProductOverview product={product} />;
}
