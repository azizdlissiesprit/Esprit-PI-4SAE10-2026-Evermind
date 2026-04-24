package com.example.reclamation.Service;

import com.example.reclamation.DTO.CommentResponse;
import com.example.reclamation.DTO.CreateCommentRequest;

import java.util.List;

public interface IReclamationCommentService {
    CommentResponse addComment(Long reclamationId, CreateCommentRequest request, Long authenticatedUserId);

    List<CommentResponse> getCommentsByReclamation(Long reclamationId);
}
