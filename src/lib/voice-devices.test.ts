import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  revokeApp: vi.fn(),
  listVoiceDevices: vi.fn(),
  removeVoiceDevice: vi.fn(),
}));
vi.mock("./account-center", () => ({ revokeApp: mocks.revokeApp }));
vi.mock("./voice-api", () => ({
  listVoiceDevices: mocks.listVoiceDevices,
  removeVoiceDevice: mocks.removeVoiceDevice,
}));

import {
  computersOfSignIn,
  freeSeatsOf,
  removeComputer,
  signInsOfComputer,
} from "./voice-devices";

const app = (
  id: string,
  deviceName: string | null,
  clientId = "voice-desktop",
) => ({
  id,
  clientId,
  name: "AlgorithVoice Desktop",
  deviceName,
  connectedAt: "2026-10-16T00:00:00Z",
  lastUsedAt: "2026-10-16T00:00:00Z",
});
const device = (id: string, name: string, grantId: string | null = null) => ({
  id,
  name,
  type: "desktop-windows" as const,
  grantId,
  lastSeenAt: null,
  createdAt: "2026-10-16T00:00:00Z",
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.revokeApp.mockResolvedValue({ ok: true });
  mocks.removeVoiceDevice.mockResolvedValue({ ok: true });
});

describe("signInsOfComputer", () => {
  it("uses the sign-in the seat recorded", () => {
    expect(
      signInsOfComputer(device("d1", "PC", "g1"), [app("g2", "PC")]),
    ).toEqual(["g1"]);
  });

  it("otherwise ends every AlgorithVoice sign-in on a computer of that name", () => {
    const apps = [
      app("g1", "PC"),
      app("g2", "PC"),
      app("g3", "LAPTOP"),
      app("g4", "PC", "guard-cli"),
      app("g5", null),
    ];
    expect(signInsOfComputer(device("d1", "PC"), apps)).toEqual(["g1", "g2"]);
    expect(signInsOfComputer(device("d1", "PC"), undefined)).toEqual([]);
  });
});

describe("computersOfSignIn", () => {
  it("finds the seats that recorded the sign-in, else unrecorded ones of the same name", () => {
    const devices = [
      device("d1", "PC", "g1"),
      device("d2", "PC"),
      device("d3", "LAPTOP"),
    ];
    expect(computersOfSignIn(app("g1", "PC"), devices)).toEqual(["d1"]);
    expect(computersOfSignIn(app("g9", "PC"), devices)).toEqual(["d2"]);
    expect(computersOfSignIn(app("g9", null), devices)).toEqual([]);
  });
});

describe("removeComputer", () => {
  it("ends the sign-in, then frees the seat", async () => {
    const loadApps = vi.fn();
    await expect(
      removeComputer(device("d1", "PC", "g1"), "token", loadApps),
    ).resolves.toEqual({
      signedOut: 1,
    });
    expect(loadApps).not.toHaveBeenCalled();
    expect(mocks.revokeApp).toHaveBeenCalledWith("g1");
    expect(mocks.removeVoiceDevice).toHaveBeenCalledWith("d1", "token");
    expect(mocks.revokeApp.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.removeVoiceDevice.mock.invocationCallOrder[0] ?? 0,
    );
  });

  it("looks the sign-in up by name for an older seat", async () => {
    await removeComputer(device("d1", "PC"), "token", async () => [
      app("g7", "PC"),
    ]);
    expect(mocks.revokeApp).toHaveBeenCalledWith("g7");
  });

  it("keeps the seat when the sign-in could not be ended", async () => {
    mocks.revokeApp.mockResolvedValue({ ok: false, error: "Sign in again." });
    await expect(
      removeComputer(device("d1", "PC", "g1"), "token", vi.fn()),
    ).rejects.toThrow("Sign in again.");
    expect(mocks.removeVoiceDevice).not.toHaveBeenCalled();
  });
});

describe("freeSeatsOf", () => {
  it("frees the seats of an AlgorithVoice sign-in and ignores other apps", async () => {
    mocks.listVoiceDevices.mockResolvedValue({
      devices: [device("d1", "PC", "g1")],
    });
    await freeSeatsOf(app("g1", "PC"), "token");
    expect(mocks.removeVoiceDevice).toHaveBeenCalledWith("d1", "token");
    mocks.removeVoiceDevice.mockClear();
    await freeSeatsOf(app("g1", "PC", "guard-cli"), "token");
    expect(mocks.removeVoiceDevice).not.toHaveBeenCalled();
  });

  it("never fails: the sign-in is already over", async () => {
    mocks.listVoiceDevices.mockRejectedValue(new Error("offline"));
    await expect(
      freeSeatsOf(app("g1", "PC"), "token"),
    ).resolves.toBeUndefined();
  });
});
