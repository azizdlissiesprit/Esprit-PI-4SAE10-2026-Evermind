package com.example.reclamation.Service;

import com.example.reclamation.DTO.AttachmentResponse;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IReclamationAttachmentService {
    AttachmentResponse uploadAttachment(Long reclamationId, MultipartFile file, Long uploadedBy);

    List<AttachmentResponse> getAttachmentsByReclamation(Long reclamationId);

    Resource downloadAttachment(Long attachmentId);

    AttachmentResponse getAttachment(Long attachmentId);

    void deleteAttachment(Long attachmentId);

    void deleteAllAttachmentsByReclamation(Long reclamationId);
}
