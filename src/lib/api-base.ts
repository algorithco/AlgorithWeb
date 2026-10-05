"use client";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly upgrade: { tier: string; feature: string } | null = null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = RequestInit & { token?: string };

async function parseError(response: Response): Promise<ApiError> {
  let message = `Request failed (${response.status})`;
  let upgrade: ApiError["upgrade"] = null;
  try {
    const body = (await response.json()) as {
      error?: unknown;
      upgrade?: { tier?: unknown; feature?: unknown };
    };
    if (typeof body.error === "string" && body.error) message = body.error;
    if (
      typeof body.upgrade?.tier === "string" &&
      typeof body.upgrade.feature === "string"
    ) {
      upgrade = { tier: body.upgrade.tier, feature: body.upgrade.feature };
    }
  } catch {
    // Preserve the status-based fallback for non-JSON failures.
  }
  return new ApiError(response.status, message, upgrade);
}

export function normalizeBase(
  raw: string | undefined,
  fallback: string,
): string {
  return (raw?.trim() || fallback).replace(/\/$/, "");
}

export function buildQuery(
  params: Record<string, string | number | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const value = search.toString();
  return value ? `?${value}` : "";
}

export async function apiFetch<T>(
  base: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body) headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);
  let response: Response;
  try {
    response = await fetch(`${base}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(0, "Backend is unreachable.");
  }
  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
