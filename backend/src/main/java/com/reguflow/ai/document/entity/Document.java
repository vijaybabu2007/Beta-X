package com.reguflow.ai.document.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long applicationId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentCategory documentCategory;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String storagePath;

    private long fileSizeBytes;

    @Column(nullable = false)
    private String mimeType = "application/pdf";

    @Column(nullable = false, length = 64)
    private String sha256Hash; // For duplicate document detection

    private int pageCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExtractionMethod extractionMethod = ExtractionMethod.PDFBOX_NATIVE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationVerdict verificationVerdict = VerificationVerdict.PENDING;

    private String officerRemarks;

    private boolean duplicateFlag = false;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DocumentPage> pages = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private Instant uploadedAt = Instant.now();

    public Document() {}

    public Document(Long applicationId, DocumentCategory documentCategory, String fileName, String storagePath, long fileSizeBytes, String sha256Hash) {
        this.applicationId = applicationId;
        this.documentCategory = documentCategory;
        this.fileName = fileName;
        this.storagePath = storagePath;
        this.fileSizeBytes = fileSizeBytes;
        this.sha256Hash = sha256Hash;
        this.uploadedAt = Instant.now();
    }

    public void addPage(DocumentPage page) {
        pages.add(page);
        page.setDocument(this);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public DocumentCategory getDocumentCategory() { return documentCategory; }
    public void setDocumentCategory(DocumentCategory documentCategory) { this.documentCategory = documentCategory; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getStoragePath() { return storagePath; }
    public void setStoragePath(String storagePath) { this.storagePath = storagePath; }

    public long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }

    public String getSha256Hash() { return sha256Hash; }
    public void setSha256Hash(String sha256Hash) { this.sha256Hash = sha256Hash; }

    public int getPageCount() { return pageCount; }
    public void setPageCount(int pageCount) { this.pageCount = pageCount; }

    public ExtractionMethod getExtractionMethod() { return extractionMethod; }
    public void setExtractionMethod(ExtractionMethod extractionMethod) { this.extractionMethod = extractionMethod; }

    public VerificationVerdict getVerificationVerdict() { return verificationVerdict; }
    public void setVerificationVerdict(VerificationVerdict verificationVerdict) { this.verificationVerdict = verificationVerdict; }

    public String getOfficerRemarks() { return officerRemarks; }
    public void setOfficerRemarks(String officerRemarks) { this.officerRemarks = officerRemarks; }

    public boolean isDuplicateFlag() { return duplicateFlag; }
    public void setDuplicateFlag(boolean duplicateFlag) { this.duplicateFlag = duplicateFlag; }

    public List<DocumentPage> getPages() { return pages; }
    public void setPages(List<DocumentPage> pages) { this.pages = pages; }

    public Instant getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(Instant uploadedAt) { this.uploadedAt = uploadedAt; }
}
