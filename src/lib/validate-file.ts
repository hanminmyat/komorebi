/**
 * Client-side file validation utilities.
 * Uses magic byte checking for MIME type verification.
 */

const IMAGE_SIGNATURES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/gif": [0x47, 0x49, 0x46],
  "image/webp": [0x52, 0x49, 0x46, 0x46], // RIFF header (WebP starts with RIFF)
};

const AUDIO_SIGNATURES: Record<string, number[]> = {
  "audio/webm": [0x1a, 0x45, 0xdf, 0xa3], // Matroska/WebM
  "audio/mpeg": [0xff, 0xfb], // MP3
  "audio/mp4": [0x00, 0x00, 0x00], // ftyp box (M4A/MP4)
};

function matchesSignature(
  buffer: ArrayBuffer,
  signatures: Record<string, number[]>
): boolean {
  const bytes = new Uint8Array(buffer.slice(0, 8));
  for (const sig of Object.values(signatures)) {
    if (sig.every((byte, i) => bytes[i] === byte)) {
      return true;
    }
  }
  return false;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate an image file by checking magic bytes and size.
 */
export async function validateImageFile(file: File): Promise<ValidationResult> {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  if (file.size > MAX_SIZE) {
    return { valid: false, error: "Image must be under 10MB." };
  }

  const buffer = await file.slice(0, 8).arrayBuffer();
  if (!matchesSignature(buffer, IMAGE_SIGNATURES)) {
    return { valid: false, error: "File does not appear to be a valid image." };
  }

  return { valid: true };
}

/**
 * Validate an audio blob by checking magic bytes and size.
 */
export async function validateAudioBlob(blob: Blob): Promise<ValidationResult> {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  if (blob.size > MAX_SIZE) {
    return { valid: false, error: "Audio must be under 10MB." };
  }

  const buffer = await blob.slice(0, 8).arrayBuffer();
  if (!matchesSignature(buffer, AUDIO_SIGNATURES)) {
    return { valid: false, error: "File does not appear to be valid audio." };
  }

  return { valid: true };
}
