package com.example.reclamation.Service;

import com.example.reclamation.DTO.CreateReclamationRequest;
import com.example.reclamation.DTO.ReclamationResponse;
import com.example.reclamation.DTO.UpdateReclamationRequest;
import com.example.reclamation.Entity.ReclamationStatus;

import java.util.List;

public interface IReclamationService {
    ReclamationResponse createReclamation(CreateReclamationRequest request, Long authenticatedUserId);

    ReclamationResponse updateReclamation(Long id, UpdateReclamationRequest request, Long actorUserId);

    ReclamationResponse getReclamationById(Long id);

    List<ReclamationResponse> getAllReclamations();

    List<ReclamationResponse> getReclamationsByUserId(Long userId);

    List<ReclamationResponse> getReclamationsByStatus(ReclamationStatus status);

    void deleteReclamation(Long id, Long actorUserId);

    long countByStatus(ReclamationStatus status);
}
