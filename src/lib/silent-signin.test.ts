import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const beginAccountLogin = vi.fn(async () => undefined);
const silentAccountSignIn = vi.fn();
const accountSessionActive = vi.fn();
const accountSessionState = vi.fn();
const hasSignedInHint = vi.fn();
const setSignedInHint = vi.fn();

vi.mock("./account-auth", () => ({ beginAccountLogin, silentAccountSignIn }));
vi.mock("./account-forms", () => ({
  accountSessionActive,
  accountSessionState,
}));
vi.mock("./platform-session", () => ({ hasSignedInHint, setSignedInHint }));

const { restoreSession, trySilentSignIn } = await import("./silent-signin");

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

describe("bringing the sign-in back in the background", () => {
  beforeEach(() => {
    silentAccountSignIn.mockReset();
    accountSessionState.mockReset();
    hasSignedInHint.mockReset();
    setSignedInHint.mockReset();
  });

  it("asks nothing on a page of a browser that was never signed in", async () => {
    hasSignedInHint.mockReturnValue(false);

    await expect(restoreSession(false)).resolves.toBe(false);
    expect(accountSessionState).not.toHaveBeenCalled();
    expect(silentAccountSignIn).not.toHaveBeenCalled();
  });

  it("asks on the dashboard even without the hint", async () => {
    hasSignedInHint.mockReturnValue(false);
    accountSessionState.mockResolvedValue("active");
    silentAccountSignIn.mockResolvedValue({ accessToken: "token" });

    await expect(restoreSession(true)).resolves.toBe(true);
    expect(silentAccountSignIn).toHaveBeenCalledTimes(1);
  });

  it("forgets the hint when the Account service says the session is gone", async () => {
    hasSignedInHint.mockReturnValue(true);
    accountSessionState.mockResolvedValue("none");

    await expect(restoreSession(false)).resolves.toBe(false);
    expect(setSignedInHint).toHaveBeenCalledWith(false);
    expect(silentAccountSignIn).not.toHaveBeenCalled();
  });

  it("keeps the hint when the Account service cannot be asked", async () => {
    hasSignedInHint.mockReturnValue(true);
    accountSessionState.mockResolvedValue("unknown");

    await expect(restoreSession(false)).resolves.toBe(false);
    expect(setSignedInHint).not.toHaveBeenCalled();
    expect(silentAccountSignIn).not.toHaveBeenCalled();
  });

  it("is not signed in when the session is there but the flow fails", async () => {
    hasSignedInHint.mockReturnValue(true);
    accountSessionState.mockResolvedValue("active");
    silentAccountSignIn.mockResolvedValue(null);

    await expect(restoreSession(false)).resolves.toBe(false);
    expect(setSignedInHint).not.toHaveBeenCalled();
  });

  it("shares one attempt between the callers on a page", async () => {
    hasSignedInHint.mockReturnValue(true);
    accountSessionState.mockResolvedValue("active");
    silentAccountSignIn.mockResolvedValue({ accessToken: "token" });

    const [header, footer] = await Promise.all([
      restoreSession(false),
      restoreSession(false),
    ]);
    expect([header, footer]).toEqual([true, true]);
    expect(accountSessionState).toHaveBeenCalledTimes(1);
    expect(silentAccountSignIn).toHaveBeenCalledTimes(1);
  });

  it("does not let the header's attempt answer for the dashboard's", async () => {
    // No hint: the header's attempt gives up without asking anyone.
    hasSignedInHint.mockReturnValue(false);
    accountSessionState.mockResolvedValue("active");
    silentAccountSignIn.mockResolvedValue({ accessToken: "token" });

    const [header, dashboard] = await Promise.all([
      restoreSession(false),
      restoreSession(true),
    ]);
    expect(header).toBe(false);
    expect(dashboard).toBe(true);
    expect(silentAccountSignIn).toHaveBeenCalledTimes(1);
  });
});
