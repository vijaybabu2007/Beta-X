package com.reguflow.ai.document.service;

import com.reguflow.ai.application.entity.Application;
import com.reguflow.ai.application.repository.ApplicationRepository;
import com.reguflow.ai.document.entity.Document;
import com.reguflow.ai.document.entity.DocumentCategory;
import com.reguflow.ai.document.entity.DocumentPage;
import com.reguflow.ai.document.repository.DocumentPageRepository;
import com.reguflow.ai.document.repository.DocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentPageRepository documentPageRepository;
    private final ApplicationRepository applicationRepository;
    private final PdfExtractionService pdfExtractionService;

    private final Path uploadDir = Paths.get("./uploads");

    public DocumentService(
            DocumentRepository documentRepository,
            DocumentPageRepository documentPageRepository,
            ApplicationRepository applicationRepository,
            PdfExtractionService pdfExtractionService) {
        this.documentRepository = documentRepository;
        this.documentPageRepository = documentPageRepository;
        this.applicationRepository = applicationRepository;
        this.pdfExtractionService = pdfExtractionService;

        try {
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload folder", e);
        }
    }

    @Transactional
    public Document uploadDocument(Long applicationId, DocumentCategory category, MultipartFile file) throws IOException {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found: " + applicationId));

        byte[] bytes = file.getBytes();
        String sha256 = pdfExtractionService.computeSha256(bytes);

        // Check for duplicates
        boolean isDuplicate = documentRepository.existsByApplicationIdAndSha256Hash(applicationId, sha256);

        // Generate unique physical file name
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf";
        String storageFileName = UUID.randomUUID() + "_" + originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
        Path targetPath = uploadDir.resolve(storageFileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        Document doc = new Document(
                applicationId,
                category,
                originalFilename,
                targetPath.toAbsolutePath().toString(),
                file.getSize(),
                sha256
        );
        doc.setDuplicateFlag(isDuplicate);

        // Extract with PDFBox 3
        File targetFile = targetPath.toFile();
        PdfExtractionService.ExtractionResult result = pdfExtractionService.extractText(targetFile);
        doc.setPageCount(result.totalPages);
        doc.setExtractionMethod(result.method);

        for (DocumentPage page : result.pages) {
            doc.addPage(page);
        }

        Document saved = documentRepository.save(doc);

        // Decrement missing documents if above 0
        if (application.getMissingDocumentsCount() > 0) {
            application.setMissingDocumentsCount(application.getMissingDocumentsCount() - 1);
            applicationRepository.save(application);
        }

        return saved;
    }

    public List<Document> getDocumentsByApplication(Long applicationId) {
        return documentRepository.findByApplicationIdOrderByUploadedAtDesc(applicationId);
    }

    public List<DocumentPage> getDocumentPages(Long documentId) {
        return documentPageRepository.findByDocumentIdOrderByPageNumberAsc(documentId);
    }

    public Document getDocumentById(Long documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found: " + documentId));
    }
}
