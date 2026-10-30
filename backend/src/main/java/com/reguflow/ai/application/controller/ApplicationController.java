package com.reguflow.ai.application.controller;

import com.reguflow.ai.application.dto.ApplicationDTOs;
import com.reguflow.ai.application.entity.Application;
import com.reguflow.ai.application.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    public ResponseEntity<List<Application>> getApplications(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        String role = authentication != null && !authentication.getAuthorities().isEmpty()
                ? authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "")
                : "INSTITUTION_ADMIN";

        return ResponseEntity.ok(applicationService.getApplications(email, role));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplicationById(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }

    @PostMapping
    public ResponseEntity<Application> createApplication(
            @Valid @RequestBody ApplicationDTOs.CreateApplicationRequest request,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "admin@apextech.edu.in";
        return ResponseEntity.ok(applicationService.createApplication(request, email));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<Application> submitApplication(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.submitApplication(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Application> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationDTOs.UpdateStatusRequest request) {
        return ResponseEntity.ok(applicationService.updateStatus(id, request));
    }
}
