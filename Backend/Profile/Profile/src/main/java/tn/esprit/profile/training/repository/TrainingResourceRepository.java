package tn.esprit.profile.training.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.profile.training.entity.TrainingResource;

import java.util.List;

public interface TrainingResourceRepository extends JpaRepository<TrainingResource, Long> {
    List<TrainingResource> findByModule_IdOrderByIdAsc(Long moduleId);
}

