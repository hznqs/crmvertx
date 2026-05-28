export type UploadedDocument = {
  id: string;
  originalFilename: string;
  publicUrl: string | null;
  contentType: string | null;
  sizeBytes: number;
  uploadedBy: string | null;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
};
