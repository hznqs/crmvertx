import { fetchBackendPage } from "@/lib/api/backend";
import type { UploadedDocument } from "@/lib/types/uploads";

export async function fetchUploadedDocuments() {
  const params = new URLSearchParams();
  params.set("size", "12");
  return fetchBackendPage<UploadedDocument>("/api/uploads", params);
}
