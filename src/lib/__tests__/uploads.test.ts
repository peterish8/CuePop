import { describe, expect, it } from "vitest";
import { hasValidImageSignature, storedMediaFilename } from "@/lib/uploads";

describe("image upload signatures", () => {
  it("accepts known image headers", () => {
    expect(hasValidImageSignature(new Uint8Array([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]), "image/png")).toBe(true);
    expect(hasValidImageSignature(new Uint8Array([0xff,0xd8,0xff,0xdb]), "image/jpeg")).toBe(true);
    expect(hasValidImageSignature(new TextEncoder().encode("GIF89a"), "image/gif")).toBe(true);
    expect(hasValidImageSignature(new TextEncoder().encode("RIFF1234WEBP"), "image/webp")).toBe(true);
  });

  it("rejects spoofed files", () => {
    expect(hasValidImageSignature(new TextEncoder().encode("not an image"), "image/png")).toBe(false);
    expect(hasValidImageSignature(new TextEncoder().encode("<svg></svg>"), "image/jpeg")).toBe(false);
  });

  it("only recognizes generated local media URLs for cleanup", () => {
    expect(storedMediaFilename("/api/media/123-abc.png")).toBe("123-abc.png");
    expect(storedMediaFilename("/art/demo-slide-1.svg")).toBeNull();
    expect(storedMediaFilename("/api/media/../../secret")).toBeNull();
  });
});
