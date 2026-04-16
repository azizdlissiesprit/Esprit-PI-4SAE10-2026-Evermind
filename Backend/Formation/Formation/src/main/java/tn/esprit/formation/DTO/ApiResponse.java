package tn.esprit.formation.DTO;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Wrapper standard pour toutes les réponses API
 * Permet une réponse cohérente pour les succès et les erreurs
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    
    /**
     * Statut HTTP de la réponse
     */
    private int status;
    
    /**
     * Message de succès ou d'erreur
     */
    private String message;
    
    /**
     * Les données de la réponse (pour les succès)
     */
    private T data;
    
    /**
     * Message d'erreur détaillé (pour les erreurs)
     */
    private String error;
    
    /**
     * Timestamp de la réponse
     */
    private long timestamp;
    
    /**
     * Chemin de la requête
     */
    private String path;

    /**
     * Constructeur pour les réponses de succès
     */
    public static <T> ApiResponse<T> success(int status, String message, T data) {
        return ApiResponse.<T>builder()
                .status(status)
                .message(message)
                .data(data)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    /**
     * Constructeur pour les réponses d'erreur
     */
    public static <T> ApiResponse<T> error(int status, String message, String error) {
        return ApiResponse.<T>builder()
                .status(status)
                .message(message)
                .error(error)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    /**
     * Constructeur pour les réponses d'erreur avec chemin
     */
    public static <T> ApiResponse<T> error(int status, String message, String error, String path) {
        return ApiResponse.<T>builder()
                .status(status)
                .message(message)
                .error(error)
                .path(path)
                .timestamp(System.currentTimeMillis())
                .build();
    }
}
