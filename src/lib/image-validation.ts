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
  if (type === "image/png") return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value);
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/gif") { const header = String.fromCharCode(...bytes.slice(0, 6)); return header === "GIF87a" || header === "GIF89a"; }
  if (type === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}
