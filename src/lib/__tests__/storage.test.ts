import { describe, it, expect } from "vitest";
import { getStoragePath, getBucket } from "../supabase/storage";

describe("getStoragePath", () => {
  it("extracts path from public URL", () => {
    const url =
      "https://abc.supabase.co/storage/v1/object/public/images/user-id/capsule-id/1234.jpg";
    expect(getStoragePath(url, "images")).toBe("user-id/capsule-id/1234.jpg");
  });

  it("extracts path from signed URL", () => {
    const url =
      "https://abc.supabase.co/storage/v1/object/sign/audio/user-id/capsule-id/1234.webm?token=xyz";
    expect(getStoragePath(url, "audio")).toBe("user-id/capsule-id/1234.webm");
  });

  it("returns null for invalid URL", () => {
    expect(getStoragePath("not-a-url", "images")).toBeNull();
  });

  it("returns null when bucket does not match", () => {
    const url =
      "https://abc.supabase.co/storage/v1/object/public/images/user-id/file.jpg";
    expect(getStoragePath(url, "audio")).toBeNull();
  });
});

describe("getBucket", () => {
  it("identifies audio bucket", () => {
    const url = "https://abc.supabase.co/storage/v1/object/public/audio/test.webm";
    expect(getBucket(url)).toBe("audio");
  });

  it("identifies images bucket", () => {
    const url = "https://abc.supabase.co/storage/v1/object/public/images/test.jpg";
    expect(getBucket(url)).toBe("images");
  });

  it("returns null for unknown bucket", () => {
    expect(getBucket("https://example.com/other/file.txt")).toBeNull();
  });
});
