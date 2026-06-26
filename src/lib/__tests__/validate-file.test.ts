import { describe, it, expect } from "vitest";
import { validateImageFile, validateAudioBlob } from "../validate-file";

function createFileWithBytes(bytes: number[], type: string, name: string): File {
  const buffer = new Uint8Array(bytes);
  return new File([buffer], name, { type });
}

function createBlobWithBytes(bytes: number[], type: string): Blob {
  const buffer = new Uint8Array(bytes);
  return new Blob([buffer], { type });
}

describe("validateImageFile", () => {
  it("accepts valid JPEG", async () => {
    const file = createFileWithBytes([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x01, 0x02, 0x03], "image/jpeg", "test.jpg");
    const result = await validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it("accepts valid PNG", async () => {
    const file = createFileWithBytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], "image/png", "test.png");
    const result = await validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it("accepts valid GIF", async () => {
    const file = createFileWithBytes([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x00, 0x00], "image/gif", "test.gif");
    const result = await validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it("accepts valid WebP", async () => {
    const file = createFileWithBytes([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00], "image/webp", "test.webp");
    const result = await validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it("rejects file with wrong magic bytes", async () => {
    const file = createFileWithBytes([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], "image/jpeg", "fake.jpg");
    const result = await validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("valid image");
  });

  it("rejects files over 10MB", async () => {
    const largeBuffer = new Uint8Array(10 * 1024 * 1024 + 1);
    largeBuffer[0] = 0xff;
    largeBuffer[1] = 0xd8;
    largeBuffer[2] = 0xff;
    const file = new File([largeBuffer], "large.jpg", { type: "image/jpeg" });
    const result = await validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("10MB");
  });
});

describe("validateAudioBlob", () => {
  it("accepts valid WebM audio", async () => {
    const blob = createBlobWithBytes([0x1a, 0x45, 0xdf, 0xa3, 0x00, 0x01, 0x02, 0x03], "audio/webm");
    const result = await validateAudioBlob(blob);
    expect(result.valid).toBe(true);
  });

  it("accepts valid MP3", async () => {
    const blob = createBlobWithBytes([0xff, 0xfb, 0x90, 0x00, 0x00, 0x01, 0x02, 0x03], "audio/mpeg");
    const result = await validateAudioBlob(blob);
    expect(result.valid).toBe(true);
  });

  it("rejects blob with wrong magic bytes", async () => {
    // Use bytes that clearly don't match any audio signature
    const blob = createBlobWithBytes([0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff, 0x00, 0x11], "audio/webm");
    const result = await validateAudioBlob(blob);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("valid audio");
  });

  it("rejects blobs over 10MB", async () => {
    const largeBuffer = new Uint8Array(10 * 1024 * 1024 + 1);
    largeBuffer[0] = 0x1a;
    largeBuffer[1] = 0x45;
    largeBuffer[2] = 0xdf;
    largeBuffer[3] = 0xa3;
    const blob = new Blob([largeBuffer], { type: "audio/webm" });
    const result = await validateAudioBlob(blob);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("10MB");
  });
});
