package tn.esprit.user.DTO;

import lombok.Data;

@Data
public class FaceServiceVerifyResponse {
    private boolean success;
    private boolean matched;
    private Integer distance;
}
