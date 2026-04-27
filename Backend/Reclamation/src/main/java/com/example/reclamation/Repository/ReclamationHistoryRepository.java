package com.example.reclamation.Repository;

import com.example.reclamation.Entity.ReclamationHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReclamationHistoryRepository extends JpaRepository<ReclamationHistory, Long> {
    List<ReclamationHistory> findByReclamationReclamationIdOrderByCreatedAtDesc(Long reclamationId);

    void deleteByReclamationReclamationId(Long reclamationId);
}
