package com.reguflow.ai.config;

import com.reguflow.ai.application.entity.*;
import com.reguflow.ai.application.repository.ApplicationRepository;
import com.reguflow.ai.auth.entity.Role;
import com.reguflow.ai.auth.entity.User;
import com.reguflow.ai.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(
            UserRepository userRepository,
            ApplicationRepository applicationRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed Demo Users
            if (userRepository.count() == 0) {
                User instAdmin = new User(
                        "admin@apextech.edu.in",
                        passwordEncoder.encode("Admin@123"),
                        "Dr. Rajesh Verma",
                        "+91 9820123456",
                        "Apex Institute of Technology & Engineering",
                        "C-41290",
                        Role.INSTITUTION_ADMIN
                );

                User officer = new User(
                        "officer.mumbai@aicte.gov.in",
                        passwordEncoder.encode("Officer@123"),
                        "Sanjay Kulkarni (Regional Officer)",
                        "+91 9820987654",
                        "AICTE Western Regional Office, Mumbai",
                        "RO-WRO-01",
                        Role.REVIEWING_OFFICER
                );

                User sysAdmin = new User(
                        "director.approval@aicte.gov.in",
                        passwordEncoder.encode("System@123"),
                        "Prof. Anil Sahasrabudhe (Council Director)",
                        "+91 1129581000",
                        "All India Council for Technical Education, New Delhi",
                        "HQ-DEL-01",
                        Role.SYSTEM_ADMIN
                );

                userRepository.save(instAdmin);
                userRepository.save(officer);
                userRepository.save(sysAdmin);
            }

            // Seed Sample Applications
            if (applicationRepository.count() == 0) {
                // App 1: Extension of Approval
                Application app1 = new Application(
                        "AICTE-2025-APP-89421",
                        "Apex Institute of Technology & Engineering",
                        "C-41290",
                        "1-48291039",
                        ApplicationType.EXTENSION_OF_APPROVAL,
                        "admin@apextech.edu.in"
                );
                app1.setStatus(ApplicationStatus.READINESS_CHECK_COMPLETE);
                app1.setReadinessScore(84);
                app1.setMissingDocumentsCount(1);
                app1.setCriticalDeficitsCount(1);

                app1.addProgramIntake(new ProgramIntake("UG", "Computer Science & Engineering", 180, 180, true));
                app1.addProgramIntake(new ProgramIntake("UG", "Mechanical Engineering", 120, 120, false));
                app1.addProgramIntake(new ProgramIntake("PG", "Data Science & Artificial Intelligence", 30, 30, true));

                ComplianceMetric m1 = new ComplianceMetric();
                m1.setLandAreaAcres(7.5);
                m1.setInstructionalAreaSqm(4800.0);
                m1.setAdministrativeAreaSqm(1250.0);
                m1.setAmenitiesAreaSqm(950.0);
                m1.setTotalFacultyCount(42);
                m1.setPhdFacultyCount(16);
                m1.setTotalStudentCount(630);
                m1.setCalculatedFsr(15.0);
                m1.setFireNocValidityDate(LocalDate.now().plusMonths(8));
                app1.setComplianceMetric(m1);

                // App 2: Intake Variation
                Application app2 = new Application(
                        "AICTE-2025-APP-91044",
                        "Apex Institute of Technology & Engineering",
                        "C-41290",
                        "1-48291039",
                        ApplicationType.INTAKE_VARIATION,
                        "admin@apextech.edu.in"
                );
                app2.setStatus(ApplicationStatus.UNDER_SCRUTINY);
                app2.setReadinessScore(92);
                app2.setMissingDocumentsCount(0);
                app2.setCriticalDeficitsCount(0);

                app2.addProgramIntake(new ProgramIntake("UG", "Electronics & Communication Engg", 120, 180, true));

                ComplianceMetric m2 = new ComplianceMetric();
                m2.setLandAreaAcres(7.5);
                m2.setInstructionalAreaSqm(5600.0);
                m2.setAdministrativeAreaSqm(1400.0);
                m2.setAmenitiesAreaSqm(1100.0);
                m2.setTotalFacultyCount(48);
                m2.setPhdFacultyCount(20);
                m2.setTotalStudentCount(690);
                m2.setCalculatedFsr(14.37);
                m2.setFireNocValidityDate(LocalDate.now().plusMonths(14));
                app2.setComplianceMetric(m2);

                // App 3: Draft
                Application app3 = new Application(
                        "AICTE-2025-APP-92318",
                        "Apex Institute of Technology & Engineering",
                        "C-41290",
                        "1-48291039",
                        ApplicationType.NEW_COURSE,
                        "admin@apextech.edu.in"
                );
                app3.setStatus(ApplicationStatus.DRAFT);
                app3.setReadinessScore(45);
                app3.setMissingDocumentsCount(3);
                app3.setCriticalDeficitsCount(2);

                applicationRepository.save(app1);
                applicationRepository.save(app2);
                applicationRepository.save(app3);
            }
        };
    }
}
