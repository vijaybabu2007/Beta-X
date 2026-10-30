export type UserRole = 'INSTITUTION_ADMIN' | 'REVIEWING_OFFICER' | 'SYSTEM_ADMIN';

export type ApplicationType = 
  | 'NEW_INSTITUTION' 
  | 'EXTENSION_OF_APPROVAL' 
  | 'INTAKE_VARIATION' 
  | 'NEW_COURSE' 
  | 'CLOSURE';

export type ApplicationStatus = 
  | 'DRAFT' 
  | 'READINESS_CHECK_PENDING'
  | 'READINESS_CHECK_COMPLETE'
  | 'SUBMITTED' 
  | 'UNDER_SCRUTINY' 
  | 'CLARIFICATION_REQUESTED' 
  | 'EVC_RECOMMENDED'
  | 'APPROVED'
  | 'REJECTED';

export type DocumentCategory =
  | 'LAND_TITLE_DEED'
  | 'FIRE_SAFETY_NOC'
  | 'BUILDING_COMPLETION_PLAN'
  | 'FACULTY_CADRE_LIST'
  | 'BARRIER_FREE_PWD_CERT'
  | 'AUDITED_FINANCIALS'
  | 'AFFIDAVIT_STAMP_PAPER';

export type ExtractionMethod = 'PDFBOX_NATIVE' | 'DOCUMENT_AI_OCR' | 'RULE_FALLBACK';

export type VerificationVerdict = 'PENDING' | 'VERIFIED_OK' | 'DISCREPANCY_FLAGGED' | 'REJECTED';

export interface DocumentModel {
  id: number;
  applicationId: number;
  documentCategory: DocumentCategory;
  fileName: string;
  storagePath: string;
  fileSizeBytes: number;
  mimeType: string;
  sha256Hash: string;
  pageCount: number;
  extractionMethod: ExtractionMethod;
  verificationVerdict: VerificationVerdict;
  officerRemarks?: string;
  duplicateFlag: boolean;
  uploadedAt: string;
}

export interface DocumentPageModel {
  id: number;
  pageNumber: number;
  pageText: string;
  characterCount: number;
  ocrApplied: boolean;
}

export interface ApplicationSummary {
  id: string | number;
  applicationNumber: string;
  institutionName: string;
  applicationType: ApplicationType;
  academicYear: string;
  status: ApplicationStatus;
  readinessScore: number; // 0 - 100
  submittedDate?: string;
  missingDocumentsCount: number;
  criticalDeficitsCount: number;
  lastUpdated?: string;
}

export interface SystemHealth {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  environment: string;
  engine: string;
  governance: string;
  modules: Record<string, string>;
}

export type ExtractionStatus = 
  | 'COMPLETED' 
  | 'PARTIALLY_VALIDATED' 
  | 'FAILED' 
  | 'UNSUPPORTED_CATEGORY' 
  | 'CONFIG_ERROR';

export type FieldReviewStatus = 
  | 'EXTRACTED' 
  | 'NEEDS_REVIEW' 
  | 'VERIFIED' 
  | 'FLAGGED_INCORRECT' 
  | 'CLARIFICATION_REQUESTED';

export interface ExtractedFieldModel {
  id: number;
  fieldName: string;
  fieldValue: string | null;
  originalValue: string | null;
  sourcePage: number | null;
  evidenceQuotation: string | null;
  confidenceScore: number | null;
  reviewStatus: FieldReviewStatus;
  reviewedByEmail: string | null;
  reviewedAt: string | null;
  officerRemarks: string | null;
}

export interface DocumentExtractionModel {
  id: number;
  documentId: number;
  applicationId: number;
  documentCategory: DocumentCategory;
  extractionStatus: ExtractionStatus;
  modelIdentifier: string;
  version: number;
  documentSha256: string;
  fields: ExtractedFieldModel[];
  warnings: string[];
  createdAt: string;
  updatedAt: string;
}

