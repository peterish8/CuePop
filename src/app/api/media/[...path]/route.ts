import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
const mime: Record<string,string> = { ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".webp":"image/webp", ".gif":"image/gif" };

export async function GET(_: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const filename = path.basename(parts.join("/"));
  const target = path.join(process.cwd(), "data", "uploads", filename);
  try {
    const file = await fs.readFile(target);
    return new NextResponse(file, { headers: { "content-type": mime[path.extname(filename).toLowerCase()] || "application/octet-stream", "cache-control": "public, max-age=31536000, immutable" } });
  } catch { return new NextResponse("Not found", { status: 404 }); }
}
