"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ErrorMessage } from "@/components/guard/error-message";
import { usePlatformSession } from "@/hooks/use-platform-session";
import {
  dryRunGuardPolicy,
  getGuardPolicy,
  listAudit,
  publishGuardPolicy,
} from "@/lib/guard-api";

const starter = `# Algorithco Guard policy
version: v1
profile: balanced
rules:
  - id: deny-pipe-to-shell
    when: 'tool_kind == "SHELL" && redacted_payload contains "| sh"'
    action: deny
    reason: "pipe to shell blocked"
  - id: ask-destructive-rm
    when: 'shell_argv[0] == "rm" && shell_argv contains "-rf"'
    action: ask
    reason: "destructive removal requires confirmation"
`;

export default function GuardPolicyPage() {
  const session = usePlatformSession();
  const queryClient = useQueryClient();
  const [content, setContent] = useState(starter);
  const active = session.signedIn && session.orgId !== "";
  const policy = useQuery({
    queryKey: ["guard", "policy", session.orgId],
    queryFn: () => getGuardPolicy("latest", session.orgId, session.token),
    enabled: active,
  });

  useEffect(() => {
    if (!policy.data?.signed_bytes_b64) return;
    try {
      const decoded = atob(policy.data.signed_bytes_b64);
      if (decoded.includes("rules:")) setContent(decoded);
    } catch {
      // Keep the safe starter policy when an older bundle is not text YAML.
    }
  }, [policy.data]);

  const dryRun = useMutation({
    mutationFn: async () => {
      const history = await listAudit(
        { org_id: session.orgId, limit: 50 },
        session.token,
      );
      return dryRunGuardPolicy(
        {
          org_id: session.orgId,
          bundle: { content },
          history_ids: history.records.map((record) => record.trace_id),
        },
        session.token,
      );
    },
  });
  const publish = useMutation({
    mutationFn: () =>
      publishGuardPolicy({ org_id: session.orgId, content }, session.token),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["guard", "policy"] }),
  });

  return (
    <div className="guard-stack">
      <p className="eyebrow">Guard</p>
      <h2>Policy</h2>
      <p className="muted">
        Dry-run policy changes against redacted history before publishing a
        signed bundle.
      </p>
      <ErrorMessage error={policy.error ?? dryRun.error ?? publish.error} />
      <div className="guard-grid guard-grid--policy">
        <article className="guard-card">
          <label className="guard-field">
            <span>Policy YAML</span>
            <textarea
              rows={22}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              spellCheck={false}
            />
          </label>
          <div className="guard-actions">
            <button
              type="button"
              onClick={() => dryRun.mutate()}
              disabled={!active || dryRun.isPending}
            >
              {dryRun.isPending ? "Evaluating…" : "Dry-run"}
            </button>
            <button
              type="button"
              onClick={() => publish.mutate()}
              disabled={!active || publish.isPending}
            >
              {publish.isPending ? "Publishing…" : "Publish"}
            </button>
            <button type="button" onClick={() => setContent(starter)}>
              Reset
            </button>
          </div>
        </article>
        <div className="guard-stack">
          <article className="guard-card">
            <p className="eyebrow">Dry-run result</p>
            {dryRun.data ? (
              <>
                <h3>{dryRun.data.result}</h3>
                <p className="muted">
                  {dryRun.data.evaluated} decisions evaluated
                </p>
                <ul>
                  {dryRun.data.decisions.map((decision) => (
                    <li key={decision}>{decision}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="muted">No dry-run yet.</p>
            )}
          </article>
          <article className="guard-card">
            <p className="eyebrow">Published bundle</p>
            <h3>{publish.data?.version ?? policy.data?.version ?? "None"}</h3>
          </article>
        </div>
      </div>
    </div>
  );
}
