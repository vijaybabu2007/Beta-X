package com.reguflow.ai.health;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class HealthController {

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "ReguFlow AI Backend");
        response.put("version", "1.0.0");
        response.put("timestamp", Instant.now().toString());
        response.put("environment", activeProfile);
        response.put("engine", "Deterministic Java APH Rules Engine + Apache PDFBox 3");
        response.put("governance", "Advisory Only - Human Review Required");

        Map<String, String> modules = new HashMap<>();
        modules.put("M1_auth", "INITIALIZED");
        modules.put("M2_dashboard", "INITIALIZED");
        modules.put("M3_applications", "INITIALIZED");
        modules.put("M4_document_intelligence", "INITIALIZED");
        modules.put("M5_compliance_engine", "INITIALIZED");
        modules.put("M6_aicte_rag_assistant", "INITIALIZED");
        modules.put("M7_officer_workspace", "INITIALIZED");
        modules.put("M8_audit_notifications", "INITIALIZED");

        response.put("modules", modules);
        return ResponseEntity.ok(response);
    }
}
