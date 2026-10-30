package com.reguflow.ai.extraction.dto;

import com.reguflow.ai.document.entity.DocumentCategory;
import com.reguflow.ai.extraction.entity.DocumentExtraction;
import com.reguflow.ai.extraction.entity.ExtractedField;
import com.reguflow.ai.extraction.entity.ExtractionStatus;
import com.reguflow.ai.extraction.entity.FieldReviewStatus;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class ExtractionDTOs {

    public static class ExtractionResponse {
        private Long id;
        private Long documentId;
        private Long applicationId;
        private DocumentCategory documentCategory;
        private ExtractionStatus extractionStatus;
        private String modelIdentifier;
        private int version;
        private String documentSha256;
        private List<ExtractedFieldDTO> fields = new ArrayList<>();
        private List<String> warnings = new ArrayList<>();
        private Instant createdAt;
        private Instant updatedAt;

        public ExtractionResponse() {}

        public ExtractionResponse(DocumentExtraction extraction, List<String> warnings) {
            this.id = extraction.getId();
            this.documentId = extraction.getDocumentId();
            this.applicationId = extraction.getApplicationId();
            this.documentCategory = extraction.getDocumentCategory();
            this.extractionStatus = extraction.getExtractionStatus();
            this.modelIdentifier = extraction.getModelIdentifier();
            this.version = extraction.getVersion();
            this.documentSha256 = extraction.getDocumentSha256();
            this.createdAt = extraction.getCreatedAt();
            this.updatedAt = extraction.getUpdatedAt();
            this.warnings = warnings != null ? warnings : new ArrayList<>();

            if (extraction.getFields() != null) {
                for (ExtractedField f : extraction.getFields()) {
                    this.fields.add(new ExtractedFieldDTO(f));
                }
            }
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getDocumentId() { return documentId; }
        public void setDocumentId(Long documentId) { this.documentId = documentId; }
        public Long getApplicationId() { return applicationId; }
        public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }
        public DocumentCategory getDocumentCategory() { return documentCategory; }
        public void setDocumentCategory(DocumentCategory documentCategory) { this.documentCategory = documentCategory; }
        public ExtractionStatus getExtractionStatus() { return extractionStatus; }
        public void setExtractionStatus(ExtractionStatus extractionStatus) { this.extractionStatus = extractionStatus; }
        public String getModelIdentifier() { return modelIdentifier; }
        public void setModelIdentifier(String modelIdentifier) { this.modelIdentifier = modelIdentifier; }
        public int getVersion() { return version; }
        public void setVersion(int version) { this.version = version; }
        public String getDocumentSha256() { return documentSha256; }
        public void setDocumentSha256(String documentSha256) { this.documentSha256 = documentSha256; }
        public List<ExtractedFieldDTO> getFields() { return fields; }
        public void setFields(List<ExtractedFieldDTO> fields) { this.fields = fields; }
        public List<String> getWarnings() { return warnings; }
        public void setWarnings(List<String> warnings) { this.warnings = warnings; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
        public Instant getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class ExtractedFieldDTO {
        private Long id;
        private String fieldName;
        private String fieldValue;
        private String originalValue;
        private Integer sourcePage;
        private String evidenceQuotation;
        private Double confidenceScore;
        private FieldReviewStatus reviewStatus;
        private String reviewedByEmail;
        private Instant reviewedAt;
        private String officerRemarks;

        public ExtractedFieldDTO() {}

        public ExtractedFieldDTO(ExtractedField field) {
            this.id = field.getId();
            this.fieldName = field.getFieldName();
            this.fieldValue = field.getFieldValue();
            this.originalValue = field.getOriginalValue();
            this.sourcePage = field.getSourcePage();
            this.evidenceQuotation = field.getEvidenceQuotation();
            this.confidenceScore = field.getConfidenceScore();
            this.reviewStatus = field.getReviewStatus();
            this.reviewedByEmail = field.getReviewedByEmail();
            this.reviewedAt = field.getReviewedAt();
            this.officerRemarks = field.getOfficerRemarks();
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getFieldName() { return fieldName; }
        public void setFieldName(String fieldName) { this.fieldName = fieldName; }
        public String getFieldValue() { return fieldValue; }
        public void setFieldValue(String fieldValue) { this.fieldValue = fieldValue; }
        public String getOriginalValue() { return originalValue; }
        public void setOriginalValue(String originalValue) { this.originalValue = originalValue; }
        public Integer getSourcePage() { return sourcePage; }
        public void setSourcePage(Integer sourcePage) { this.sourcePage = sourcePage; }
        public String getEvidenceQuotation() { return evidenceQuotation; }
        public void setEvidenceQuotation(String evidenceQuotation) { this.evidenceQuotation = evidenceQuotation; }
        public Double getConfidenceScore() { return confidenceScore; }
        public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }
        public FieldReviewStatus getReviewStatus() { return reviewStatus; }
        public void setReviewStatus(FieldReviewStatus reviewStatus) { this.reviewStatus = reviewStatus; }
        public String getReviewedByEmail() { return reviewedByEmail; }
        public void setReviewedByEmail(String reviewedByEmail) { this.reviewedByEmail = reviewedByEmail; }
        public Instant getReviewedAt() { return reviewedAt; }
        public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }
        public String getOfficerRemarks() { return officerRemarks; }
        public void setOfficerRemarks(String officerRemarks) { this.officerRemarks = officerRemarks; }
    }

    public static class ReviewFieldRequest {
        @NotNull
        private FieldReviewStatus reviewStatus;
        private String updatedValue;
        private String officerRemarks;

        public ReviewFieldRequest() {}

        public ReviewFieldRequest(FieldReviewStatus reviewStatus, String updatedValue, String officerRemarks) {
            this.reviewStatus = reviewStatus;
            this.updatedValue = updatedValue;
            this.officerRemarks = officerRemarks;
        }

        public FieldReviewStatus getReviewStatus() { return reviewStatus; }
        public void setReviewStatus(FieldReviewStatus reviewStatus) { this.reviewStatus = reviewStatus; }
        public String getUpdatedValue() { return updatedValue; }
        public void setUpdatedValue(String updatedValue) { this.updatedValue = updatedValue; }
        public String getOfficerRemarks() { return officerRemarks; }
        public void setOfficerRemarks(String officerRemarks) { this.officerRemarks = officerRemarks; }
    }

    public static class GeminiRawFieldItem {
        private String fieldName;
        private String value;
        private Integer sourcePage;
        private String evidence;
        private Double confidence;

        public GeminiRawFieldItem() {}

        public GeminiRawFieldItem(String fieldName, String value, Integer sourcePage, String evidence, Double confidence) {
            this.fieldName = fieldName;
            this.value = value;
            this.sourcePage = sourcePage;
            this.evidence = evidence;
            this.confidence = confidence;
        }

        public String getFieldName() { return fieldName; }
        public void setFieldName(String fieldName) { this.fieldName = fieldName; }
        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
        public Integer getSourcePage() { return sourcePage; }
        public void setSourcePage(Integer sourcePage) { this.sourcePage = sourcePage; }
        public String getEvidence() { return evidence; }
        public void setEvidence(String evidence) { this.evidence = evidence; }
        public Double getConfidence() { return confidence; }
        public void setConfidence(Double confidence) { this.confidence = confidence; }
    }
}
