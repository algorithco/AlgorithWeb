import Link from "next/link";
import { mcpProducts } from "@/content/mcp";

/**
 * A detail row that points a product page at /ai: what an assistant can read
 * about this product, or that it is coming next.
 */
export function McpTeaser({ slug }: { slug: "voice" | "guard" }) {
  const product = mcpProducts.find((item) => item.slug === slug);
  if (!product) return null;
  const live = product.status === "live";
  return (
    <div className="detail-row" data-reveal>
      <div>
        <p className="eyebrow">AI assistants · MCP</p>
        <h2>{live ? "Ask your assistant." : "Your assistant, next."}</h2>
      </div>
      <div className="mcp-teaser">
        <p>
          {live
            ? `Connect Claude, Cursor or any assistant that speaks MCP and ask it about ${product.name}: ${product.summary.toLowerCase()} It can only read.`
            : `${product.name} is the next product behind the Algorithco MCP server: ${product.summary.toLowerCase()}`}
        </p>
        {live ? (
          <ul className="mcp-teaser__tools">
            {product.tools.map((tool) => (
              <li key={tool.name}>{tool.name}</li>
            ))}
          </ul>
        ) : null}
        <Link className="text-link" href="/ai">
          How to connect an assistant <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
