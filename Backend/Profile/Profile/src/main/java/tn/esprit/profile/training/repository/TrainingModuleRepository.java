package tn.esprit.profile.training.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.profile.training.entity.TrainingModule;

import java.util.List;

public interface TrainingModuleRepository extends JpaRepository<TrainingModule, Long> {
    List<TrainingModule> findByProgram_IdOrderByIdAsc(Long programId);
}

