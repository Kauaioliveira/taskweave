import { afterEach, describe, expect, it, vi } from "vitest";
import { getPublicOrigin } from "./public-origin";

describe("getPublicOrigin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null when no origin env is set", () => {
    vi.stubEnv("AUTH_URL", "");
    vi.stubEnv("VERCEL_URL", "");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    expect(getPublicOrigin()).toBeNull();
  });

  it("prefers AUTH_URL and strips trailing slash", () => {
    vi.stubEnv("AUTH_URL", "https://app.example/");
    vi.stubEnv("VERCEL_URL", "https://ignored.vercel.app");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://ignored-public");
    expect(getPublicOrigin()).toBe("https://app.example");
  });

  it("uses VERCEL_URL with https when AUTH_URL is unset", () => {
    vi.stubEnv("AUTH_URL", "");
    vi.stubEnv("VERCEL_URL", "my-app.vercel.app");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
    expect(getPublicOrigin()).toBe("https://my-app.vercel.app");
  });

  it("strips protocol from VERCEL_URL when already present", () => {
    vi.stubEnv("AUTH_URL", "");
    vi.stubEnv("VERCEL_URL", "https://my-app.vercel.app");
    expect(getPublicOrigin()).toBe("https://my-app.vercel.app");
  });

  it("falls back to NEXT_PUBLIC_APP_URL", () => {
    vi.stubEnv("AUTH_URL", "");
    vi.stubEnv("VERCEL_URL", "");
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://public.example/");
    expect(getPublicOrigin()).toBe("https://public.example");
  });
});
