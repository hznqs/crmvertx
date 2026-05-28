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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.Instant;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
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
            "image/svg+xml",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    private static final Map<String, Set<String>> ALLOWED_EXTENSIONS = Map.of(
            "application/pdf", Set.of("pdf"),
            "image/png", Set.of("png"),
            "image/jpeg", Set.of("jpg", "jpeg"),
            "image/webp", Set.of("webp"),
            "image/svg+xml", Set.of("svg"),
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", Set.of("docx")
    );
    private static final Set<String> FORBIDDEN_SVG_TOKENS = Set.of(
            "<script",
            "javascript:",
            "data:",
            " onload=",
            " onclick=",
            " onerror=",
            " onmouseover=",
            " onfocus=",
            " onbegin=",
            "onactivate=",
            "<foreignobject",
            "<iframe",
            "<object",
            "<embed"
    );
    private static final String LOCAL_BUCKET = "local";

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

        StorageTarget target = storageTarget();
        String originalFilename = sanitizeFilename(file.getOriginalFilename());
        String storagePath = LocalDate.now() + "/" + UUID.randomUUID() + "-" + originalFilename;

        if (target.local()) {
            putLocalObject(storagePath, file);
        } else {
            putObject(target.supabaseUrl(), target.serviceRoleKey(), target.bucket(), storagePath, file);
        }

        UploadedDocument document = new UploadedDocument();
        document.setOriginalFilename(originalFilename);
        document.setStorageBucket(target.bucket());
        document.setStoragePath(storagePath);
        if (!target.local()) {
            document.setPublicUrl(publicUrl(target.supabaseUrl(), target.bucket(), storagePath));
        }
        document.setContentType(detectContentType(file).orElse(file.getContentType()));
        document.setSizeBytes(file.getSize());
        document.setUploadedBy(UUID.fromString(jwt.getSubject()));
        document.setEntityType(normalizeEntityType(entityType));
        document.setEntityId(entityId);

        UploadedDocument saved = repository.save(document);
        if (target.local() && isPublicImage(saved)) {
            saved.setPublicUrl("/api/uploads/" + saved.getId() + "/public");
            saved = repository.save(saved);
        }
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

        if (isLocal(document)) {
            deleteLocalObject(document.getStoragePath());
        } else {
            String supabaseUrl = required("SUPABASE_URL");
            String serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");
            deleteObject(supabaseUrl, serviceRoleKey, document.getStorageBucket(), document.getStoragePath());
        }

        document.setDeletedAt(Instant.now());
        repository.save(document);
        auditService.log("DELETE", "Documento", id);
    }

    @Transactional(readOnly = true)
    public DownloadedDocument download(UUID id) {
        UploadedDocument document = repository.findById(id)
                .filter(item -> item.getDeletedAt() == null)
                .orElseThrow(() -> new EntityNotFoundException("Documento nao encontrado"));

        byte[] content = isLocal(document)
                ? getLocalObject(document.getStoragePath())
                : getObject(required("SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), document.getStorageBucket(), document.getStoragePath());
        return new DownloadedDocument(document.getOriginalFilename(), document.getContentType(), content);
    }

    @Transactional(readOnly = true)
    public DownloadedDocument publicImage(UUID id) {
        UploadedDocument document = repository.findById(id)
                .filter(item -> item.getDeletedAt() == null)
                .filter(this::isPublicImage)
                .orElseThrow(() -> new EntityNotFoundException("Imagem nao encontrada"));

        byte[] content = isLocal(document)
                ? getLocalObject(document.getStoragePath())
                : getObject(required("SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), document.getStorageBucket(), document.getStoragePath());
        return new DownloadedDocument(document.getOriginalFilename(), document.getContentType(), content);
    }

    private void putLocalObject(String storagePath, MultipartFile file) {
        try {
            Path target = resolveLocalPath(storagePath);
            Files.createDirectories(target.getParent());
            try (var input = file.getInputStream()) {
                Files.copy(input, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException ex) {
            throw new IllegalStateException("Nao foi possivel salvar arquivo localmente.", ex);
        }
    }

    private void deleteLocalObject(String storagePath) {
        try {
            Files.deleteIfExists(resolveLocalPath(storagePath));
        } catch (IOException ex) {
            throw new IllegalStateException("Nao foi possivel excluir arquivo local.", ex);
        }
    }

    private byte[] getLocalObject(String storagePath) {
        try {
            return Files.readAllBytes(resolveLocalPath(storagePath));
        } catch (IOException ex) {
            throw new IllegalStateException("Nao foi possivel ler arquivo local.", ex);
        }
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

        String declaredContentType = normalizeContentType(file.getContentType());
        if (!ALLOWED_CONTENT_TYPES.contains(declaredContentType)) {
            throw new IllegalArgumentException("Tipo de arquivo nao permitido");
        }

        String detectedContentType = detectContentType(file)
                .orElseThrow(() -> new IllegalArgumentException("Nao foi possivel validar o conteudo real do arquivo"));
        if (!declaredContentType.equals(detectedContentType)) {
            throw new IllegalArgumentException("Tipo real do arquivo nao corresponde ao tipo informado");
        }

        String extension = extensionOf(file.getOriginalFilename());
        Set<String> allowedExtensions = ALLOWED_EXTENSIONS.get(detectedContentType);
        if (extension.isBlank() || allowedExtensions == null || !allowedExtensions.contains(extension)) {
            throw new IllegalArgumentException("Extensao do arquivo nao corresponde ao tipo permitido");
        }
    }

    private Optional<String> detectContentType(MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            if (startsWith(bytes, new byte[] { 0x25, 0x50, 0x44, 0x46, 0x2D })) {
                return Optional.of("application/pdf");
            }
            if (startsWith(bytes, new byte[] { (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A })) {
                return Optional.of("image/png");
            }
            if (bytes.length >= 3 && bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8 && bytes[2] == (byte) 0xFF) {
                return Optional.of("image/jpeg");
            }
            if (isWebp(bytes)) {
                return Optional.of("image/webp");
            }
            if (startsWith(bytes, new byte[] { 0x50, 0x4B, 0x03, 0x04 })) {
                return Optional.of("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            }
            if (isSafeSvg(bytes)) {
                return Optional.of("image/svg+xml");
            }
            return Optional.empty();
        } catch (IOException ex) {
            throw new IllegalArgumentException("Nao foi possivel ler o arquivo enviado");
        }
    }

    private boolean startsWith(byte[] bytes, byte[] signature) {
        return bytes.length >= signature.length
                && Arrays.equals(Arrays.copyOf(bytes, signature.length), signature);
    }

    private boolean isWebp(byte[] bytes) {
        return bytes.length >= 12
                && new String(bytes, 0, 4, StandardCharsets.US_ASCII).equals("RIFF")
                && new String(bytes, 8, 4, StandardCharsets.US_ASCII).equals("WEBP");
    }

    private boolean isSafeSvg(byte[] bytes) {
        String content = new String(bytes, StandardCharsets.UTF_8).trim().toLowerCase();
        if (!(content.startsWith("<svg") || content.startsWith("<?xml")) || !content.contains("<svg")) {
            return false;
        }
        return FORBIDDEN_SVG_TOKENS.stream().noneMatch(content::contains);
    }

    private String normalizeContentType(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return "";
        }
        return contentType.split(";")[0].trim().toLowerCase();
    }

    private String required(String property) {
        String value = environment.getProperty(property, "");
        if (value.isBlank()) {
            throw new IllegalStateException(property + " nao configurado no backend");
        }
        return value.trim();
    }

    private StorageTarget storageTarget() {
        String supabaseUrl = environment.getProperty("SUPABASE_URL", "");
        String serviceRoleKey = environment.getProperty("SUPABASE_SERVICE_ROLE_KEY", "");
        if (hasText(supabaseUrl) && hasText(serviceRoleKey)) {
            return new StorageTarget(false, supabaseUrl.trim(), serviceRoleKey.trim(), environment.getProperty("SUPABASE_STORAGE_BUCKET", "crm-documents"));
        }
        return new StorageTarget(true, null, null, LOCAL_BUCKET);
    }

    private Path resolveLocalPath(String storagePath) {
        Path root = Paths.get(environment.getProperty("APP_UPLOAD_LOCAL_DIR", "uploads")).toAbsolutePath().normalize();
        Path target = root.resolve(storagePath).normalize();
        if (!target.startsWith(root)) {
            throw new IllegalArgumentException("Caminho de arquivo invalido");
        }
        return target;
    }

    private boolean isLocal(UploadedDocument document) {
        return LOCAL_BUCKET.equals(document.getStorageBucket());
    }

    private boolean isPublicImage(UploadedDocument document) {
        return document.getContentType() != null
                && document.getContentType().startsWith("image/")
                && Set.of("profile", "logo", "organization", "settings").contains(String.valueOf(document.getEntityType()));
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String sanitizeFilename(String filename) {
        String value = filename == null || filename.isBlank() ? "arquivo" : filename;
        String sanitized = value.replaceAll("[^A-Za-z0-9._-]", "-");
        if (sanitized.length() <= 120) {
            return sanitized;
        }
        String extension = extensionOf(sanitized);
        String suffix = extension.isBlank() ? "" : "." + extension;
        int maxBaseLength = Math.max(1, 120 - suffix.length());
        return sanitized.substring(0, maxBaseLength) + suffix;
    }

    private String extensionOf(String filename) {
        if (filename == null || filename.isBlank()) {
            return "";
        }
        String value = filename.trim().toLowerCase();
        int dot = value.lastIndexOf('.');
        if (dot < 0 || dot == value.length() - 1) {
            return "";
        }
        return value.substring(dot + 1);
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

    private record StorageTarget(boolean local, String supabaseUrl, String serviceRoleKey, String bucket) {
    }
}
