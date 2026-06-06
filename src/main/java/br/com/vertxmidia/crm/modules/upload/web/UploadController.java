package br.com.vertxmidia.crm.modules.upload.web;

import br.com.vertxmidia.crm.modules.upload.application.UploadService;
import br.com.vertxmidia.crm.modules.upload.dto.DownloadedDocument;
import br.com.vertxmidia.crm.modules.upload.dto.UploadedDocumentResponse;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ContentDisposition;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private final UploadService service;

    public UploadController(UploadService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("@crmPermission.canRead(authentication, 'UPLOADS')")
    Page<UploadedDocumentResponse> list(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) UUID entityId,
            @RequestParam(required = false) String q,
            @PageableDefault(size = 25, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return service.list(entityType, entityId, q, pageable);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("@crmPermission.canWrite(authentication, 'UPLOADS')")
    UploadedDocumentResponse upload(
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) UUID entityId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return service.upload(file, jwt, entityType, entityId);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@crmPermission.canManage(authentication, 'UPLOADS')")
    void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("@crmPermission.canRead(authentication, 'UPLOADS')")
    ResponseEntity<byte[]> download(@PathVariable UUID id) {
        DownloadedDocument document = service.download(id);
        return fileResponse(document, true);
    }

    @GetMapping("/{id}/public")
    @PreAuthorize("permitAll()")
    ResponseEntity<byte[]> publicImage(@PathVariable UUID id) {
        DownloadedDocument document = service.publicImage(id);
        return fileResponse(document, false);
    }

    private ResponseEntity<byte[]> fileResponse(DownloadedDocument document, boolean attachment) {
        MediaType mediaType = document.contentType() == null || document.contentType().isBlank()
                ? MediaType.APPLICATION_OCTET_STREAM
                : MediaType.parseMediaType(document.contentType());

        ContentDisposition.Builder disposition = attachment
                ? ContentDisposition.attachment()
                : ContentDisposition.inline();

        return ResponseEntity.ok()
                .contentType(mediaType)
                .contentLength(document.content().length)
                .cacheControl(attachment
                        ? CacheControl.noStore()
                        : CacheControl.maxAge(java.time.Duration.ofHours(24)).cachePublic())
                .header("X-Content-Type-Options", "nosniff")
                .header("Content-Security-Policy", "default-src 'none'; img-src 'self' data:; script-src 'none'; style-src 'none'; object-src 'none'; sandbox")
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition
                        .filename(document.filename(), java.nio.charset.StandardCharsets.UTF_8)
                        .build()
                        .toString())
                .body(document.content());
    }
}
