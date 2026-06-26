import { describe, it, expect, vi, beforeEach } from "vitest";
import { rateLimit } from "../rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns success on first request", () => {
    const result = rateLimit("test:key", { limit: 5, windowSeconds: 60 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("tracks remaining count correctly", () => {
    rateLimit("test:count", { limit: 3, windowSeconds: 60 });
    rateLimit("test:count", { limit: 3, windowSeconds: 60 });
    const result = rateLimit("test:count", { limit: 3, windowSeconds: 60 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("blocks after limit exceeded", () => {
    const config = { limit: 2, windowSeconds: 60 };
    rateLimit("test:block", config);
    rateLimit("test:block", config);
    const result = rateLimit("test:block", config);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    const config = { limit: 1, windowSeconds: 60 };
    rateLimit("test:reset", config);
    const blocked = rateLimit("test:reset", config);
    expect(blocked.success).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(61_000);
    const afterReset = rateLimit("test:reset", config);
    expect(afterReset.success).toBe(true);
    expect(afterReset.remaining).toBe(0);
  });

  it("tracks different keys independently", () => {
    const config = { limit: 1, windowSeconds: 60 };
    rateLimit("key:a", config);
    const resultA = rateLimit("key:a", config);
    const resultB = rateLimit("key:b", config);
    expect(resultA.success).toBe(false);
    expect(resultB.success).toBe(true);
  });
});
