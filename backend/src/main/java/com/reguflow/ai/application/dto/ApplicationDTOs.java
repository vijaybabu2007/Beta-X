package com.reguflow.ai.application.dto;

import com.reguflow.ai.application.entity.ApplicationStatus;
import com.reguflow.ai.application.entity.ApplicationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class ApplicationDTOs {

    public static class CreateApplicationRequest {
        @NotBlank(message = "Institution name is required")
        private String institutionName;

        private String aisheCode;
        private String aictePermanentId;

        @NotNull(message = "Application type is required")
        private ApplicationType applicationType;

        private String academicYear = "2025-2026";

        private List<ProgramIntakeDTO> programIntakes;
        private ComplianceMetricDTO complianceMetric;

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

        public List<ProgramIntakeDTO> getProgramIntakes() { return programIntakes; }
        public void setProgramIntakes(List<ProgramIntakeDTO> programIntakes) { this.programIntakes = programIntakes; }

        public ComplianceMetricDTO getComplianceMetric() { return complianceMetric; }
        public void setComplianceMetric(ComplianceMetricDTO complianceMetric) { this.complianceMetric = complianceMetric; }
    }

    public static class ProgramIntakeDTO {
        private String programLevel;
        private String discipline;
        private int existingIntake;
        private int proposedIntake;
        private boolean nbaAccredited;

        public String getProgramLevel() { return programLevel; }
        public void setProgramLevel(String programLevel) { this.programLevel = programLevel; }

        public String getDiscipline() { return discipline; }
        public void setDiscipline(String discipline) { this.discipline = discipline; }

        public int getExistingIntake() { return existingIntake; }
        public void setExistingIntake(int existingIntake) { this.existingIntake = existingIntake; }

        public int getProposedIntake() { return proposedIntake; }
        public void setProposedIntake(int proposedIntake) { this.proposedIntake = proposedIntake; }

        public boolean isNbaAccredited() { return nbaAccredited; }
        public void setNbaAccredited(boolean nbaAccredited) { this.nbaAccredited = nbaAccredited; }
    }

    public static class ComplianceMetricDTO {
        private double landAreaAcres;
        private double instructionalAreaSqm;
        private double administrativeAreaSqm;
        private double amenitiesAreaSqm;
        private int totalFacultyCount;
        private int phdFacultyCount;
        private int totalStudentCount;
        private double calculatedFsr;

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
    }

    public static class UpdateStatusRequest {
        @NotNull(message = "Status is required")
        private ApplicationStatus status;
        private String remarks;

        public ApplicationStatus getStatus() { return status; }
        public void setStatus(ApplicationStatus status) { this.status = status; }

        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }
}
