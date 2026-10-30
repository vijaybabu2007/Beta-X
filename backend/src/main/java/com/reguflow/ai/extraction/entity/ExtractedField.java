package com.reguflow.ai.extraction.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "extracted_fields")
public class ExtractedField {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "extraction_id", nullable = false)
    @JsonIgnore
    private DocumentExtraction extraction;

    @Column(nullable = false)
    private String fieldName;

    @Column(length = 2000)
    private String fieldValue;

    @Column(length = 2000)
    private String originalValue;

    private Integer sourcePage;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String evidenceQuotation;

    private Double confidenceScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FieldReviewStatus reviewStatus = FieldReviewStatus.EXTRACTED;

    private String reviewedByEmail;

    private Instant reviewedAt;

    @Column(length = 2000)
    private String officerRemarks;

    public ExtractedField() {}

    public ExtractedField(String fieldName, String fieldValue, Integer sourcePage, String evidenceQuotation, Double confidenceScore, FieldReviewStatus reviewStatus) {
        this.fieldName = fieldName;
        this.fieldValue = fieldValue;
        this.originalValue = fieldValue;
        this.sourcePage = sourcePage;
        this.evidenceQuotation = evidenceQuotation;
        this.confidenceScore = confidenceScore;
        this.reviewStatus = reviewStatus;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public DocumentExtraction getExtraction() { return extraction; }
    public void setExtraction(DocumentExtraction extraction) { this.extraction = extraction; }

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
