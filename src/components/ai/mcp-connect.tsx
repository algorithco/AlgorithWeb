"use client";

import {
  type CSSProperties,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { mcpClients, mcpServerUrl } from "@/content/mcp";

/** Copies `text` and says so for two seconds. */
function Copy({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <button
      aria-label={copied ? "Copied" : label}
      className="mcp-copy"
      data-copied={copied || undefined}
      onClick={() => {
        navigator.clipboard
          ?.writeText(text)
          .then(() => setCopied(true))
          .catch(() => setCopied(false));
      }}
      type="button"
    >
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

/** The one server address, large, with a copy button. */
export function McpAddress() {
  return (
    <div className="mcp-address">
      <span className="mcp-address__label">Server address</span>
      <code className="mcp-address__url">{mcpServerUrl}</code>
      <Copy label="Copy the server address" text={mcpServerUrl} />
    </div>
  );
}

/**
 * How to connect, one tab per assistant. The tabs follow the WAI-ARIA tabs
 * pattern (arrow keys move between them); a yellow bar slides under the
 * chosen one and its steps come in one after another.
 */
export function McpConnect() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const list = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const place = () => {
      const tab = tabs.current[active];
      const row = list.current;
      if (!tab || !row) return;
      setBar({
        left: tab.offsetLeft - row.scrollLeft,
        width: tab.offsetWidth,
      });
    };
    place();
    const observer = new ResizeObserver(place);
    if (list.current) observer.observe(list.current);
    return () => observer.disconnect();
  }, [active]);

  const choose = (index: number) => {
    const next = (index + mcpClients.length) % mcpClients.length;
    setActive(next);
    tabs.current[next]?.focus();
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") choose(active + 1);
    else if (event.key === "ArrowLeft") choose(active - 1);
    else if (event.key === "Home") choose(0);
    else if (event.key === "End") choose(mcpClients.length - 1);
    else return;
    event.preventDefault();
  };

  const client = mcpClients[active];
  return (
    <div className="mcp-connect">
      <div
        aria-label="Assistant"
        className="mcp-connect__tabs"
        onKeyDown={onKey}
        ref={list}
        role="tablist"
      >
        {mcpClients.map((item, index) => (
          <button
            aria-controls={`mcp-panel-${item.id}`}
            aria-selected={index === active}
            className="mcp-connect__tab"
            id={`mcp-tab-${item.id}`}
            key={item.id}
            onClick={() => setActive(index)}
            ref={(node) => {
              tabs.current[index] = node;
            }}
            role="tab"
            tabIndex={index === active ? 0 : -1}
            type="button"
          >
            {item.name}
          </button>
        ))}
        <span
          aria-hidden="true"
          className="mcp-connect__bar"
          style={{ transform: `translateX(${bar.left}px)`, width: bar.width }}
        />
      </div>

      <div
        aria-labelledby={`mcp-tab-${client.id}`}
        className="mcp-connect__panel"
        id={`mcp-panel-${client.id}`}
        key={client.id}
        role="tabpanel"
      >
        <ol className="mcp-steps">
          {client.steps.map((step, index) => (
            <li key={step.title} style={{ "--i": index } as CSSProperties}>
              <span className="mcp-steps__no">0{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        {client.code ? (
          <figure
            className="mcp-code"
            style={{ "--i": client.steps.length } as CSSProperties}
          >
            <figcaption>
              <span>{client.code.label}</span>
              <Copy
                label={`Copy ${client.code.label}`}
                text={client.code.text}
              />
            </figcaption>
            <pre>
              <code>{client.code.text}</code>
            </pre>
          </figure>
        ) : (
          <div
            className="mcp-connect__address"
            style={{ "--i": client.steps.length } as CSSProperties}
          >
            <McpAddress />
          </div>
        )}
      </div>
    </div>
  );
}
