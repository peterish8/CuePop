import { NextResponse } from "next/server";
import { convexFiles } from "@/lib/convex-files";

export async function GET(_: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  try {
    if (parts.length !== 1) return new NextResponse("Not found", { status: 404 });
    const url = await convexFiles.url(parts[0]);
    return url ? NextResponse.redirect(url, { status: 307 }) : new NextResponse("Not found", { status: 404 });
  } catch { return new NextResponse("Not found", { status: 404 }); }
}
