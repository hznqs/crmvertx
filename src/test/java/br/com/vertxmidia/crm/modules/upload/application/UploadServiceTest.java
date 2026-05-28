package br.com.vertxmidia.crm.modules.upload.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.upload.domain.UploadedDocument;
import br.com.vertxmidia.crm.modules.upload.infrastructure.UploadedDocumentRepository;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

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
                pdf()
        );

        assertThatThrownBy(() -> service.upload(file, jwt(), null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Extensao");
    }

    @Test
    void rejectsFakeMimeContent() {
        UploadService service = service();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "logo.png",
                "image/png",
                "<script>alert(1)</script>".getBytes(java.nio.charset.StandardCharsets.UTF_8)
        );

        assertThatThrownBy(() -> service.upload(file, jwt(), null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("conteudo real");
    }

    @Test
    void rejectsUnsafeSvg() {
        UploadService service = service();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "logo.svg",
                "image/svg+xml",
                "<svg xmlns=\"http://www.w3.org/2000/svg\"><script>alert(1)</script></svg>".getBytes(java.nio.charset.StandardCharsets.UTF_8)
        );

        assertThatThrownBy(() -> service.upload(file, jwt(), null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("conteudo real");
    }

    @Test
    void storesProfileImagesLocallyWhenSupabaseIsNotConfigured() throws Exception {
        UploadedDocumentRepository repository = mock(UploadedDocumentRepository.class);
        Environment environment = mock(Environment.class);
        Path uploadRoot = Files.createTempDirectory("vertx-upload-test");
        UUID documentId = UUID.randomUUID();

        when(environment.getProperty("SUPABASE_URL", "")).thenReturn("");
        when(environment.getProperty("SUPABASE_SERVICE_ROLE_KEY", "")).thenReturn("");
        when(environment.getProperty("APP_UPLOAD_LOCAL_DIR", "uploads")).thenReturn(uploadRoot.toString());
        when(repository.save(org.mockito.ArgumentMatchers.any(UploadedDocument.class))).thenAnswer(invocation -> {
            UploadedDocument document = invocation.getArgument(0);
            if (document.getId() == null) {
                ReflectionTestUtils.setField(document, "id", documentId);
            }
            return document;
        });
        when(repository.findById(documentId)).thenAnswer(invocation -> {
            UploadedDocument document = new UploadedDocument();
            ReflectionTestUtils.setField(document, "id", documentId);
            document.setOriginalFilename("logo.png");
            document.setStorageBucket("local");
            document.setStoragePath(Files.walk(uploadRoot)
                    .filter(Files::isRegularFile)
                    .findFirst()
                    .orElseThrow()
                    .toAbsolutePath()
                    .normalize()
                    .toString()
                    .replace(uploadRoot.toAbsolutePath().normalize().toString() + java.io.File.separator, "")
                    .replace("\\", "/"));
            document.setContentType("image/png");
            document.setEntityType("profile");
            ReflectionTestUtils.setField(document, "createdAt", Instant.now());
            return Optional.of(document);
        });

        UploadService service = new UploadService(repository, mock(AuditService.class), environment);
        MockMultipartFile file = new MockMultipartFile("file", "logo.png", "image/png", png());

        var response = service.upload(file, jwt(), "profile", UUID.randomUUID());
        var publicImage = service.publicImage(response.id());

        assertThat(response.publicUrl()).isEqualTo("/api/uploads/" + documentId + "/public");
        assertThat(publicImage.contentType()).isEqualTo("image/png");
        assertThat(publicImage.content()).isNotEmpty();
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

    private byte[] png() {
        return java.util.Base64.getDecoder().decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=");
    }

    private byte[] pdf() {
        return "%PDF-1.4\n%test".getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }
}
