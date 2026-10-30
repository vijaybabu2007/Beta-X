package com.reguflow.ai.extraction.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reguflow.ai.application.entity.Application;
import com.reguflow.ai.application.repository.ApplicationRepository;
import com.reguflow.ai.document.entity.Document;
import com.reguflow.ai.document.entity.DocumentCategory;
import com.reguflow.ai.document.entity.DocumentPage;
import com.reguflow.ai.document.repository.DocumentPageRepository;
import com.reguflow.ai.document.repository.DocumentRepository;
import com.reguflow.ai.extraction.dto.ExtractionDTOs.*;
import com.reguflow.ai.extraction.entity.DocumentExtraction;
import com.reguflow.ai.extraction.entity.ExtractedField;
import com.reguflow.ai.extraction.entity.ExtractionStatus;
import com.reguflow.ai.extraction.entity.FieldReviewStatus;
import com.reguflow.ai.extraction.repository.DocumentExtractionRepository;
import com.reguflow.ai.extraction.repository.ExtractedFieldRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class ExtractionService {

    private static final Logger log = LoggerFactory.getLogger(ExtractionService.class);

    private static final Set<DocumentCategory> SUPPORTED_CATEGORIES = EnumSet.of(
            DocumentCategory.FIRE_SAFETY_NOC,
            DocumentCategory.LAND_TITLE_DEED,
            DocumentCategory.BUILDING_COMPLETION_PLAN,
            DocumentCategory.FACULTY_CADRE_LIST,
            DocumentCategory.BARRIER_FREE_PWD_CERT
    );

    private final DocumentRepository documentRepository;
    private final DocumentPageRepository documentPageRepository;
    private final ApplicationRepository applicationRepository;
    private final DocumentExtractionRepository extractionRepository;
    private final ExtractedFieldRepository extractedFieldRepository;
    private final GeminiExtractionService geminiExtractionService;
    private final ObjectMapper objectMapper;

    public ExtractionService(
            DocumentRepository documentRepository,
            DocumentPageRepository documentPageRepository,
            ApplicationRepository applicationRepository,
            DocumentExtractionRepository extractionRepository,
            ExtractedFieldRepository extractedFieldRepository,
            GeminiExtractionService geminiExtractionService,
            ObjectMapper objectMapper) {
        this.documentRepository = documentRepository;
        this.documentPageRepository = documentPageRepository;
        this.applicationRepository = applicationRepository;
        this.extractionRepository = extractionRepository;
        this.extractedFieldRepository = extractedFieldRepository;
        this.geminiExtractionService = geminiExtractionService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ExtractionResponse extractDocument(Long documentId, String currentUserEmail, String currentUserRole) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with ID: " + documentId));

        validateDocumentAccess(document, currentUserEmail, currentUserRole);

        int nextVersion = extractionRepository.findMaxVersionByDocumentId(documentId) + 1;
        List<String> warnings = new ArrayList<>();

        // 1. Check if document category is supported
        if (!SUPPORTED_CATEGORIES.contains(document.getDocumentCategory())) {
            DocumentExtraction extraction = new DocumentExtraction(
                    document.getId(),
                    document.getApplicationId(),
                    document.getDocumentCategory(),
                    ExtractionStatus.UNSUPPORTED_CATEGORY,
                    geminiExtractionService.getModelIdentifier(),
                    nextVersion,
                    document.getSha256Hash()
            );
            warnings.add("Document category '" + document.getDocumentCategory() + "' is not supported for automated Gemini extraction in Phase 4A.");
            saveWarnings(extraction, warnings);
            DocumentExtraction saved = extractionRepository.save(extraction);
            return new ExtractionResponse(saved, warnings);
        }

        // 2. Check if Gemini API is configured
        if (!geminiExtractionService.isConfigured()) {
            DocumentExtraction extraction = new DocumentExtraction(
                    document.getId(),
                    document.getApplicationId(),
                    document.getDocumentCategory(),
                    ExtractionStatus.CONFIG_ERROR,
                    geminiExtractionService.getModelIdentifier(),
                    nextVersion,
                    document.getSha256Hash()
            );
            warnings.add("Gemini API key is not configured. Set the GEMINI_API_KEY environment variable on the server.");
            saveWarnings(extraction, warnings);
            DocumentExtraction saved = extractionRepository.save(extraction);
            return new ExtractionResponse(saved, warnings);
        }

        // 3. Assemble extracted page text from Phase 3
        List<DocumentPage> pages = documentPageRepository.findByDocumentIdOrderByPageNumberAsc(documentId);
        if (pages.isEmpty()) {
            DocumentExtraction extraction = new DocumentExtraction(
                    document.getId(),
                    document.getApplicationId(),
                    document.getDocumentCategory(),
                    ExtractionStatus.FAILED,
                    geminiExtractionService.getModelIdentifier(),
                    nextVersion,
                    document.getSha256Hash()
            );
            warnings.add("No extracted page text found for document ID " + documentId + ". Please upload or re-index the PDF.");
            saveWarnings(extraction, warnings);
            DocumentExtraction saved = extractionRepository.save(extraction);
            return new ExtractionResponse(saved, warnings);
        }

        StringBuilder fullTextBuilder = new StringBuilder();
        for (DocumentPage p : pages) {
            fullTextBuilder.append("--- PAGE ").append(p.getPageNumber()).append(" ---\n");
            fullTextBuilder.append(p.getPageText()).append("\n\n");
        }

        // 4. Call Gemini Extraction Service
        List<GeminiRawFieldItem> rawItems;
        try {
            rawItems = geminiExtractionService.extractFields(
                    document.getDocumentCategory(),
                    fullTextBuilder.toString(),
                    pages.size()
            );
        } catch (Exception e) {
            log.error("Gemini extraction call failed for document ID {}: {}", documentId, e.getMessage());
            DocumentExtraction extraction = new DocumentExtraction(
                    document.getId(),
                    document.getApplicationId(),
                    document.getDocumentCategory(),
                    ExtractionStatus.FAILED,
                    geminiExtractionService.getModelIdentifier(),
                    nextVersion,
                    document.getSha256Hash()
            );
            warnings.add("Gemini extraction failed: " + e.getMessage());
            saveWarnings(extraction, warnings);
            DocumentExtraction saved = extractionRepository.save(extraction);
            return new ExtractionResponse(saved, warnings);
        }

        // 5. Build DocumentExtraction record
        DocumentExtraction extraction = new DocumentExtraction(
                document.getId(),
                document.getApplicationId(),
                document.getDocumentCategory(),
                ExtractionStatus.COMPLETED,
                geminiExtractionService.getModelIdentifier(),
                nextVersion,
                document.getSha256Hash()
        );

        boolean hasFieldWarnings = false;

        for (GeminiRawFieldItem item : rawItems) {
            String fieldName = item.getFieldName();
            String val = item.getValue();
            Integer pageNum = item.getSourcePage();
            String evidence = item.getEvidence();
            Double confidence = item.getConfidence() != null ? item.getConfidence() : 0.85;

            FieldReviewStatus status = FieldReviewStatus.EXTRACTED;

            // Page validation
            if (pageNum == null || pageNum < 1 || pageNum > pages.size()) {
                status = FieldReviewStatus.NEEDS_REVIEW;
                warnings.add("Field '" + fieldName + "' specified invalid page: " + pageNum + " (Document total pages: " + pages.size() + ")");
                hasFieldWarnings = true;
            } else {
                // Evidence citation validation against actual page text
                DocumentPage page = pages.get(pageNum - 1);
                String pageContent = page.getPageText();

                if (evidence == null || evidence.isBlank()) {
                    status = FieldReviewStatus.NEEDS_REVIEW;
                    warnings.add("Field '" + fieldName + "' is missing supporting evidence quotation from page " + pageNum + ".");
                    hasFieldWarnings = true;
                } else if (!isEvidencePresentOnPage(pageContent, evidence)) {
                    status = FieldReviewStatus.NEEDS_REVIEW;
                    warnings.add("Quotation for field '" + fieldName + "' was not found verbatim on page " + pageNum + ".");
                    hasFieldWarnings = true;
                }
            }

            if (val == null || val.isBlank() || "null".equalsIgnoreCase(val.trim())) {
                val = null;
                status = FieldReviewStatus.NEEDS_REVIEW;
            }

            ExtractedField field = new ExtractedField(fieldName, val, pageNum, evidence, confidence, status);
            extraction.addField(field);
        }

        if (hasFieldWarnings) {
            extraction.setExtractionStatus(ExtractionStatus.PARTIALLY_VALIDATED);
        }

        saveWarnings(extraction, warnings);
        DocumentExtraction saved = extractionRepository.save(extraction);
        return new ExtractionResponse(saved, warnings);
    }

    @Transactional(readOnly = true)
    public Optional<ExtractionResponse> getLatestExtraction(Long documentId, String currentUserEmail, String currentUserRole) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with ID: " + documentId));

        validateDocumentAccess(document, currentUserEmail, currentUserRole);

        return extractionRepository.findFirstByDocumentIdOrderByVersionDesc(documentId)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<ExtractionResponse> getExtractionHistory(Long documentId, String currentUserEmail, String currentUserRole) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with ID: " + documentId));

        validateDocumentAccess(document, currentUserEmail, currentUserRole);

        return extractionRepository.findByDocumentIdOrderByVersionDesc(documentId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ExtractedFieldDTO reviewField(Long extractionId, Long fieldId, ReviewFieldRequest request, String reviewerEmail, String reviewerRole) {
        // Enforce Officer-Only permission
        if (!"REVIEWING_OFFICER".equals(reviewerRole) && !"SYSTEM_ADMIN".equals(reviewerRole)) {
            throw new AccessDeniedException("Access denied: Only authorized Reviewing Officers and System Administrators can review or update extracted compliance fields.");
        }

        ExtractedField field = extractedFieldRepository.findByIdAndExtractionId(fieldId, extractionId)
                .orElseThrow(() -> new IllegalArgumentException("Extracted field not found with ID " + fieldId + " in extraction " + extractionId));

        if (request.getUpdatedValue() != null && !request.getUpdatedValue().isBlank()) {
            field.setOriginalValue(field.getFieldValue());
            field.setFieldValue(request.getUpdatedValue());
        }

        field.setReviewStatus(request.getReviewStatus());
        field.setOfficerRemarks(request.getOfficerRemarks());
        field.setReviewedByEmail(reviewerEmail != null ? reviewerEmail : "officer.system@aicte.gov.in");
        field.setReviewedAt(Instant.now());

        ExtractedField saved = extractedFieldRepository.save(field);
        return new ExtractedFieldDTO(saved);
    }

    private void validateDocumentAccess(Document document, String userEmail, String userRole) {
        if ("SYSTEM_ADMIN".equals(userRole) || "REVIEWING_OFFICER".equals(userRole)) {
            return;
        }

        // Institution Admin check
        if (userEmail != null && !userEmail.isBlank()) {
            Application app = applicationRepository.findById(document.getApplicationId()).orElse(null);
            if (app != null && app.getCreatedByEmail() != null && !app.getCreatedByEmail().equalsIgnoreCase(userEmail)) {
                // If demo user is browsing demo applications, allow standard demo user access
                if (!userEmail.contains("admin@apextech.edu.in") && !app.getCreatedByEmail().contains("admin@apextech.edu.in")) {
                    throw new AccessDeniedException("Access denied: You do not have permission to access documents for application " + document.getApplicationId());
                }
            }
        }
    }

    private boolean isEvidencePresentOnPage(String pageText, String evidenceQuotation) {
        if (pageText == null || evidenceQuotation == null) return false;
        String normalizedPage = normalizeText(pageText);
        String normalizedQuote = normalizeText(evidenceQuotation);
        return normalizedPage.contains(normalizedQuote);
    }

    private String normalizeText(String input) {
        return input.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private void saveWarnings(DocumentExtraction extraction, List<String> warnings) {
        try {
            extraction.setWarningsJson(objectMapper.writeValueAsString(warnings));
        } catch (Exception e) {
            extraction.setWarningsJson("[]");
        }
    }

    private ExtractionResponse toResponse(DocumentExtraction extraction) {
        List<String> warnings = new ArrayList<>();
        if (extraction.getWarningsJson() != null && !extraction.getWarningsJson().isBlank()) {
            try {
                warnings = objectMapper.readValue(extraction.getWarningsJson(), new TypeReference<List<String>>() {});
            } catch (Exception ignored) {}
        }
        return new ExtractionResponse(extraction, warnings);
    }
}
