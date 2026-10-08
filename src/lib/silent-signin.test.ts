import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const beginAccountLogin = vi.fn(async () => undefined);
const accountSessionActive = vi.fn();

vi.mock("./account-auth", () => ({ beginAccountLogin }));
vi.mock("./account-forms", () => ({ accountSessionActive }));

const { trySilentSignIn } = await import("./silent-signin");

function stubStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  const sessionStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
  };
  vi.stubGlobal("window", { sessionStorage });
  return store;
}

describe("silent re-sign-in", () => {
  beforeEach(() => {
    beginAccountLogin.mockClear();
    accountSessionActive.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("continues the OIDC flow when the Account service has a live session", async () => {
    const store = stubStorage();
    accountSessionActive.mockResolvedValue(true);

    await expect(trySilentSignIn("/app/account")).resolves.toBe(true);
    expect(beginAccountLogin).toHaveBeenCalledWith("/app/account");
    expect(store.get("algorithco-silent-signin-at")).toBeDefined();
  });

  it("does nothing without an Account session so the login form can show", async () => {
    const store = stubStorage();
    accountSessionActive.mockResolvedValue(false);

    await expect(trySilentSignIn("/app")).resolves.toBe(false);
    expect(beginAccountLogin).not.toHaveBeenCalled();
    expect(store.has("algorithco-silent-signin-at")).toBe(false);
  });

  it("refuses to retry right after an attempt, which prevents redirect loops", async () => {
    stubStorage({ "algorithco-silent-signin-at": String(Date.now()) });
    accountSessionActive.mockResolvedValue(true);

    await expect(trySilentSignIn("/app")).resolves.toBe(false);
    expect(accountSessionActive).not.toHaveBeenCalled();
    expect(beginAccountLogin).not.toHaveBeenCalled();
  });

  it("falls back to the login form when starting the flow fails", async () => {
    stubStorage();
    accountSessionActive.mockResolvedValue(true);
    beginAccountLogin.mockRejectedValueOnce(new Error("discovery failed"));

    await expect(trySilentSignIn("/app")).resolves.toBe(false);
  });
});
