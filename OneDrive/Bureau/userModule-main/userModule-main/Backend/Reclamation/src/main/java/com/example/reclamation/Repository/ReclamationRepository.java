package com.example.reclamation.Repository;

import com.example.reclamation.Entity.Reclamation;
import com.example.reclamation.Entity.ReclamationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReclamationRepository extends JpaRepository<Reclamation, Long> {
    
    // Find all reclamations by user
    List<Reclamation> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Find reclamations by status
    List<Reclamation> findByStatusOrderByCreatedAtDesc(ReclamationStatus status);
    
    // Find reclamations by user and status
    List<Reclamation> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, ReclamationStatus status);
    
    // Count reclamations by status
    long countByStatus(ReclamationStatus status);
    
    // Count reclamations by user
    long countByUserId(Long userId);
    
    // Find all reclamations ordered by creation date
    List<Reclamation> findAllByOrderByCreatedAtDesc();
}
