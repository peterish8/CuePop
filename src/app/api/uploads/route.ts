import fs from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import { requireUser } from "@/lib/auth";
import { errorResponse, jsonError, jsonOk } from "@/lib/api";
import { hasValidImageSignature, IMAGE_TYPES, isSupportedImageType } from "@/lib/uploads";

export const runtime = "nodejs";
const maxBytes = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    await requireUser();
    const data = await request.formData();
    const file = data.get("file");
    if (!(file instanceof File)) return jsonError("Choose an image to upload.", 422);
    if (!isSupportedImageType(file.type)) return jsonError("Use a PNG, JPEG, WebP or GIF image.", 415);
    if (file.size === 0) return jsonError("The selected image is empty.", 422);
    if (file.size > maxBytes) return jsonError("Images must be smaller than 10 MB.", 413);

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!hasValidImageSignature(bytes, file.type)) {
      return jsonError("The file contents do not match the selected image format.", 415);
    }

    const filename = `${Date.now()}-${nanoid(10)}.${IMAGE_TYPES[file.type]}`;
    const directory = path.join(process.cwd(), "data", "uploads");
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, filename), bytes);
    return jsonOk({ url: `/api/media/${filename}`, filename }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
