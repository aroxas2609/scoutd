import { afterEach, describe, expect, it } from "vitest";
import { getAppUrl, getAppUrlForAuth, isLocalHost } from "./app-url";

const env = process.env;

afterEach(() => {
  process.env = { ...env };
});

describe("isLocalHost", () => {
  it("detects localhost hosts", () => {
    expect(isLocalHost("localhost")).toBe(true);
    expect(isLocalHost("localhost:3000")).toBe(true);
    expect(isLocalHost("scoutd.vercel.app")).toBe(false);
  });
});

describe("getAppUrl", () => {
  it("prefers Vercel production URL over localhost env", () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "scoutd.vercel.app";
    delete process.env.VERCEL_URL;

    expect(getAppUrl()).toBe("https://scoutd.vercel.app");
  });

  it("uses public NEXT_PUBLIC_APP_URL when set", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://app.scoutd.com";
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;
    delete process.env.APP_URL;

    expect(getAppUrl()).toBe("https://app.scoutd.com");
  });

  it("prefers server APP_URL over public env", () => {
    process.env.APP_URL = "https://app.scoutd.com";
    process.env.NEXT_PUBLIC_APP_URL = "https://other.example.com";

    expect(getAppUrl()).toBe("https://app.scoutd.com");
  });
});

describe("getAppUrlForAuth", () => {
  it("never returns localhost on Vercel", () => {
    process.env.VERCEL = "1";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "scoutd.vercel.app";
    delete process.env.APP_URL;

    expect(getAppUrlForAuth()).toBe("https://scoutd.vercel.app");
  });
});
