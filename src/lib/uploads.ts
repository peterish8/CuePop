import fs from "node:fs/promises";
import path from "node:path";
import { getDb } from "@/lib/db";

export const IMAGE_TYPES = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
} as const;

export type SupportedImageType = keyof typeof IMAGE_TYPES;

export function isSupportedImageType(value: string): value is SupportedImageType {
  return Object.prototype.hasOwnProperty.call(IMAGE_TYPES, value);
}

export function hasValidImageSignature(bytes: Uint8Array, type: SupportedImageType) {
  if (type === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return signature.every((value, index) => bytes[index] === value);
  }
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/gif") {
    const header = String.fromCharCode(...bytes.slice(0, 6));
    return header === "GIF87a" || header === "GIF89a";
  }
  if (type === "image/webp") {
    const riff = String.fromCharCode(...bytes.slice(0, 4));
    const webp = String.fromCharCode(...bytes.slice(8, 12));
    return riff === "RIFF" && webp === "WEBP";
  }
  return false;
}

export function storedMediaFilename(url: string | null | undefined) {
  if (!url) return null;
  const match = /^\/api\/media\/([A-Za-z0-9._-]+)$/.exec(url);
  return match?.[1] || null;
}

export async function deleteStoredMedia(url: string | null | undefined) {
  const filename = storedMediaFilename(url);
  if (!filename) return false;

  try {
    await fs.unlink(path.join(process.cwd(), "data", "uploads", filename));
    return true;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return false;
    throw error;
  }
}

/**
 * An uploaded asset may be deliberately reused as the backdrop for many
 * moments. Only remove its file after the final database reference is gone.
 */
export async function deleteStoredMediaIfUnused(url: string | null | undefined) {
  if (!storedMediaFilename(url)) return false;
  const reference = getDb()
    .prepare("SELECT id FROM deck_items WHERE image_url=? OR background_image_url=? LIMIT 1")
    .get(url, url);
  if (reference) return false;
  return deleteStoredMedia(url);
}
