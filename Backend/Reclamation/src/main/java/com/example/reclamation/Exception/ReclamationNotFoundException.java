package com.example.reclamation.Exception;

public class ReclamationNotFoundException extends RuntimeException {
    public ReclamationNotFoundException(Long id) {
        super("Reclamation not found with id " + id);
    }
}
