package br.com.vertxmidia.crm.modules.upload.application;

import br.com.vertxmidia.crm.modules.audit.application.AuditService;
import br.com.vertxmidia.crm.modules.upload.domain.UploadedDocument;
import br.com.vertxmidia.crm.modules.upload.dto.DownloadedDocument;
import br.com.vertxmidia.crm.modules.upload.dto.UploadedDocumentResponse;
import br.com.vertxmidia.crm.modules.upload.infrastructure.UploadedDocumentRepository;
import jakarta.persistence.EntityNotFoundException;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import org.springframework.core.env.Environment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UploadService {

    private static final long MAX_UPLOAD_SIZE = 15 * 1024 * 1024;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/webp",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private final UploadedDocumentRepository repository;
    private final AuditService auditService;
    private final Environment environment;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public UploadService(UploadedDocumentRepository repository, AuditService auditService, Environment environment) {
        this.repository = repository;
        this.auditService = auditService;
        this.environment = environment;
    }

    @Transactional
    public UploadedDocumentResponse upload(MultipartFile file, Jwt jwt, String entityType, UUID entityId) {
        validate(file);

        String supabaseUrl = required("SUPABASE_URL");
        String serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");
        String bucket = environment.getProperty("SUPABASE_STORAGE_BUCKET", "crm-documents");
        String originalFilename = sanitizeFilename(file.getOriginalFilename());
        String storagePath = LocalDate.now() + "/" + UUID.randomUUID() + "-" + originalFilename;

        putObject(supabaseUrl, serviceRoleKey, bucket, storagePath, file);

        UploadedDocument document = new UploadedDocument();
        document.setOriginalFilename(originalFilename);
        document.setStorageBucket(bucket);
        document.setStoragePath(storagePath);
        document.setPublicUrl(publicUrl(supabaseUrl, bucket, storagePath));
        document.setContentType(file.getContentType());
        document.setSizeBytes(file.getSize());
        document.setUploadedBy(UUID.fromString(jwt.getSubject()));
        document.setEntityType(normalizeEntityType(entityType));
        document.setEntityId(entityId);

        UploadedDocument saved = repository.save(document);
        auditService.log("UPLOAD", "Documento", saved.getId());
        return UploadedDocumentResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<UploadedDocumentResponse> list(String entityType, UUID entityId, String search, Pageable pageable) {
        Specification<UploadedDocument> spec = UploadedDocumentSpecifications.active()
                .and(UploadedDocumentSpecifications.entityType(entityType))
                .and(UploadedDocumentSpecifications.entityId(entityId))
                .and(UploadedDocumentSpecifications.search(search));
        return repository.findAll(spec, pageable).map(UploadedDocumentResponse::from);
    }

    @Transactional
    public void delete(UUID id) {
        UploadedDocument document = repository.findById(id)
                .filter(item -> item.getDeletedAt() == null)
                .orElseThrow(() -> new EntityNotFoundException("Documento nao encontrado"));

        String supabaseUrl = required("SUPABASE_URL");
        String serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");
        deleteObject(supabaseUrl, serviceRoleKey, document.getStorageBucket(), document.getStoragePath());

        document.setDeletedAt(Instant.now());
        repository.save(document);
        auditService.log("DELETE", "Documento", id);
    }

    @Transactional(readOnly = true)
    public DownloadedDocument download(UUID id) {
        UploadedDocument document = repository.findById(id)
                .filter(item -> item.getDeletedAt() == null)
                .orElseThrow(() -> new EntityNotFoundException("Documento nao encontrado"));

        String supabaseUrl = required("SUPABASE_URL");
        String serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");
        byte[] content = getObject(supabaseUrl, serviceRoleKey, document.getStorageBucket(), document.getStoragePath());
        return new DownloadedDocument(document.getOriginalFilename(), document.getContentType(), content);
    }

    private void putObject(String supabaseUrl, String serviceRoleKey, String bucket, String storagePath, MultipartFile file) {
        try {
            URI uri = URI.create(supabaseUrl + "/storage/v1/object/" + encodePath(bucket + "/" + storagePath));
            HttpRequest request = HttpRequest.newBuilder(uri)
                    .header("Authorization", "Bearer " + serviceRoleKey)
                    .header("apikey", serviceRoleKey)
                    .header("Content-Type", file.getContentType() == null ? "application/octet-stream" : file.getContentType())
                    .header("x-upsert", "false")
                    .PUT(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("Falha ao enviar arquivo para o storage.");
            }
        } catch (IOException ex) {
            throw new IllegalStateException("Nao foi possivel ler o arquivo enviado.", ex);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Upload interrompido.", ex);
        }
    }

    private void deleteObject(String supabaseUrl, String serviceRoleKey, String bucket, String storagePath) {
        try {
            URI uri = URI.create(supabaseUrl + "/storage/v1/object/" + encodePath(bucket + "/" + storagePath));
            HttpRequest request = HttpRequest.newBuilder(uri)
                    .header("Authorization", "Bearer " + serviceRoleKey)
                    .header("apikey", serviceRoleKey)
                    .DELETE()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("Falha ao excluir arquivo do storage.");
            }
        } catch (IOException ex) {
            throw new IllegalStateException("Nao foi possivel excluir o arquivo enviado.", ex);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Exclusao de arquivo interrompida.", ex);
        }
    }

    private byte[] getObject(String supabaseUrl, String serviceRoleKey, String bucket, String storagePath) {
        try {
            URI uri = URI.create(supabaseUrl + "/storage/v1/object/" + encodePath(bucket + "/" + storagePath));
            HttpRequest request = HttpRequest.newBuilder(uri)
                    .header("Authorization", "Bearer " + serviceRoleKey)
                    .header("apikey", serviceRoleKey)
                    .GET()
                    .build();

            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("Falha ao baixar arquivo do storage.");
            }
            return response.body();
        } catch (IOException ex) {
            throw new IllegalStateException("Nao foi possivel baixar o arquivo.", ex);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Download interrompido.", ex);
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo obrigatorio");
        }
        if (file.getSize() > MAX_UPLOAD_SIZE) {
            throw new IllegalArgumentException("Arquivo excede o limite de 15MB");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Tipo de arquivo nao permitido");
        }
    }

    private String required(String property) {
        String value = environment.getProperty(property, "");
        if (value.isBlank()) {
            throw new IllegalStateException(property + " nao configurado no backend");
        }
        return value.trim();
    }

    private String sanitizeFilename(String filename) {
        String value = filename == null || filename.isBlank() ? "arquivo" : filename;
        return value.replaceAll("[^A-Za-z0-9._-]", "-");
    }

    private String normalizeEntityType(String entityType) {
        if (entityType == null || entityType.isBlank()) {
            return null;
        }
        return entityType.trim().toLowerCase().replaceAll("[^a-z0-9_-]", "");
    }

    private String publicUrl(String supabaseUrl, String bucket, String storagePath) {
        return supabaseUrl + "/storage/v1/object/public/" + encodePath(bucket + "/" + storagePath);
    }

    private String encodePath(String path) {
        return URLEncoder.encode(path, StandardCharsets.UTF_8).replace("+", "%20").replace("%2F", "/");
    }
}
