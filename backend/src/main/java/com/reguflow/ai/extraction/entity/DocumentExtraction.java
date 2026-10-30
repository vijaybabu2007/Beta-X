package com.reguflow.ai.extraction.entity;

import com.reguflow.ai.document.entity.DocumentCategory;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "document_extractions")
public class DocumentExtraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long documentId;

    @Column(nullable = false)
    private Long applicationId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentCategory documentCategory;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExtractionStatus extractionStatus;

    @Column(nullable = false)
    private String modelIdentifier;

    @Column(nullable = false)
    private int version = 1;

    @Column(length = 64)
    private String documentSha256;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String warningsJson;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String rawModelResponse;

    @OneToMany(mappedBy = "extraction", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExtractedField> fields = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    private Instant updatedAt = Instant.now();

    public DocumentExtraction() {}

    public DocumentExtraction(Long documentId, Long applicationId, DocumentCategory documentCategory,
                              ExtractionStatus extractionStatus, String modelIdentifier, int version,
                              String documentSha256) {
        this.documentId = documentId;
        this.applicationId = applicationId;
        this.documentCategory = documentCategory;
        this.extractionStatus = extractionStatus;
        this.modelIdentifier = modelIdentifier;
        this.version = version;
        this.documentSha256 = documentSha256;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void addField(ExtractedField field) {
        fields.add(field);
        field.setExtraction(this);
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

    public String getWarningsJson() { return warningsJson; }
    public void setWarningsJson(String warningsJson) { this.warningsJson = warningsJson; }

    public String getRawModelResponse() { return rawModelResponse; }
    public void setRawModelResponse(String rawModelResponse) { this.rawModelResponse = rawModelResponse; }

    public List<ExtractedField> getFields() { return fields; }
    public void setFields(List<ExtractedField> fields) { this.fields = fields; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
