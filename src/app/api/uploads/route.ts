import { convexFiles } from "@/lib/convex-files";
import { requireUser } from "@/lib/auth";
import { errorResponse, jsonError, jsonOk } from "@/lib/api";
import { hasValidImageSignature, IMAGE_TYPES, isSupportedImageType } from "@/lib/image-validation";

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

    const storageId = await convexFiles.upload(file);
    return jsonOk({ url: `/api/media/${storageId}`, filename: `${Date.now()}.${IMAGE_TYPES[file.type]}` }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
