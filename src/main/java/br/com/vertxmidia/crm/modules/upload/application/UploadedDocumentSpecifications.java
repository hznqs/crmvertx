package br.com.vertxmidia.crm.modules.upload.application;

import br.com.vertxmidia.crm.modules.upload.domain.UploadedDocument;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

public final class UploadedDocumentSpecifications {

    private UploadedDocumentSpecifications() {
    }

    public static Specification<UploadedDocument> active() {
        return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
    }

    public static Specification<UploadedDocument> entityType(String entityType) {
        return (root, query, cb) -> entityType == null || entityType.isBlank()
                ? cb.conjunction()
                : cb.equal(cb.lower(root.get("entityType")), entityType.trim().toLowerCase());
    }

    public static Specification<UploadedDocument> entityId(UUID entityId) {
        return (root, query, cb) -> entityId == null
                ? cb.conjunction()
                : cb.equal(root.get("entityId"), entityId);
    }

    public static Specification<UploadedDocument> search(String queryText) {
        return (root, query, cb) -> {
            if (queryText == null || queryText.isBlank()) {
                return cb.conjunction();
            }
            String like = "%" + queryText.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("originalFilename")), like),
                    cb.like(cb.lower(root.get("contentType")), like)
            );
        };
    }
}
