# ReguFlow AI — Institutional Compliance Readiness & Review Platform
> **Smart India Hackathon 2026** | **Problem Statement SIH26262**: Integrated AICTE Approval Workflow Automation, Compliance Monitoring and Alert Management System.

---

## 1. Overview & Vision

**ReguFlow AI** is an intelligent, document-grounded compliance readiness checker and human-led review workspace for technical and higher education institutions applying for AICTE approvals.

### Core Governance Principles:
- **Human-in-the-Loop Decisioning**: ReguFlow AI **never independently approves or rejects an institution**. All AI findings are strictly *advisory* and require formal review by an authorized Reviewing Officer.
- **Deterministic Compliance Scoring**: Key regulatory calculations (Faculty-Student Ratio, Cadre Ratio, Built-up area per intake, Fire NOC validity) are computed using **deterministic Java 21 algorithms** derived from the official AICTE Approval Process Handbook (APH).
- **Evidence-Grounded RAG with Page-Level Citations**: All extracted facts and handbook queries reference specific source document page numbers. The system explicitly refuses to hallucinate when relevant evidence is unavailable.

---

## 2. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Axios, Lucide React, Recharts
- **Backend**: Java 21 LTS (Eclipse Adoptium/Temurin), Spring Boot 3.3.4, Spring Web, Spring Security, Spring Data JPA, JWT Authentication, Apache Maven 3.9.9
- **Database**: PostgreSQL 15+ (with in-memory H2 profile for rapid offline testing)
- **Document Processing**: Apache PDFBox 3.0.3 + Google Cloud Document AI OCR fallback
- **AI Engine**: Google Gemini Developer API (Structured JSON output + RAG Handbook Assistant)
- **Deployment**: Vercel (Frontend) + Google Cloud Run (Containerized Spring Boot)

---

## 3. Project Structure

```
AICTE-SmartApprove/
├── frontend/                     # React + Vite + Tailwind CSS Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/           # GovHeader, Sidebar, Navigation
│   │   │   └── dashboard/        # Institution, Officer, and Admin Dashboards
│   │   ├── types/                # TypeScript data models & RBAC roles
│   │   ├── App.tsx               # Main application shell with health polling
│   │   └── index.css             # Government enterprise design tokens
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                      # Spring Boot 3 + Java 21 Application
│   ├── src/main/java/com/reguflow/ai/
│   │   ├── ReguFlowApplication.java  # Main application entry point
│   │   ├── config/               # SecurityConfig, CORS, JWT
│   │   └── health/               # HealthController (/api/v1/health)
│   ├── src/main/resources/
│   │   ├── application.yml       # Base configuration
│   │   ├── application-dev.yml   # Development profile (In-memory H2)
│   │   └── application-postgres.yml # Production PostgreSQL profile
│   ├── pom.xml                   # Maven dependencies
│   └── mvnw.cmd                  # Maven wrapper
│
├── tools/                        # Portable tools (Maven 3.9.9)
├── .env.example                  # Environment configuration template
└── README.md                     # Documentation
```

---

## 4. User Roles & Access Control

1. **Institution Administrator**: Submits applications, uploads mandatory compliance PDFs, views automated readiness scorecards, and addresses clarification notices.
2. **Reviewing Officer**: Inspects assigned institution applications, verifies extracted facts against original PDF citations, accepts or overrides advisory findings, and records formal review verdicts.
3. **System Administrator**: Oversees system telemetry, monitors the immutable audit log, and manages APH regulatory checklist rules.

---

## 5. Getting Started (Phase 1 Execution)

### Prerequisites:
- Node.js (v18+)
- Java 21 LTS

### 1. Running the Frontend:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at: `http://localhost:5173`*

### 2. Running the Backend:
```bash
cd backend
# Set JAVA_HOME if not in global path:
$env:JAVA_HOME = "C:\Users\VIJAY\.p2\pool\plugins\org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64_21.0.12.v20260801-1229\jre"
.\mvnw.cmd spring-boot:run
```
*Backend runs at: `http://localhost:8080`*  
*Health Check endpoint: `http://localhost:8080/api/v1/health`*

---

## 6. Implementation Roadmap

