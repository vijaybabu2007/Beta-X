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
- [ ] **Phase 2**: JPA entities, JWT authentication, user roles, application management REST APIs.
- [ ] **Phase 3**: PDF upload pipeline, Apache PDFBox 3 extraction, page-level evidence, OCR fallback.
- [ ] **Phase 4**: Gemini structured extraction, deterministic Java compliance rules engine, readiness reports.
- [ ] **Phase 5**: RAG AICTE handbook assistant with page citations, officer review workspace, audit logging.
- [ ] **Phase 6**: Integration, end-to-end testing, bug fixing, Vercel & Cloud Run deployment.
