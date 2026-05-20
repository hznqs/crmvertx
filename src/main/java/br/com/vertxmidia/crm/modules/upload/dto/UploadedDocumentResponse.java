package br.com.vertxmidia.crm.modules.upload.dto;

import br.com.vertxmidia.crm.modules.upload.domain.UploadedDocument;
import java.time.Instant;
import java.util.UUID;

public record UploadedDocumentResponse(
        UUID id,
        String originalFilename,
        String publicUrl,
        String contentType,
        long sizeBytes,
        UUID uploadedBy,
        String entityType,
        UUID entityId,
        Instant createdAt
) {
    public static UploadedDocumentResponse from(UploadedDocument document) {
        return new UploadedDocumentResponse(
                document.getId(),
                document.getOriginalFilename(),
                document.getPublicUrl(),
                document.getContentType(),
                document.getSizeBytes(),
                document.getUploadedBy(),
                document.getEntityType(),
                document.getEntityId(),
                document.getCreatedAt()
        );
    }
}
