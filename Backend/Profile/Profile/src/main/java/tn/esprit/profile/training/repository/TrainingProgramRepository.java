package tn.esprit.profile.training.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.profile.training.entity.TrainingProgram;

public interface TrainingProgramRepository extends JpaRepository<TrainingProgram, Long> {}

