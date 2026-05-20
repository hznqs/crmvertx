package br.com.vertxmidia.crm.modules.upload.dto;

public record DownloadedDocument(
        String filename,
        String contentType,
        byte[] content
) {
}
