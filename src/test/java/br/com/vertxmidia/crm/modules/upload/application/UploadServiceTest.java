package br.com.vertxmidia.crm.modules.upload.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.upload.infrastructure.UploadedDocumentRepository;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.oauth2.jwt.Jwt;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;

class UploadServiceTest {

    @Test
    void rejectsUnsupportedContentTypeBeforeStorageCall() {
        UploadService service = service();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "payload.exe",
                "application/x-msdownload",
                new byte[] { 1, 2, 3 }
        );

        assertThatThrownBy(() -> service.upload(file, jwt(), null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Tipo de arquivo");
    }

    @Test
    void rejectsExtensionThatDoesNotMatchContentType() {
        UploadService service = service();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "contrato.jpg",
                "application/pdf",
                new byte[] { 1, 2, 3 }
        );

        assertThatThrownBy(() -> service.upload(file, jwt(), null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Extensao");
    }

    private UploadService service() {
        return new UploadService(
                mock(UploadedDocumentRepository.class),
                mock(AuditService.class),
                mock(Environment.class)
        );
    }

    private Jwt jwt() {
        return new Jwt(
                "token",
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Map.of("alg", "none"),
                Map.of("sub", UUID.randomUUID().toString())
        );
    }
}
