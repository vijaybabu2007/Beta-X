package com.reguflow.ai.extraction;

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
import com.reguflow.ai.extraction.entity.ExtractionStatus;
import com.reguflow.ai.extraction.entity.FieldReviewStatus;
import com.reguflow.ai.extraction.repository.DocumentExtractionRepository;
import com.reguflow.ai.extraction.service.ExtractionService;
import com.reguflow.ai.extraction.service.GeminiExtractionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
public class Phase4AIntegrationTest {

    @Autowired
    private ExtractionService extractionService;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private DocumentPageRepository documentPageRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private DocumentExtractionRepository extractionRepository;

    @MockBean
    private GeminiExtractionService geminiExtractionService;

    private Application testApp;

    @BeforeEach
    void setupData() {
        testApp = new Application(
                "AICTE-TEST-APP-001",
                "Apex Institute of Technology",
                "C-41290",
                "1-48291039",
                ApplicationType.EXTENSION_OF_APPROVAL,
                "admin@apextech.edu.in"
        );
        testApp = applicationRepository.save(testApp);

        when(geminiExtractionService.isConfigured()).thenReturn(true);
        when(geminiExtractionService.getModelIdentifier()).thenReturn("gemini-1.5-flash");
    }

    @Test
    @DisplayName("End-to-end: Synthetic Fire Safety NOC extraction, page citation verification, and DB persistence")
    void testSyntheticFireSafetyNocExtraction() {
        // 1. Create synthetic Fire Safety NOC PDF document
        Document fireDoc = new Document(
                testApp.getId(),
                DocumentCategory.FIRE_SAFETY_NOC,
                "synthetic_fire_safety_noc.pdf",
                "uploads/synthetic_fire_safety_noc.pdf",
                124000,
                "a1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef"
        );
        fireDoc.setPageCount(2);

        DocumentPage p1 = new DocumentPage(1,
                "GOVERNMENT OF MAHARASHTRA\n" +
                "FIRE AND RESCUE SERVICES DEPARTMENT\n" +
                "Certificate No: CFO/MH/2025/FS-8910\n" +
                "Date of Issue: 15-01-2025\n" +
                "This is to certify that the institutional building premises of Apex Institute of Technology, Survey No. 42, Hinjawadi Pune 411057 has complied with National Building Code Part IV norms.",
                298, false);

        DocumentPage p2 = new DocumentPage(2,
                "This Fire Safety NOC is valid up to: 14-01-2028.\n" +
                "Status: Satisfactory and fully functional fire hydrants and alarms.\n" +
                "Issued by: Chief Fire Officer, Western Command.",
                185, false);

        fireDoc.addPage(p1);
        fireDoc.addPage(p2);
        fireDoc = documentRepository.save(fireDoc);

        // 2. Mock Gemini response with evidence quotes from the actual pages
        List<GeminiRawFieldItem> mockGeminiOutput = List.of(
                new GeminiRawFieldItem("certificateNumber", "CFO/MH/2025/FS-8910", 1, "Certificate No: CFO/MH/2025/FS-8910", 0.98),
                new GeminiRawFieldItem("issuingAuthority", "Chief Fire Officer, Western Command", 2, "Issued by: Chief Fire Officer, Western Command.", 0.95),
                new GeminiRawFieldItem("institutionName", "Apex Institute of Technology", 1, "premises of Apex Institute of Technology", 0.99),
                new GeminiRawFieldItem("issueDate", "15-01-2025", 1, "Date of Issue: 15-01-2025", 0.97),
                new GeminiRawFieldItem("expiryDate", "14-01-2028", 2, "valid up to: 14-01-2028", 0.96),
                new GeminiRawFieldItem("fireSafetyStatus", "Satisfactory", 2, "Status: Satisfactory and fully functional", 0.92)
        );

        when(geminiExtractionService.extractFields(eq(DocumentCategory.FIRE_SAFETY_NOC), anyString(), eq(2)))
                .thenReturn(mockGeminiOutput);

        // 3. Trigger extraction
        ExtractionResponse response = extractionService.extractDocument(fireDoc.getId(), "admin@apextech.edu.in", "INSTITUTION_ADMIN");

        // 4. Assert response and database persistence
        assertThat(response).isNotNull();
        assertThat(response.getExtractionStatus()).isEqualTo(ExtractionStatus.COMPLETED);
        assertThat(response.getFields()).hasSize(6);
        assertThat(response.getWarnings()).isEmpty();

        // Verify each field is EXTRACTED with page citation
        for (ExtractedFieldDTO f : response.getFields()) {
            assertThat(f.getReviewStatus()).isEqualTo(FieldReviewStatus.EXTRACTED);
            assertThat(f.getSourcePage()).isBetween(1, 2);
            assertThat(f.getEvidenceQuotation()).isNotBlank();
        }

        // Verify persisted in Database
        DocumentExtraction persisted = extractionRepository.findFirstByDocumentIdOrderByVersionDesc(fireDoc.getId()).orElse(null);
        assertThat(persisted).isNotNull();
        assertThat(persisted.getVersion()).isEqualTo(1);
        assertThat(persisted.getFields()).hasSize(6);
    }

