package com.reguflow.ai.application.entity;

public enum ApplicationStatus {
    DRAFT,
    READINESS_CHECK_PENDING,
    READINESS_CHECK_COMPLETE,
    SUBMITTED,
    UNDER_SCRUTINY,
    CLARIFICATION_REQUESTED,
    EVC_RECOMMENDED,
    APPROVED,
    REJECTED
}
