package com.reguflow.ai.extraction.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reguflow.ai.application.entity.Application;
import com.reguflow.ai.application.entity.ApplicationType;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExtractionServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private DocumentPageRepository documentPageRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private DocumentExtractionRepository extractionRepository;

    @Mock
    private ExtractedFieldRepository extractedFieldRepository;

    @Mock
    private GeminiExtractionService geminiExtractionService;

    private ObjectMapper objectMapper;
    private ExtractionService extractionService;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        extractionService = new ExtractionService(
                documentRepository,
                documentPageRepository,
                applicationRepository,
                extractionRepository,
                extractedFieldRepository,
                geminiExtractionService,
                objectMapper
        );
    }

    @Test
    @DisplayName("1. Returns CONFIG_ERROR when Gemini API key is missing")
    void testMissingApiKeyReturnsConfigError() {
        Long docId = 1L;
        Document doc = new Document(10L, DocumentCategory.FIRE_SAFETY_NOC, "fire_noc.pdf", "/tmp/fire.pdf", 1024, "hash123");
        doc.setId(docId);

        when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));
        when(geminiExtractionService.isConfigured()).thenReturn(false);
        when(geminiExtractionService.getModelIdentifier()).thenReturn("gemini-1.5-flash");
        when(extractionRepository.findMaxVersionByDocumentId(docId)).thenReturn(0);
        when(extractionRepository.save(any(DocumentExtraction.class))).thenAnswer(i -> i.getArgument(0));

        ExtractionResponse response = extractionService.extractDocument(docId, "officer@aicte.gov.in", "REVIEWING_OFFICER");

        assertThat(response.getExtractionStatus()).isEqualTo(ExtractionStatus.CONFIG_ERROR);
        assertThat(response.getWarnings()).anyMatch(w -> w.contains("GEMINI_API_KEY"));
        verify(geminiExtractionService, never()).extractFields(any(), any(), anyInt());
    }

    @Test
    @DisplayName("2. Returns UNSUPPORTED_CATEGORY for non-statutory categories like AUDITED_FINANCIALS")
    void testUnsupportedCategory() {
        Long docId = 2L;
        Document doc = new Document(10L, DocumentCategory.AUDITED_FINANCIALS, "balance_sheet.pdf", "/tmp/bal.pdf", 2048, "hash456");
        doc.setId(docId);

        when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));
        when(extractionRepository.findMaxVersionByDocumentId(docId)).thenReturn(0);
        when(extractionRepository.save(any(DocumentExtraction.class))).thenAnswer(i -> i.getArgument(0));

        ExtractionResponse response = extractionService.extractDocument(docId, "officer@aicte.gov.in", "REVIEWING_OFFICER");

        assertThat(response.getExtractionStatus()).isEqualTo(ExtractionStatus.UNSUPPORTED_CATEGORY);
        assertThat(response.getWarnings()).anyMatch(w -> w.contains("not supported"));
        verify(geminiExtractionService, never()).extractFields(any(), any(), anyInt());
    }

    @Test
    @DisplayName("3. Enforces institution ownership restrictions")
    void testInstitutionOwnershipAccessDenied() {
        Long docId = 3L;
        Document doc = new Document(10L, DocumentCategory.FIRE_SAFETY_NOC, "fire.pdf", "/tmp/f.pdf", 100, "hash");
        doc.setId(docId);

        Application app = new Application("APP-10", "Other Institute", "AISHE-1", "AICTE-1", ApplicationType.EXTENSION_OF_APPROVAL, "other@college.edu");
        app.setId(10L);

        when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));
        when(applicationRepository.findById(10L)).thenReturn(Optional.of(app));

        assertThatThrownBy(() -> extractionService.extractDocument(docId, "hacker@intruder.edu", "INSTITUTION_ADMIN"))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Access denied");
    }

    @Test
    @DisplayName("4. Successfully extracts and validates evidence matching page text")
    void testSuccessfulExtractionWithVerifiedEvidence() {
        Long docId = 4L;
        Document doc = new Document(10L, DocumentCategory.FIRE_SAFETY_NOC, "fire.pdf", "/tmp/f.pdf", 5000, "hashFire");
        doc.setId(docId);

        DocumentPage p1 = new DocumentPage(1, "The Fire Station Officer certifies that Apex Institute has valid fire safety equipment.", 80, false);
        p1.setId(101L);

        when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));
        when(geminiExtractionService.isConfigured()).thenReturn(true);
        when(geminiExtractionService.getModelIdentifier()).thenReturn("gemini-1.5-flash");
        when(extractionRepository.findMaxVersionByDocumentId(docId)).thenReturn(0);
        when(documentPageRepository.findByDocumentIdOrderByPageNumberAsc(docId)).thenReturn(List.of(p1));

        List<GeminiRawFieldItem> mockItems = List.of(
                new GeminiRawFieldItem("issuingAuthority", "Fire Station Officer", 1, "Fire Station Officer certifies", 0.95),
                new GeminiRawFieldItem("institutionName", "Apex Institute", 1, "certifies that Apex Institute", 0.98)
        );
        when(geminiExtractionService.extractFields(eq(DocumentCategory.FIRE_SAFETY_NOC), anyString(), eq(1))).thenReturn(mockItems);
        when(extractionRepository.save(any(DocumentExtraction.class))).thenAnswer(i -> i.getArgument(0));

        ExtractionResponse response = extractionService.extractDocument(docId, "officer@aicte.gov.in", "REVIEWING_OFFICER");

        assertThat(response.getExtractionStatus()).isEqualTo(ExtractionStatus.COMPLETED);
        assertThat(response.getFields()).hasSize(2);
        assertThat(response.getFields().get(0).getReviewStatus()).isEqualTo(FieldReviewStatus.EXTRACTED);
        assertThat(response.getWarnings()).isEmpty();
    }

    @Test
    @DisplayName("5. Flags NEEDS_REVIEW when evidence quotation is not found on page")
    void testEvidenceMismatchFlagsNeedsReview() {
        Long docId = 5L;
        Document doc = new Document(10L, DocumentCategory.LAND_TITLE_DEED, "deed.pdf", "/tmp/deed.pdf", 5000, "hashDeed");
        doc.setId(docId);

        DocumentPage p1 = new DocumentPage(1, "Survey number 104 situated at Pune.", 40, false);

        when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));
        when(geminiExtractionService.isConfigured()).thenReturn(true);
        when(geminiExtractionService.getModelIdentifier()).thenReturn("gemini-1.5-flash");
        when(extractionRepository.findMaxVersionByDocumentId(docId)).thenReturn(0);
        when(documentPageRepository.findByDocumentIdOrderByPageNumberAsc(docId)).thenReturn(List.of(p1));

        List<GeminiRawFieldItem> mockItems = List.of(
                // Hallucinated quotation not present in page text
                new GeminiRawFieldItem("totalLandArea", "15 Acres", 1, "completely fabricated sentence", 0.8)
        );
        when(geminiExtractionService.extractFields(any(), anyString(), anyInt())).thenReturn(mockItems);
        when(extractionRepository.save(any(DocumentExtraction.class))).thenAnswer(i -> i.getArgument(0));

        ExtractionResponse response = extractionService.extractDocument(docId, "officer@aicte.gov.in", "REVIEWING_OFFICER");

        assertThat(response.getExtractionStatus()).isEqualTo(ExtractionStatus.PARTIALLY_VALIDATED);
        assertThat(response.getFields().get(0).getReviewStatus()).isEqualTo(FieldReviewStatus.NEEDS_REVIEW);
        assertThat(response.getWarnings()).anyMatch(w -> w.contains("not found verbatim"));
    }

    @Test
    @DisplayName("6. Flags NEEDS_REVIEW when Gemini returns an out-of-bounds page number")
    void testInvalidPageNumberFlagsNeedsReview() {
        Long docId = 6L;
        Document doc = new Document(10L, DocumentCategory.BUILDING_COMPLETION_PLAN, "plan.pdf", "/tmp/p.pdf", 5000, "hashP");
        doc.setId(docId);

        DocumentPage p1 = new DocumentPage(1, "Municipal Corporation approved plan.", 40, false);

        when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));
        when(geminiExtractionService.isConfigured()).thenReturn(true);
        when(geminiExtractionService.getModelIdentifier()).thenReturn("gemini-1.5-flash");
        when(extractionRepository.findMaxVersionByDocumentId(docId)).thenReturn(0);
        when(documentPageRepository.findByDocumentIdOrderByPageNumberAsc(docId)).thenReturn(List.of(p1));

        List<GeminiRawFieldItem> mockItems = List.of(
                // Total pages is 1, but Gemini points to page 99
                new GeminiRawFieldItem("approvalNumber", "BLD-409", 99, "Municipal Corporation", 0.8)
        );
        when(geminiExtractionService.extractFields(any(), anyString(), anyInt())).thenReturn(mockItems);
        when(extractionRepository.save(any(DocumentExtraction.class))).thenAnswer(i -> i.getArgument(0));

        ExtractionResponse response = extractionService.extractDocument(docId, "officer@aicte.gov.in", "REVIEWING_OFFICER");

        assertThat(response.getExtractionStatus()).isEqualTo(ExtractionStatus.PARTIALLY_VALIDATED);
        assertThat(response.getFields().get(0).getReviewStatus()).isEqualTo(FieldReviewStatus.NEEDS_REVIEW);
        assertThat(response.getWarnings()).anyMatch(w -> w.contains("invalid page: 99"));
    }

    @Test
    @DisplayName("7. Preserves extraction history with incrementing version numbers")
    void testVersionIncrementPreservesHistory() {
        Long docId = 7L;
        Document doc = new Document(10L, DocumentCategory.FIRE_SAFETY_NOC, "fire.pdf", "/tmp/f.pdf", 5000, "hashFire");
        doc.setId(docId);

        DocumentPage p1 = new DocumentPage(1, "Valid Fire Certificate", 30, false);

        when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));
        when(geminiExtractionService.isConfigured()).thenReturn(true);
        when(extractionRepository.findMaxVersionByDocumentId(docId)).thenReturn(2); // previous max version was 2
        when(documentPageRepository.findByDocumentIdOrderByPageNumberAsc(docId)).thenReturn(List.of(p1));
        when(geminiExtractionService.extractFields(any(), anyString(), anyInt())).thenReturn(List.of());
        when(extractionRepository.save(any(DocumentExtraction.class))).thenAnswer(i -> i.getArgument(0));

        ExtractionResponse response = extractionService.extractDocument(docId, "officer@aicte.gov.in", "REVIEWING_OFFICER");

        assertThat(response.getVersion()).isEqualTo(3); // New run is version 3
    }

    @Test
    @DisplayName("8. Only Reviewing Officers can review/alter extracted fields; Institution Admin is rejected")
    void testOfficerOnlyReviewAuthorization() {
        Long extractionId = 1L;
        Long fieldId = 100L;

        ReviewFieldRequest req = new ReviewFieldRequest(FieldReviewStatus.VERIFIED, "4800 sq.m", "Verified from blueprint");

        // Attempt by institution admin -> must fail
        assertThatThrownBy(() -> extractionService.reviewField(extractionId, fieldId, req, "admin@apextech.edu.in", "INSTITUTION_ADMIN"))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Only authorized Reviewing Officers");

        // Attempt by reviewing officer -> succeeds
        ExtractedField field = new ExtractedField("builtUpArea", "4200 sq.m", 1, "Area: 4200", 0.9, FieldReviewStatus.NEEDS_REVIEW);
        field.setId(fieldId);

        when(extractedFieldRepository.findByIdAndExtractionId(fieldId, extractionId)).thenReturn(Optional.of(field));
        when(extractedFieldRepository.save(any(ExtractedField.class))).thenAnswer(i -> i.getArgument(0));

        ExtractedFieldDTO result = extractionService.reviewField(extractionId, fieldId, req, "officer.mumbai@aicte.gov.in", "REVIEWING_OFFICER");

        assertThat(result.getReviewStatus()).isEqualTo(FieldReviewStatus.VERIFIED);
        assertThat(result.getFieldValue()).isEqualTo("4800 sq.m");
        assertThat(result.getOriginalValue()).isEqualTo("4200 sq.m");
        assertThat(result.getReviewedByEmail()).isEqualTo("officer.mumbai@aicte.gov.in");
        assertThat(result.getOfficerRemarks()).isEqualTo("Verified from blueprint");
        assertThat(result.getReviewedAt()).isNotNull();
    }
}
