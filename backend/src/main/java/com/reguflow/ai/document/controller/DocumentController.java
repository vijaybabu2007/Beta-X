package com.reguflow.ai.document.controller;

import com.reguflow.ai.document.entity.Document;
import com.reguflow.ai.document.entity.DocumentCategory;
import com.reguflow.ai.document.entity.DocumentPage;
import com.reguflow.ai.document.service.DocumentService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Document> uploadDocument(
            @RequestParam("applicationId") Long applicationId,
            @RequestParam("documentCategory") DocumentCategory documentCategory,
            @RequestParam("file") MultipartFile file) throws IOException {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(documentService.uploadDocument(applicationId, documentCategory, file));
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<List<Document>> getApplicationDocuments(@PathVariable Long applicationId) {
        return ResponseEntity.ok(documentService.getDocumentsByApplication(applicationId));
    }

    @GetMapping("/{documentId}/pages")
    public ResponseEntity<List<DocumentPage>> getDocumentPages(@PathVariable Long documentId) {
        return ResponseEntity.ok(documentService.getDocumentPages(documentId));
    }

    @GetMapping("/{documentId}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long documentId) {
        Document doc = documentService.getDocumentById(documentId);
        File file = new File(doc.getStoragePath());
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new FileSystemResource(file);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getFileName() + "\"")
                .body(resource);
    }
}
