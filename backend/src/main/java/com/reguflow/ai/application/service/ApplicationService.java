package com.reguflow.ai.application.service;

import com.reguflow.ai.application.dto.ApplicationDTOs;
import com.reguflow.ai.application.entity.*;
import com.reguflow.ai.application.repository.ApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Random;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;

    public ApplicationService(ApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    public List<Application> getApplications(String userEmail, String role) {
        if ("INSTITUTION_ADMIN".equals(role) && userEmail != null) {
            List<Application> apps = applicationRepository.findByCreatedByEmailOrderByCreatedAtDesc(userEmail);
            if (apps.isEmpty()) {
                return applicationRepository.findAllByOrderByCreatedAtDesc();
            }
            return apps;
        }
        return applicationRepository.findAllByOrderByCreatedAtDesc();
    }

    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found with id: " + id));
    }

    @Transactional
    public Application createApplication(ApplicationDTOs.CreateApplicationRequest request, String createdByEmail) {
        String appNumber = "AICTE-2025-APP-" + (10000 + new Random().nextInt(90000));
        
        Application app = new Application(
                appNumber,
                request.getInstitutionName(),
                request.getAisheCode(),
                request.getAictePermanentId(),
                request.getApplicationType(),
                createdByEmail != null ? createdByEmail : "system.demo@institution.edu"
        );
        app.setAcademicYear(request.getAcademicYear());

        // Attach Program Intakes if provided
        if (request.getProgramIntakes() != null) {
            for (ApplicationDTOs.ProgramIntakeDTO dto : request.getProgramIntakes()) {
                ProgramIntake intake = new ProgramIntake(
                        dto.getProgramLevel(),
                        dto.getDiscipline(),
                        dto.getExistingIntake(),
                        dto.getProposedIntake(),
                        dto.isNbaAccredited()
                );
                app.addProgramIntake(intake);
            }
        }

        // Attach Compliance Metrics if provided
        if (request.getComplianceMetric() != null) {
            ApplicationDTOs.ComplianceMetricDTO mDto = request.getComplianceMetric();
            ComplianceMetric metric = new ComplianceMetric();
            metric.setLandAreaAcres(mDto.getLandAreaAcres());
            metric.setInstructionalAreaSqm(mDto.getInstructionalAreaSqm());
            metric.setAdministrativeAreaSqm(mDto.getAdministrativeAreaSqm());
            metric.setAmenitiesAreaSqm(mDto.getAmenitiesAreaSqm());
            metric.setTotalFacultyCount(mDto.getTotalFacultyCount());
            metric.setPhdFacultyCount(mDto.getPhdFacultyCount());
            metric.setTotalStudentCount(mDto.getTotalStudentCount());
            
            // Deterministic FSR Calculation
            if (mDto.getTotalFacultyCount() > 0) {
                double fsr = (double) mDto.getTotalStudentCount() / mDto.getTotalFacultyCount();
                metric.setCalculatedFsr(Math.round(fsr * 100.0) / 100.0);
            }
            app.setComplianceMetric(metric);
        }

        // Default readiness score for prototype draft
        app.setReadinessScore(65);
        return applicationRepository.save(app);
    }

    @Transactional
    public Application submitApplication(Long id) {
        Application app = getApplicationById(id);
        app.setStatus(ApplicationStatus.SUBMITTED);
        app.setSubmittedAt(Instant.now());
        app.setUpdatedAt(Instant.now());
        return applicationRepository.save(app);
    }

    @Transactional
    public Application updateStatus(Long id, ApplicationDTOs.UpdateStatusRequest request) {
        Application app = getApplicationById(id);
        app.setStatus(request.getStatus());
        app.setUpdatedAt(Instant.now());
        return applicationRepository.save(app);
    }
}
