"use client";

import { useState } from "react";
import { displayDateTime } from "@/lib/dashboard-format";
import type { AuditRecord } from "@/lib/guard-api";

const action = (value: number) =>
  value === 1 ? "allow" : value === 2 ? "deny" : "ask";
const tool = (value: number) =>
  ["OTHER", "SHELL", "EDIT", "WRITE", "READ", "NET"][value] ?? "OTHER";

export function AuditTable({ records }: { records: AuditRecord[] }) {
  const [expanded, setExpanded] = useState("");
  if (records.length === 0) {
    return <div className="guard-card muted">No audit entries yet.</div>;
  }
  return (
    <div className="guard-table-wrap">
      <table className="guard-table dashboard-stack-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Tool</th>
            <th>Action</th>
            <th>Payload</th>
            <th>Reason</th>
            <th>Confidence</th>
            <th>Latency</th>
            <th>Why</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => {
            const label = action(record.decision?.action ?? 3);
            const open = expanded === record.trace_id;
            return (
              <tr key={record.trace_id}>
                <td className="guard-table__time">
                  {displayDateTime(record.timestamp)}
                </td>
                <td data-label="Tool">{tool(record.tool_kind)}</td>
                <td data-label="Action">
                  <span className={`decision decision--${label}`}>{label}</span>
                </td>
                <td className="guard-code is-block" data-label="Payload">
                  {record.redacted_payload}
                </td>
                <td className="is-block" data-label="Reason">
                  {record.decision?.reason || "—"}
                </td>
                <td data-label="Confidence">
                  {(record.decision?.confidence_0_1 ?? 0).toFixed(2)}
                </td>
                <td data-label="Latency">
                  {record.decision?.latency_ms ?? 0} ms
                </td>
                <td data-label="Why">
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setExpanded(open ? "" : record.trace_id)}
                    title={open ? "Hide trace" : record.trace_id}
                  >
                    {open ? record.trace_id : record.trace_id.slice(0, 8)}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
