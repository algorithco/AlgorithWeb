import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

class MemoryStorage implements Storage {
  readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

function token(expiresAt: number): string {
  const payload = btoa(
    JSON.stringify({ sub: "account-user", exp: expiresAt, email: "user@test" }),
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `header.${payload}.signature`;
}

describe("platform session", () => {
  const sessionStorage = new MemoryStorage();
  const localStorage = new MemoryStorage();

  beforeEach(() => {
    vi.resetModules();
    sessionStorage.clear();
    localStorage.clear();
    vi.stubGlobal("window", {
      dispatchEvent: vi.fn(),
      localStorage,
      sessionStorage,
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("restores a short-lived access token after the module reloads", async () => {
    const current = await import("./platform-session");
    const accessToken = token(Math.floor(Date.now() / 1000) + 600);
    current.saveAccessToken(accessToken);

    vi.resetModules();
    const reloaded = await import("./platform-session");
    expect(reloaded.loadAccessToken()).toBe(accessToken);
    // The token never reaches storage that outlives the tab. What does is a
    // marker that this browser was signed in, and it carries nothing.
    expect([...localStorage.values.entries()]).toEqual([
      ["algorithco-signed-in", "1"],
    ]);
  });

  it("remembers that the browser was signed in until told otherwise", async () => {
    const session = await import("./platform-session");
    expect(session.hasSignedInHint()).toBe(false);
    session.saveAccessToken(token(Math.floor(Date.now() / 1000) + 600));
    expect(session.hasSignedInHint()).toBe(true);
    // The token running out is not a sign-out: the session may well go on.
    session.saveAccessToken("");
    expect(session.hasSignedInHint()).toBe(true);
    session.setSignedInHint(false);
    expect(session.hasSignedInHint()).toBe(false);
    expect(localStorage.length).toBe(0);
  });

  it("removes an expired access token instead of restoring it", async () => {
    sessionStorage.setItem(
      "algorithco-platform-access-token",
      token(Math.floor(Date.now() / 1000) - 1),
    );

    const session = await import("./platform-session");
    expect(session.loadAccessToken()).toBe("");
    expect(sessionStorage.length).toBe(0);
  });
});
