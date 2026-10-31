import type { Metadata } from "next";
import Link from "next/link";
import { McpAddress, McpConnect } from "@/components/ai/mcp-connect";
import { McpDrawing } from "@/components/ai/mcp-drawing";
import { Container } from "@/components/container";
import { Section } from "@/components/section";
import { SplitWords } from "@/components/split-words";
import { StatusBadge } from "@/components/status-badge";
import { mcpFaq, mcpProducts, mcpPromises } from "@/content/mcp";

const TITLE = "Ask your assistant. Algorithco answers.";
const DESCRIPTION =
  "Connect Claude, Cursor or any AI assistant that speaks MCP to your Algorithco products. One address, one approval, read-only tools.";

export const metadata: Metadata = {
  title: "MCP for AI assistants",
  description: DESCRIPTION,
  alternates: { canonical: "/ai" },
  openGraph: {
    title: "MCP for AI assistants — Algorithco",
    description: DESCRIPTION,
    url: "/ai",
  },
};

export default function AiPage() {
  return (
    <div className="mcp-page">
      <section className="page-hero mcp-hero" data-reveal="fade">
        <Container>
          <p className="eyebrow">MCP · For AI assistants</p>
          <h1 aria-label={TITLE}>
            <span aria-hidden="true">
              <SplitWords text={TITLE} />
            </span>
          </h1>
          <div className="mcp-hero__foot">
            <p className="page-hero__description">{DESCRIPTION}</p>
            <McpAddress />
          </div>
        </Container>
      </section>

      <section className="section" data-reveal id="how-it-works">
        <Container>
          <div className="mcp-intro">
            <div className="mcp-intro__head">
              <p className="eyebrow">How it works</p>
              <h2 className="mcp-intro__title">
                Four steps between a question and its answer.
              </h2>
              <p className="mcp-intro__lead">
                Your assistant never gets your password and never reaches past
                the tools below. Point at a step to see it in the drawing.
              </p>
            </div>
            <McpDrawing />
          </div>
        </Container>
      </section>

      <Section
        className="mcp-products-section"
        eyebrow="By product"
        id="tools"
        title="What your assistant can read."
      >
        <div className="mcp-products" data-stagger>
          {mcpProducts.map((product) => (
            <article
              className={`mcp-product mcp-product--${product.status}`}
              key={product.slug}
            >
              <header className="mcp-product__head">
                <div>
                  <h3>
                    <Link href={product.href}>{product.name}</Link>
                  </h3>
                  <p>{product.summary}</p>
                </div>
                <StatusBadge
                  label={product.statusLabel}
                  status={product.status === "live" ? "available" : "preview"}
                />
              </header>
              {product.tools.length ? (
                <ol className="mcp-tools">
                  {product.tools.map((tool) => (
                    <li key={tool.name}>
                      <p className="mcp-tools__q">{tool.question}</p>
                      <code className="mcp-tools__name">{tool.name}</code>
                      <p className="mcp-tools__body">{tool.body}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mcp-product__next">
                  Coming to the same address. Assistants already connected will
                  see the new tools without setting anything up again.
                </p>
              )}
            </article>
          ))}
        </div>
      </Section>

      <Section
        className="mcp-connect-section"
        eyebrow="Connect"
        id="connect"
        title="Two minutes, once."
      >
        <McpConnect />
      </Section>

      <Section
        className="why-section"
        eyebrow="Promises"
        title="What a connected assistant can never do."
      >
        <div className="principles-grid principles-grid--four" data-stagger>
          {mcpPromises.map(([title, body], index) => (
            <article className="principle" key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </Section>

      <section className="product-details mcp-faq">
        <Container>
          <div className="detail-row" data-reveal>
            <div>
              <p className="eyebrow">Questions</p>
              <h2>Before you connect.</h2>
            </div>
            <div>
              <dl className="faq-list">
                {mcpFaq.map(([question, answer]) => (
                  <div key={question}>
                    <dt>{question}</dt>
                    <dd>{answer}</dd>
                  </div>
                ))}
              </dl>
              <div className="mcp-faq__links">
                <Link className="text-link" href="/docs/account/ai-assistants">
                  The full guide <span aria-hidden="true">→</span>
                </Link>
                <Link className="text-link" href="/app/account">
                  See connected apps <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
