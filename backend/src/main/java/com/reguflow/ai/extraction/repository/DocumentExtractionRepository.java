package com.reguflow.ai.extraction.repository;

import com.reguflow.ai.extraction.entity.DocumentExtraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentExtractionRepository extends JpaRepository<DocumentExtraction, Long> {

    Optional<DocumentExtraction> findFirstByDocumentIdOrderByVersionDesc(Long documentId);

    List<DocumentExtraction> findByDocumentIdOrderByVersionDesc(Long documentId);

    Optional<DocumentExtraction> findFirstByDocumentIdAndDocumentSha256OrderByVersionDesc(Long documentId, String documentSha256);

    @Query("SELECT COALESCE(MAX(e.version), 0) FROM DocumentExtraction e WHERE e.documentId = :documentId")
    int findMaxVersionByDocumentId(@Param("documentId") Long documentId);
}
