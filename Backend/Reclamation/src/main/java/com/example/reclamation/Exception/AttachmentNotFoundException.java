package com.example.reclamation.Exception;

public class AttachmentNotFoundException extends RuntimeException {
    public AttachmentNotFoundException(Long attachmentId) {
        super("Attachment not found with id " + attachmentId);
    }
}
