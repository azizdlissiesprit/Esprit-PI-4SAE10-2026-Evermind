package com.alzheimer.stock.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceIntrouvableException extends RuntimeException {

    public ResourceIntrouvableException(String message) {
        super(message);
    }

    public ResourceIntrouvableException(String ressource, String champ, Object valeur) {
        super(String.format("%s introuvable avec %s : '%s'", ressource, champ, valeur));
    }
}
