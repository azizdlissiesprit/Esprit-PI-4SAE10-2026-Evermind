package com.example.reclamation.Repository;

import com.example.reclamation.Entity.ReclamationComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReclamationCommentRepository extends JpaRepository<ReclamationComment, Long> {
    List<ReclamationComment> findByReclamationReclamationIdOrderByCreatedAtAsc(Long reclamationId);

    void deleteByReclamationReclamationId(Long reclamationId);
}