    @Test
    @DisplayName("End-to-end: Synthetic Land Title Deed with quotation mismatch detection and Officer Review workflow")
    void testSyntheticLandTitleDeedAndOfficerReview() {
        // 1. Create synthetic Land Title Deed
        Document landDoc = new Document(
                testApp.getId(),
                DocumentCategory.LAND_TITLE_DEED,
                "synthetic_land_title_deed.pdf",
                "uploads/synthetic_land_title_deed.pdf",
                256000,
                "b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef12"
        );
        landDoc.setPageCount(1);

        DocumentPage p1 = new DocumentPage(1,
                "SUB-REGISTRAR OFFICE PUNE\n" +
                "Registered Sale Deed No: 4892/2018\n" +
                "Purchaser / Landowner: Apex Education Society\n" +
                "Survey Number: 108/2A\n" +
                "Total Land Area: 7.50 Acres (contiguous)\n" +
                "Location: Mauje Hinjawadi, Taluka Mulshi, District Pune.",
                238, false);

        landDoc.addPage(p1);
        landDoc = documentRepository.save(landDoc);

        // 2. Mock Gemini response with one valid field and one field with a missing/mismatching quotation
        List<GeminiRawFieldItem> mockGeminiOutput = List.of(
                new GeminiRawFieldItem("documentNumber", "4892/2018", 1, "Registered Sale Deed No: 4892/2018", 0.99),
                new GeminiRawFieldItem("totalLandArea", "7.50 Acres", 1, "Total Land Area: 7.50 Acres", 0.98),
                new GeminiRawFieldItem("surveyNumber", "108/2A", 1, "Fabricated quotation that does not exist on page 1", 0.70)
        );

        when(geminiExtractionService.extractFields(eq(DocumentCategory.LAND_TITLE_DEED), anyString(), eq(1)))
                .thenReturn(mockGeminiOutput);

        // 3. Trigger extraction
        ExtractionResponse response = extractionService.extractDocument(landDoc.getId(), "admin@apextech.edu.in", "INSTITUTION_ADMIN");

        // 4. Assert that quotation mismatch was caught and flagged NEEDS_REVIEW
        assertThat(response.getExtractionStatus()).isEqualTo(ExtractionStatus.PARTIALLY_VALIDATED);
        assertThat(response.getWarnings()).anyMatch(w -> w.contains("was not found verbatim on page 1"));

        ExtractedFieldDTO mismatchField = response.getFields().stream()
                .filter(f -> "surveyNumber".equals(f.getFieldName()))
                .findFirst()
                .orElseThrow();
        assertThat(mismatchField.getReviewStatus()).isEqualTo(FieldReviewStatus.NEEDS_REVIEW);

        // 5. Test Officer Review workflow on the flagged field
        ReviewFieldRequest reviewReq = new ReviewFieldRequest(
                FieldReviewStatus.VERIFIED,
                "108/2A (Verified from registry seals)",
                "Officer examined Pune Sub-Registrar seal on page 1; confirmed survey 108/2A."
        );

        // Institution Admin attempting to review must be rejected
        assertThatThrownBy(() -> extractionService.reviewField(
                response.getId(),
                mismatchField.getId(),
                reviewReq,
                "admin@apextech.edu.in",
                "INSTITUTION_ADMIN"
        )).isInstanceOf(AccessDeniedException.class);

        // Reviewing Officer reviewing the field succeeds
        ExtractedFieldDTO reviewed = extractionService.reviewField(
                response.getId(),
                mismatchField.getId(),
                reviewReq,
                "officer.mumbai@aicte.gov.in",
                "REVIEWING_OFFICER"
        );

        assertThat(reviewed.getReviewStatus()).isEqualTo(FieldReviewStatus.VERIFIED);
        assertThat(reviewed.getFieldValue()).isEqualTo("108/2A (Verified from registry seals)");
        assertThat(reviewed.getOriginalValue()).isEqualTo("108/2A");
        assertThat(reviewed.getReviewedByEmail()).isEqualTo("officer.mumbai@aicte.gov.in");
        assertThat(reviewed.getOfficerRemarks()).contains("Officer examined Pune Sub-Registrar seal");
    }

    @Test
    @DisplayName("Verify application starts and functions cleanly without GEMINI_API_KEY")
    void testStartupWithoutGeminiApiKey() {
        when(geminiExtractionService.isConfigured()).thenReturn(false);

        Document doc = new Document(
                testApp.getId(),
                DocumentCategory.BUILDING_COMPLETION_PLAN,
                "building_plan.pdf",
                "uploads/building_plan.pdf",
                50000,
                "c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef1234"
        );
        doc = documentRepository.save(doc);

        ExtractionResponse response = extractionService.extractDocument(doc.getId(), "officer@aicte.gov.in", "REVIEWING_OFFICER");

        assertThat(response.getExtractionStatus()).isEqualTo(ExtractionStatus.CONFIG_ERROR);
        assertThat(response.getWarnings()).anyMatch(w -> w.contains("GEMINI_API_KEY"));
    }
}
