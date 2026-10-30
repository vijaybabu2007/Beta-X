package com.reguflow.ai.application.repository;

import com.reguflow.ai.application.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByCreatedByEmailOrderByCreatedAtDesc(String email);
    List<Application> findAllByOrderByCreatedAtDesc();
    Optional<Application> findByApplicationNumber(String applicationNumber);
}
