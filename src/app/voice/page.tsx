import { notFound } from "next/navigation";
import { McpTeaser } from "@/components/ai/mcp-teaser";
import {
  ProductOverview,
  productMetadata,
} from "@/components/product-overview";
import { getProduct } from "@/config/products";
import { voiceFaq } from "@/content/voice-faq";

const product = getProduct("voice");

export const metadata = product ? productMetadata(product) : {};

export default function VoicePage() {
  if (!product) notFound();
  return (
    <ProductOverview product={product}>
      <McpTeaser slug="voice" />
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
        </div>
      </div>
    </ProductOverview>
  );
}
