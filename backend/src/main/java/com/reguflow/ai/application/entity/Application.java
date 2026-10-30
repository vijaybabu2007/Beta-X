package com.reguflow.ai.application.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "applications")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String applicationNumber; // e.g., "AICTE-2025-APP-89421"

    @Column(nullable = false)
    private String institutionName;

    private String aisheCode;

    private String aictePermanentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationType applicationType;

    @Column(nullable = false)
    private String academicYear = "2025-2026";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status = ApplicationStatus.DRAFT;

    private int readinessScore = 0; // 0 - 100

    private int missingDocumentsCount = 0;

    private int criticalDeficitsCount = 0;

    private Instant submittedAt;

    private String createdByEmail;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProgramIntake> programIntakes = new ArrayList<>();

    @OneToOne(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private ComplianceMetric complianceMetric;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    private Instant updatedAt = Instant.now();

    public Application() {}

    public Application(String applicationNumber, String institutionName, String aisheCode, String aictePermanentId, ApplicationType applicationType, String createdByEmail) {
        this.applicationNumber = applicationNumber;
        this.institutionName = institutionName;
        this.aisheCode = aisheCode;
        this.aictePermanentId = aictePermanentId;
        this.applicationType = applicationType;
        this.createdByEmail = createdByEmail;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void addProgramIntake(ProgramIntake intake) {
        programIntakes.add(intake);
        intake.setApplication(this);
    }

    public void setComplianceMetric(ComplianceMetric metric) {
        this.complianceMetric = metric;
        if (metric != null) {
            metric.setApplication(this);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getApplicationNumber() { return applicationNumber; }
    public void setApplicationNumber(String applicationNumber) { this.applicationNumber = applicationNumber; }

    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }

    public String getAisheCode() { return aisheCode; }
    public void setAisheCode(String aisheCode) { this.aisheCode = aisheCode; }

    public String getAictePermanentId() { return aictePermanentId; }
    public void setAictePermanentId(String aictePermanentId) { this.aictePermanentId = aictePermanentId; }

    public ApplicationType getApplicationType() { return applicationType; }
    public void setApplicationType(ApplicationType applicationType) { this.applicationType = applicationType; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public int getReadinessScore() { return readinessScore; }
    public void setReadinessScore(int readinessScore) { this.readinessScore = readinessScore; }

    public int getMissingDocumentsCount() { return missingDocumentsCount; }
    public void setMissingDocumentsCount(int missingDocumentsCount) { this.missingDocumentsCount = missingDocumentsCount; }

    public int getCriticalDeficitsCount() { return criticalDeficitsCount; }
    public void setCriticalDeficitsCount(int criticalDeficitsCount) { this.criticalDeficitsCount = criticalDeficitsCount; }

    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }

    public String getCreatedByEmail() { return createdByEmail; }
    public void setCreatedByEmail(String createdByEmail) { this.createdByEmail = createdByEmail; }

    public List<ProgramIntake> getProgramIntakes() { return programIntakes; }
    public void setProgramIntakes(List<ProgramIntake> programIntakes) { this.programIntakes = programIntakes; }

    public ComplianceMetric getComplianceMetric() { return complianceMetric; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
