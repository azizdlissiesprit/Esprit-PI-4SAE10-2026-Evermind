package com.example.reclamation.Controller;

import com.example.reclamation.DTO.AttachmentResponse;
import com.example.reclamation.DTO.CommentResponse;
import com.example.reclamation.DTO.CreateReclamationRequest;
import com.example.reclamation.DTO.CreateCommentRequest;
import com.example.reclamation.DTO.NotificationResponse;
import com.example.reclamation.DTO.ReclamationHistoryResponse;
import com.example.reclamation.DTO.ReclamationResponse;
import com.example.reclamation.DTO.UpdateReclamationRequest;
import com.example.reclamation.Entity.ReclamationStatus;
import com.example.reclamation.Service.IReclamationAttachmentService;
import com.example.reclamation.Service.IReclamationCommentService;
import com.example.reclamation.Service.IReclamationHistoryService;
import com.example.reclamation.Service.IReclamationNotificationService;
import com.example.reclamation.Service.IReclamationService;
import com.example.reclamation.Security.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/reclamations")
@RequiredArgsConstructor
public class ReclamationController {

    private final IReclamationService reclamationService;
    private final IReclamationAttachmentService attachmentService;
    private final IReclamationCommentService commentService;
    private final IReclamationHistoryService historyService;
    private final IReclamationNotificationService notificationService;

    @PostMapping
    public ResponseEntity<ReclamationResponse> createReclamation(
            @Valid @RequestBody CreateReclamationRequest request,
            Authentication authentication
    ) {
        ReclamationResponse response = reclamationService.createReclamation(
                request,
                AuthenticatedUser.extractUserId(authentication)
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReclamationResponse> updateReclamation(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReclamationRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(reclamationService.updateReclamation(
                id,
                request,
                AuthenticatedUser.extractUserId(authentication)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReclamationResponse> getReclamationById(@PathVariable Long id) {
        return ResponseEntity.ok(reclamationService.getReclamationById(id));
    }

    @GetMapping
    public ResponseEntity<List<ReclamationResponse>> getAllReclamations() {
        return ResponseEntity.ok(reclamationService.getAllReclamations());
    }

    @GetMapping("/me")
    public ResponseEntity<List<ReclamationResponse>> getMyReclamations(Authentication authentication) {
        Long authenticatedUserId = AuthenticatedUser.extractUserId(authentication);
        if (authenticatedUserId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(reclamationService.getReclamationsByUserId(authenticatedUserId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReclamationResponse>> getReclamationsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(reclamationService.getReclamationsByUserId(userId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ReclamationResponse>> getReclamationsByStatus(@PathVariable ReclamationStatus status) {
        return ResponseEntity.ok(reclamationService.getReclamationsByStatus(status));
    }

    @GetMapping("/count/{status}")
    public ResponseEntity<Long> countByStatus(@PathVariable ReclamationStatus status) {
        return ResponseEntity.ok(reclamationService.countByStatus(status));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<ReclamationHistoryResponse>> getReclamationHistory(@PathVariable Long id) {
        return ResponseEntity.ok(historyService.getHistoryByReclamation(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                commentService.addComment(id, request, AuthenticatedUser.extractUserId(authentication))
        );
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.getCommentsByReclamation(id));
    }

    @PostMapping(value = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AttachmentResponse> uploadAttachment(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                attachmentService.uploadAttachment(id, file, AuthenticatedUser.extractUserId(authentication))
        );
    }

    @GetMapping("/{id}/attachments")
    public ResponseEntity<List<AttachmentResponse>> getAttachments(@PathVariable Long id) {
        return ResponseEntity.ok(attachmentService.getAttachmentsByReclamation(id));
    }

    @GetMapping("/attachments/{attachmentId}/download")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long attachmentId) {
        AttachmentResponse attachment = attachmentService.getAttachment(attachmentId);
        Resource resource = attachmentService.downloadAttachment(attachmentId);

        String contentType = attachment.getContentType() != null
                ? attachment.getContentType()
                : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + attachment.getOriginalFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long attachmentId) {
        attachmentService.deleteAttachment(attachmentId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReclamation(@PathVariable Long id, Authentication authentication) {
        reclamationService.deleteReclamation(id, AuthenticatedUser.extractUserId(authentication));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/notifications/me")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getUserNotifications(AuthenticatedUser.extractUserId(authentication)));
    }

    @GetMapping("/notifications/me/unread-count")
    public ResponseEntity<Long> getMyUnreadNotificationCount(Authentication authentication) {
        return ResponseEntity.ok(notificationService.countUnreadUserNotifications(AuthenticatedUser.extractUserId(authentication)));
    }

    @GetMapping("/notifications/admin")
    public ResponseEntity<List<NotificationResponse>> getAdminNotifications() {
        return ResponseEntity.ok(notificationService.getAdminNotifications());
    }

    @GetMapping("/notifications/admin/unread-count")
    public ResponseEntity<Long> getAdminUnreadNotificationCount() {
        return ResponseEntity.ok(notificationService.countUnreadAdminNotifications());
    }

    @PatchMapping("/notifications/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markNotificationAsRead(@PathVariable Long notificationId) {
        return ResponseEntity.ok(notificationService.markAsRead(notificationId));
    }
}
