package com.reguflow.ai.extraction.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.reguflow.ai.document.entity.DocumentCategory;
import com.reguflow.ai.extraction.dto.ExtractionDTOs.GeminiRawFieldItem;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GeminiExtractionServiceTest {

    private ObjectMapper objectMapper;
    private GeminiExtractionService serviceWithKey;
    private GeminiExtractionService serviceWithoutKey;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        serviceWithKey = new GeminiExtractionService("test-dummy-api-key", "gemini-1.5-flash", objectMapper);
        serviceWithoutKey = new GeminiExtractionService("", "gemini-1.5-flash", objectMapper);
    }

    @Test
    @DisplayName("1. isConfigured returns true when API key is provided and false when empty")
    void testIsConfigured() {
        assertThat(serviceWithKey.isConfigured()).isTrue();
        assertThat(serviceWithoutKey.isConfigured()).isFalse();
    }

    @Test
    @DisplayName("2. Throws GeminiConfigurationException when calling extract without API key")
    void testMissingApiKeyThrows() {
        assertThatThrownBy(() -> serviceWithoutKey.extractFields(DocumentCategory.FIRE_SAFETY_NOC, "some text", 1))
                .isInstanceOf(GeminiConfigurationException.class)
                .hasMessageContaining("GEMINI_API_KEY");
    }

    @Test
    @DisplayName("3. Successfully parses valid Gemini JSON array output")
    void testParseGeminiResponseArray() {
        String mockGeminiJson = """
        {
          "candidates": [
            {
              "content": {
                "parts": [
                  {
                    "text": "[{\\"fieldName\\":\\"certificateNumber\\",\\"value\\":\\"FS-2025-9981\\",\\"sourcePage\\":1,\\"evidence\\":\\"Certificate No: FS-2025-9981\\",\\"confidence\\":0.95}]"
                  }
                ]
              }
            }
          ]
        }
        """;

        List<GeminiRawFieldItem> fields = serviceWithKey.parseGeminiResponse(mockGeminiJson, DocumentCategory.FIRE_SAFETY_NOC);
        assertThat(fields).hasSize(1);
        assertThat(fields.get(0).getFieldName()).isEqualTo("certificateNumber");
        assertThat(fields.get(0).getValue()).isEqualTo("FS-2025-9981");
        assertThat(fields.get(0).getSourcePage()).isEqualTo(1);
        assertThat(fields.get(0).getEvidence()).isEqualTo("Certificate No: FS-2025-9981");
        assertThat(fields.get(0).getConfidence()).isEqualTo(0.95);
    }

    @Test
    @DisplayName("4. Successfully parses markdown code block formatted Gemini output")
    void testParseMarkdownCodeBlock() {
        String mockGeminiJson = """
        {
          "candidates": [
            {
              "content": {
                "parts": [
                  {
                    "text": "```json\\n[{\\"fieldName\\":\\"documentNumber\\",\\"value\\":\\"REG-4421\\",\\"sourcePage\\":2,\\"evidence\\":\\"Deed No. REG-4421\\",\\"confidence\\":0.9}]\\n```"
                  }
                ]
              }
            }
          ]
        }
        """;

        List<GeminiRawFieldItem> fields = serviceWithKey.parseGeminiResponse(mockGeminiJson, DocumentCategory.LAND_TITLE_DEED);
        assertThat(fields).hasSize(1);
        assertThat(fields.get(0).getFieldName()).isEqualTo("documentNumber");
        assertThat(fields.get(0).getValue()).isEqualTo("REG-4421");
    }

    @Test
    @DisplayName("5. Throws GeminiApiException when candidates are missing in Gemini response")
    void testInvalidApiResponseNoCandidates() {
        String invalidJson = "{\"promptFeedback\": {\"blockReason\": \"SAFETY\"}}";

        assertThatThrownBy(() -> serviceWithKey.parseGeminiResponse(invalidJson, DocumentCategory.FIRE_SAFETY_NOC))
                .isInstanceOf(GeminiApiException.class)
                .hasMessageContaining("no candidates");
    }

    @Test
    @DisplayName("6. Throws GeminiApiException when JSON in content part is malformed")
    void testMalformedJsonContent() {
        String malformedJson = """
        {
          "candidates": [
            {
              "content": {
                "parts": [
                  {
                    "text": "THIS IS NOT VALID JSON AT ALL"
                  }
                ]
              }
            }
          ]
        }
        """;

        assertThatThrownBy(() -> serviceWithKey.parseGeminiResponse(malformedJson, DocumentCategory.FIRE_SAFETY_NOC))
                .isInstanceOf(GeminiApiException.class)
                .hasMessageContaining("Failed to parse Gemini JSON output");
    }
}
