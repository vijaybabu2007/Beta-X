package com.reguflow.ai.document.repository;

import com.reguflow.ai.document.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByApplicationIdOrderByUploadedAtDesc(Long applicationId);
    Optional<Document> findBySha256Hash(String sha256Hash);
    boolean existsByApplicationIdAndSha256Hash(Long applicationId, String sha256Hash);
}
