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

export interface ApplicationSummary {
  id: string;
  applicationNumber: string;
  institutionName: string;
  applicationType: ApplicationType;
  academicYear: string;
  status: ApplicationStatus;
  readinessScore: number; // 0 - 100
  submittedDate?: string;
  missingDocumentsCount: number;
  criticalDeficitsCount: number;
  lastUpdated: string;
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
