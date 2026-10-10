import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ProductOverview,
  productMetadata,
} from "@/components/product-overview";
import { getProduct } from "@/config/products";
import { voiceFaq } from "@/content/voice-docs";

const product = getProduct("voice");

export const metadata = product ? productMetadata(product) : {};

export default function VoicePage() {
  if (!product) notFound();
  return (
    <ProductOverview product={product}>
      <div className="detail-row" data-reveal>
        <div>
          <p className="eyebrow">Questions</p>
          <h2>Before you install.</h2>
        </div>
        <div>
          <dl className="faq-list">
            {voiceFaq.map(([question, answer]) => (
              <div key={question}>
                <dt>{question}</dt>
                <dd>{answer}</dd>
              </div>
            ))}
          </dl>
          <Link className="text-link" href="/voice/docs">
            Read the documentation <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </ProductOverview>
  );
}
