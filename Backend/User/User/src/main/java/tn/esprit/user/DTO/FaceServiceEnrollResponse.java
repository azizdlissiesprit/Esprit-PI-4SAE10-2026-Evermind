package tn.esprit.user.DTO;

import lombok.Data;

@Data
public class FaceServiceEnrollResponse {
    private boolean success;
    private String signature;
    private String imagePath;
}
