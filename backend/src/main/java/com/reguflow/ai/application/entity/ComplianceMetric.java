package com.reguflow.ai.application.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "compliance_metrics")
public class ComplianceMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    @JsonIgnore
    private Application application;

    private double landAreaAcres;
    private double instructionalAreaSqm;
    private double administrativeAreaSqm;
    private double amenitiesAreaSqm;

    private int totalFacultyCount;
    private int phdFacultyCount;
    private int totalStudentCount;
    private double calculatedFsr; // Faculty-Student Ratio (e.g. 15.0)

    private LocalDate fireNocValidityDate;
    private boolean pwdRampLiftAvailable = true;
    private boolean antiRaggingCommittee = true;

    public ComplianceMetric() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Application getApplication() { return application; }
    public void setApplication(Application application) { this.application = application; }

    public double getLandAreaAcres() { return landAreaAcres; }
    public void setLandAreaAcres(double landAreaAcres) { this.landAreaAcres = landAreaAcres; }

    public double getInstructionalAreaSqm() { return instructionalAreaSqm; }
    public void setInstructionalAreaSqm(double instructionalAreaSqm) { this.instructionalAreaSqm = instructionalAreaSqm; }

    public double getAdministrativeAreaSqm() { return administrativeAreaSqm; }
    public void setAdministrativeAreaSqm(double administrativeAreaSqm) { this.administrativeAreaSqm = administrativeAreaSqm; }

    public double getAmenitiesAreaSqm() { return amenitiesAreaSqm; }
    public void setAmenitiesAreaSqm(double amenitiesAreaSqm) { this.amenitiesAreaSqm = amenitiesAreaSqm; }

    public int getTotalFacultyCount() { return totalFacultyCount; }
    public void setTotalFacultyCount(int totalFacultyCount) { this.totalFacultyCount = totalFacultyCount; }

    public int getPhdFacultyCount() { return phdFacultyCount; }
    public void setPhdFacultyCount(int phdFacultyCount) { this.phdFacultyCount = phdFacultyCount; }

    public int getTotalStudentCount() { return totalStudentCount; }
    public void setTotalStudentCount(int totalStudentCount) { this.totalStudentCount = totalStudentCount; }

    public double getCalculatedFsr() { return calculatedFsr; }
    public void setCalculatedFsr(double calculatedFsr) { this.calculatedFsr = calculatedFsr; }

    public LocalDate getFireNocValidityDate() { return fireNocValidityDate; }
    public void setFireNocValidityDate(LocalDate fireNocValidityDate) { this.fireNocValidityDate = fireNocValidityDate; }

    public boolean isPwdRampLiftAvailable() { return pwdRampLiftAvailable; }
    public void setPwdRampLiftAvailable(boolean pwdRampLiftAvailable) { this.pwdRampLiftAvailable = pwdRampLiftAvailable; }

    public boolean isAntiRaggingCommittee() { return antiRaggingCommittee; }
    public void setAntiRaggingCommittee(boolean antiRaggingCommittee) { this.antiRaggingCommittee = antiRaggingCommittee; }
}
