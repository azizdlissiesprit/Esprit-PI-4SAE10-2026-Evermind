package tn.esprit.formation.Service;

import tn.esprit.formation.Entity.ProgrammeFormation;

import java.util.List;

public interface IProgrammeFormationService {
    ProgrammeFormation add(ProgrammeFormation p);
    ProgrammeFormation update(Long id, ProgrammeFormation p);
    void delete(Long id);
    ProgrammeFormation getById(Long id);
    List<ProgrammeFormation> getAll();
    List<ProgrammeFormation> getByTheme(String theme);
}
