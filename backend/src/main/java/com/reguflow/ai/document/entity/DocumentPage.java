package com.reguflow.ai.document.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "document_pages")
public class DocumentPage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    @JsonIgnore
    private Document document;

    @Column(nullable = false)
    private int pageNumber;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String pageText;

    private int characterCount;

    private boolean ocrApplied = false;

    public DocumentPage() {}

    public DocumentPage(int pageNumber, String pageText, int characterCount, boolean ocrApplied) {
        this.pageNumber = pageNumber;
        this.pageText = pageText;
        this.characterCount = characterCount;
        this.ocrApplied = ocrApplied;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Document getDocument() { return document; }
    public void setDocument(Document document) { this.document = document; }

    public int getPageNumber() { return pageNumber; }
    public void setPageNumber(int pageNumber) { this.pageNumber = pageNumber; }

    public String getPageText() { return pageText; }
    public void setPageText(String pageText) { this.pageText = pageText; }

    public int getCharacterCount() { return characterCount; }
    public void setCharacterCount(int characterCount) { this.characterCount = characterCount; }

    public boolean isOcrApplied() { return ocrApplied; }
    public void setOcrApplied(boolean ocrApplied) { this.ocrApplied = ocrApplied; }
}