- [x] **Phase 1**: Architecture, folder separation, frontend enterprise UI skeleton, backend Spring Boot 3 skeleton, database configuration, health verification.
- [x] **Phase 2**: JPA entities, JWT authentication, user roles, application management REST APIs and 4-step intake wizard.
- [x] **Phase 3**: PDF upload pipeline, Apache PDFBox 3 extraction, page-level evidence, duplicate SHA-256 detection and DocumentLocker UI.
- [x] **Phase 4A**: Google Gemini Developer API integration, structured regulatory document extraction, page citation verification, versioned storage, and officer review workspace.
- [ ] **Phase 4B**: Deterministic Java compliance rules engine (FSR, cadre ratios, built-up area, Fire NOC validity), readiness scorecard calculation.
- [ ] **Phase 5**: RAG AICTE handbook assistant with page citations, officer review workspace, audit logging.
- [ ] **Phase 6**: Integration, end-to-end testing, bug fixing, Vercel & Cloud Run deployment.

---

## 7. Phase 4A: Gemini Structured Document Extraction

### Architecture & Anti-Hallucination Pipeline
```
[Uploaded PDF] 
     │
     ▼ (Phase 3)
[Apache PDFBox 3] ── Page Text Indexed in `document_pages`
     │
     ▼ (Phase 4A Backend API: POST /api/v1/documents/{id}/extract)
[GeminiExtractionService] (Google Gemini API via Backend HttpClient)
     │  - Strict JSON prompt & temperature 0.0
     │  - Field values, 1-based sourcePage, exact evidence quote
     │
     ▼
[Java Post-Extraction Verifier]
     ├── Page boundary check (1 <= page <= totalPages)
     ├── Verbatim evidence substring verification against page text
     └── Flagging: EXTRACTED vs. NEEDS_REVIEW + warning generation
     │
     ▼
[PostgreSQL / H2 Persistence]
     ├── `document_extractions` (versioned history, warnings, model ID)
     └── `extracted_fields` (values, original values, review status, officer remarks)
     │
     ▼ (PATCH /api/v1/extractions/{extId}/fields/{fId}/review)
[Reviewing Officer Review Workspace]
     └── Authorized officers can VERIFY, FLAG_INCORRECT, or request CLARIFICATION
```

### Google AI Studio Setup & API Configuration
1. Obtain an API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Set the environment variables on the backend (or in `.env` / environment):
   ```bash
   GEMINI_API_KEY="AIzaSy..."
   GEMINI_MODEL="gemini-1.5-flash" # or gemini-2.0-flash
   ```
3. *Note on Resilience*: If `GEMINI_API_KEY` is not provided, the backend starts and operates normally; attempting an extraction will return a graceful `CONFIG_ERROR` with actionable instructions.

### Supported Document Categories
| Document Category | Extracted Fields |
| :--- | :--- |
| **`FIRE_SAFETY_NOC`** | `certificateNumber`, `issuingAuthority`, `institutionName`, `institutionAddress`, `issueDate`, `expiryDate`, `fireSafetyStatus` |
| **`LAND_TITLE_DEED`** | `documentNumber`, `landownerName`, `institutionName`, `surveyNumber`, `totalLandArea`, `areaUnit`, `landLocation`, `issuingAuthority` |
| **`BUILDING_COMPLETION_PLAN`** | `approvalNumber`, `issuingAuthority`, `institutionName`, `builtUpArea`, `areaUnit`, `approvalDate` |
| **`FACULTY_CADRE_LIST`** | `institutionName`, `department`, `facultyName`, `facultyDesignation`, `qualification`, `totalFacultyCount` |
| **`BARRIER_FREE_PWD_CERT`** | `certificateNumber`, `issuingAuthority`, `institutionName`, `issueDate`, `accessibilityStatus` |

*Unsupported categories (e.g. `AUDITED_FINANCIALS`, `AFFIDAVIT_STAMP_PAPER`) safely return `UNSUPPORTED_CATEGORY` without consuming API quota.*

### New Backend REST APIs
- `POST /api/v1/documents/{documentId}/extract`: Triggers structured Gemini extraction.
- `GET /api/v1/documents/{documentId}/extraction`: Fetches the latest extraction run.
- `GET /api/v1/documents/{documentId}/extraction/history`: Returns versioned history of previous extractions.
- `PATCH /api/v1/extractions/{extractionId}/fields/{fieldId}/review`: Reviewing Officer endpoint to verify, correct, or flag fields.

### Security & Compliance Governance
- **Zero Frontend Leakage**: The Gemini API key is never exposed to the frontend or browser.
- **Cost & Token Control**: Text is capped at 15,000 characters; raw PDF bytes are never transmitted to LLM.
- **Strict Human-in-the-Loop**: Displays disclaimer: *"AI-extracted information is advisory and may contain errors. All extracted values require human verification before regulatory use."*

