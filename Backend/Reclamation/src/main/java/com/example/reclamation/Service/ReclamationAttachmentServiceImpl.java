package com.example.reclamation.Service;

import com.example.reclamation.DTO.AttachmentResponse;
import com.example.reclamation.Entity.AttachmentType;
import com.example.reclamation.Entity.NotificationType;
import com.example.reclamation.Entity.Reclamation;
import com.example.reclamation.Entity.ReclamationAttachment;
import com.example.reclamation.Entity.ReclamationHistoryType;
import com.example.reclamation.Exception.AttachmentNotFoundException;
import com.example.reclamation.Exception.BadRequestException;
import com.example.reclamation.Exception.FileStorageException;
import com.example.reclamation.Exception.ReclamationNotFoundException;
import com.example.reclamation.Repository.ReclamationAttachmentRepository;
import com.example.reclamation.Repository.ReclamationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReclamationAttachmentServiceImpl implements IReclamationAttachmentService {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private static final Set<String> ALLOWED_DOCUMENT_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private static final Set<String> ALLOWED_AUDIO_TYPES = Set.of(
            "audio/mpeg",
            "audio/wav",
            "audio/x-wav",
            "audio/mp4",
            "audio/webm",
            "audio/ogg"
    );

    private final ReclamationAttachmentRepository attachmentRepository;
    private final ReclamationRepository reclamationRepository;
    private final IReclamationHistoryService historyService;
    private final IReclamationNotificationService notificationService;

    @Value("${app.attachments.upload-dir}")
    private String uploadDirectory;

    @Override
    public AttachmentResponse uploadAttachment(Long reclamationId, MultipartFile file, Long uploadedBy) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }

        Reclamation reclamation = reclamationRepository.findById(reclamationId)
                .orElseThrow(() -> new ReclamationNotFoundException(reclamationId));

        String originalFileName = sanitizeFileName(file.getOriginalFilename());
        AttachmentType attachmentType = resolveAttachmentType(file.getContentType(), originalFileName);
        String storedFileName = UUID.randomUUID() + "_" + originalFileName;
        Path storagePath = getStorageRoot().resolve(storedFileName).normalize();

        try {
            Files.createDirectories(getStorageRoot());
            Files.copy(file.getInputStream(), storagePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new FileStorageException("Failed to store attachment", exception);
        }

        ReclamationAttachment attachment = ReclamationAttachment.builder()
                .reclamation(reclamation)
                .originalFileName(originalFileName)
                .storedFileName(storedFileName)
                .contentType(file.getContentType())
                .attachmentType(attachmentType)
                .size(file.getSize())
                .uploadedBy(uploadedBy)
                .build();

        ReclamationAttachment savedAttachment = attachmentRepository.save(attachment);
        historyService.recordEvent(
                reclamation,
                ReclamationHistoryType.ATTACHMENT_ADDED,
                "Attachment added: " + originalFileName,
                uploadedBy
        );
        if (uploadedBy != null && uploadedBy.equals(reclamation.getUserId())) {
            notificationService.notifyAdmins(
                    reclamation,
                    NotificationType.ATTACHMENT_ADDED,
                    "New attachment added",
                    "A user added an attachment to reclamation: " + reclamation.getSubject()
            );
        } else {
            notificationService.notifyUser(
                    reclamation.getUserId(),
                    reclamation,
                    NotificationType.ATTACHMENT_ADDED,
                    "New attachment on your reclamation",
                    "A new attachment was added to your reclamation"
            );
        }
        return mapToResponse(savedAttachment);
    }

    @Override
    public List<AttachmentResponse> getAttachmentsByReclamation(Long reclamationId) {
        if (!reclamationRepository.existsById(reclamationId)) {
            throw new ReclamationNotFoundException(reclamationId);
        }

        return attachmentRepository.findByReclamationReclamationIdOrderByUploadedAtDesc(reclamationId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public Resource downloadAttachment(Long attachmentId) {
        ReclamationAttachment attachment = findAttachment(attachmentId);
        Path filePath = getStorageRoot().resolve(attachment.getStoredFileName()).normalize();

        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new FileStorageException("Attachment file is not available");
            }
            return resource;
        } catch (MalformedURLException exception) {
            throw new FileStorageException("Failed to read attachment", exception);
        }
    }

    @Override
    public AttachmentResponse getAttachment(Long attachmentId) {
        return mapToResponse(findAttachment(attachmentId));
    }

    @Override
    public void deleteAttachment(Long attachmentId) {
        ReclamationAttachment attachment = findAttachment(attachmentId);
        deleteStoredFile(attachment.getStoredFileName());
        historyService.recordEvent(
                attachment.getReclamation(),
                ReclamationHistoryType.ATTACHMENT_DELETED,
                "Attachment deleted: " + attachment.getOriginalFileName(),
                attachment.getUploadedBy()
        );
        attachmentRepository.delete(attachment);
    }

    @Override
    public void deleteAllAttachmentsByReclamation(Long reclamationId) {
        List<ReclamationAttachment> attachments = attachmentRepository.findByReclamationReclamationId(reclamationId);
        for (ReclamationAttachment attachment : attachments) {
            deleteStoredFile(attachment.getStoredFileName());
        }
        attachmentRepository.deleteAll(attachments);
    }

    private ReclamationAttachment findAttachment(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new AttachmentNotFoundException(attachmentId));
    }

    private AttachmentResponse mapToResponse(ReclamationAttachment attachment) {
        return AttachmentResponse.builder()
                .attachmentId(attachment.getAttachmentId())
                .reclamationId(attachment.getReclamation().getReclamationId())
                .originalFileName(attachment.getOriginalFileName())
                .contentType(attachment.getContentType())
                .attachmentType(attachment.getAttachmentType())
                .size(attachment.getSize())
                .uploadedBy(attachment.getUploadedBy())
                .uploadedAt(attachment.getUploadedAt())
                .downloadUrl("/api/reclamations/attachments/" + attachment.getAttachmentId() + "/download")
                .build();
    }

    private Path getStorageRoot() {
        return Paths.get(uploadDirectory).toAbsolutePath().normalize();
    }

    private String sanitizeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            throw new BadRequestException("Invalid file name");
        }

        String sanitized = Paths.get(fileName).getFileName().toString().replace("..", "");
        if (sanitized.isBlank()) {
            throw new BadRequestException("Invalid file name");
        }
        return sanitized;
    }

    private void deleteStoredFile(String storedFileName) {
        Path filePath = getStorageRoot().resolve(storedFileName).normalize();
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException exception) {
            throw new FileStorageException("Failed to delete attachment file", exception);
        }
    }

    private AttachmentType resolveAttachmentType(String contentType, String originalFileName) {
        String normalizedContentType = contentType == null ? "" : contentType.toLowerCase();

        if (ALLOWED_IMAGE_TYPES.contains(normalizedContentType)) {
            return AttachmentType.IMAGE;
        }
        if (ALLOWED_DOCUMENT_TYPES.contains(normalizedContentType)) {
            return AttachmentType.DOCUMENT;
        }
        if (ALLOWED_AUDIO_TYPES.contains(normalizedContentType)) {
            return AttachmentType.AUDIO;
        }

        String lowerFileName = originalFileName.toLowerCase();
        if (lowerFileName.endsWith(".jpg") || lowerFileName.endsWith(".jpeg")
                || lowerFileName.endsWith(".png") || lowerFileName.endsWith(".webp")) {
            return AttachmentType.IMAGE;
        }
        if (lowerFileName.endsWith(".pdf") || lowerFileName.endsWith(".doc")
                || lowerFileName.endsWith(".docx")) {
            return AttachmentType.DOCUMENT;
        }
        if (lowerFileName.endsWith(".mp3") || lowerFileName.endsWith(".wav")
                || lowerFileName.endsWith(".m4a") || lowerFileName.endsWith(".webm")
                || lowerFileName.endsWith(".ogg")) {
            return AttachmentType.AUDIO;
        }

        throw new BadRequestException(
                "Unsupported file type. Allowed types: JPG, PNG, WEBP, PDF, DOC, DOCX, MP3, WAV, M4A, WEBM, OGG"
        );
    }
}
