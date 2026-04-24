package com.example.reclamation.Repository;

import com.example.reclamation.Entity.ReclamationAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReclamationAttachmentRepository extends JpaRepository<ReclamationAttachment, Long> {
    List<ReclamationAttachment> findByReclamationReclamationIdOrderByUploadedAtDesc(Long reclamationId);

    List<ReclamationAttachment> findByReclamationReclamationId(Long reclamationId);
}
