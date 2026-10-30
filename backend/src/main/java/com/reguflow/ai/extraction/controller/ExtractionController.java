package com.reguflow.ai.extraction.controller;

import com.reguflow.ai.extraction.dto.ExtractionDTOs.*;
import com.reguflow.ai.extraction.service.ExtractionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class ExtractionController {

    private final ExtractionService extractionService;

    public ExtractionController(ExtractionService extractionService) {
        this.extractionService = extractionService;
    }

    @PostMapping("/documents/{documentId}/extract")
    public ResponseEntity<ExtractionResponse> extractDocument(
            @PathVariable Long documentId,
            Authentication authentication) {
        String userEmail = getUserEmail(authentication);
        String userRole = getUserRole(authentication);

        ExtractionResponse response = extractionService.extractDocument(documentId, userEmail, userRole);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/documents/{documentId}/extraction")
    public ResponseEntity<ExtractionResponse> getLatestExtraction(
            @PathVariable Long documentId,
            Authentication authentication) {
        String userEmail = getUserEmail(authentication);
        String userRole = getUserRole(authentication);

        return extractionService.getLatestExtraction(documentId, userEmail, userRole)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/documents/{documentId}/extraction/history")
    public ResponseEntity<List<ExtractionResponse>> getExtractionHistory(
            @PathVariable Long documentId,
            Authentication authentication) {
        String userEmail = getUserEmail(authentication);
        String userRole = getUserRole(authentication);

        List<ExtractionResponse> history = extractionService.getExtractionHistory(documentId, userEmail, userRole);
        return ResponseEntity.ok(history);
    }

    @PatchMapping("/extractions/{extractionId}/fields/{fieldId}/review")
    public ResponseEntity<ExtractedFieldDTO> reviewField(
            @PathVariable Long extractionId,
            @PathVariable Long fieldId,
            @Valid @RequestBody ReviewFieldRequest request,
            Authentication authentication) {
        String userEmail = getUserEmail(authentication);
        String userRole = getUserRole(authentication);

        ExtractedFieldDTO response = extractionService.reviewField(extractionId, fieldId, request, userEmail, userRole);
        return ResponseEntity.ok(response);
    }

    private String getUserEmail(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            return authentication.getName();
        }
        return "admin@apextech.edu.in"; // Demo fallback if unauthenticated
    }

    private String getUserRole(Authentication authentication) {
        if (authentication != null && authentication.getAuthorities() != null) {
            for (GrantedAuthority ga : authentication.getAuthorities()) {
                String auth = ga.getAuthority();
                if (auth.startsWith("ROLE_")) {
                    return auth.substring(5);
                }
            }
        }
        return "INSTITUTION_ADMIN"; // Default fallback
    }
}
