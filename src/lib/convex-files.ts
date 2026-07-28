import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
function client() { const url = process.env.NEXT_PUBLIC_CONVEX_URL; const secret = process.env.CONVEX_SERVER_SECRET; if (!url || !secret) throw new Error("CuePop storage is not configured."); return { convex: new ConvexHttpClient(url), secret }; }
export const convexFiles = {
  async upload(file: File) { const { convex, secret } = client(); const uploadUrl = await convex.mutation(api.files.generateUploadUrl, { serverSecret: secret }); const response = await fetch(uploadUrl, { method: "POST", headers: { "content-type": file.type }, body: file }); if (!response.ok) throw new Error("Image upload did not complete."); const data = await response.json() as { storageId?: string }; if (!data.storageId) throw new Error("Image upload did not return a file reference."); return data.storageId; },
  async url(storageId: string) { const { convex, secret } = client(); return await convex.query(api.files.getUrl, { storageId: storageId as any, serverSecret: secret }); },
};
