package br.com.vertxmidia.crm.modules.upload.infrastructure;

import br.com.vertxmidia.crm.modules.upload.domain.UploadedDocument;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface UploadedDocumentRepository extends JpaRepository<UploadedDocument, UUID>, JpaSpecificationExecutor<UploadedDocument> {
}
