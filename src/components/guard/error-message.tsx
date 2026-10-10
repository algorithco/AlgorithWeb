import { GuardApiError } from "@/lib/guard-api";

export function ErrorMessage({ error }: { error: unknown }) {
  if (!error) return null;
  const message =
    error instanceof GuardApiError || error instanceof Error
      ? error.message
      : "AlgorithGuard request failed.";
  return <p className="form-error">{message}</p>;
}
