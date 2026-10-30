package com.reguflow.ai.extraction.repository;

import com.reguflow.ai.extraction.entity.ExtractedField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExtractedFieldRepository extends JpaRepository<ExtractedField, Long> {

    Optional<ExtractedField> findByIdAndExtractionId(Long id, Long extractionId);
}
