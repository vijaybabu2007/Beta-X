package com.reguflow.ai.application.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "program_intakes")
public class ProgramIntake {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    @JsonIgnore
    private Application application;

    @Column(nullable = false)
    private String programLevel; // e.g., "UG", "PG", "Diploma"

    @Column(nullable = false)
    private String discipline; // e.g., "Computer Science and Engineering"

    private int existingIntake;

    @Column(nullable = false)
    private int proposedIntake;

    private boolean nbaAccredited = false;

    public ProgramIntake() {}

    public ProgramIntake(String programLevel, String discipline, int existingIntake, int proposedIntake, boolean nbaAccredited) {
        this.programLevel = programLevel;
        this.discipline = discipline;
        this.existingIntake = existingIntake;
        this.proposedIntake = proposedIntake;
        this.nbaAccredited = nbaAccredited;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Application getApplication() { return application; }
    public void setApplication(Application application) { this.application = application; }

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
